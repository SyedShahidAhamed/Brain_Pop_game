import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase";
import { readUserData, saveUserData } from "../utils/userStorage";

export const FCM_VAPID_KEY = "BNS9KaILk-iStDEdou_fuT4uDs_wHG1pLEzWSJFk2kfw-rSacF2aHtx9jJZWXmu0y0-rOJdK7-tIdNbc64KZejM";
export const NOTIFICATION_SW_PATH = "/firebase-messaging-sw.js";

const REMINDER_TIMER_KEY = "brainbyteReminderTimer";
const LAST_REMINDER_KEY = "brainbyteLastReminderAt";
const MESSAGE_INDEX_KEY = "brainbyteReminderMessageIndex";
const LAST_MESSAGE_INDEX_KEY = "brainbyteLastReminderMessageIndex";
const DEFAULT_FREQUENCY_MINUTES = 60;
const MIN_REMINDER_GAP_MS = 55 * 60 * 1000;
const LOG_PREFIX = "[BrainByte Notifications]";
const VALID_WORKER_MIME_TYPES = [
  "application/javascript",
  "text/javascript",
  "application/x-javascript"
];

export const REMINDER_MESSAGES = [
  {
    title: "🧠 BrainByte",
    body: "🔥 Hurry up! Complete today's streak challenge."
  },
  {
    title: "🧠 BrainByte",
    body: "⚡ Your BrainByte streak is waiting for you."
  },
  {
    title: "🧠 BrainByte",
    body: "🏆 Someone may beat your leaderboard rank. Play now."
  },
  {
    title: "🧠 BrainByte",
    body: "🎯 Today's puzzle challenge is now live."
  },
  {
    title: "🧠 BrainByte",
    body: "🔥 Don't lose your streak today."
  },
  {
    title: "🧠 BrainByte",
    body: "🚀 Ready to train your brain today?"
  },
  {
    title: "🧠 BrainByte",
    body: "⚔️ Your next challenge is waiting. Solve it now."
  },
  {
    title: "🧠 BrainByte",
    body: "🧩 Complete today's puzzles and climb the leaderboard."
  },
  {
    title: "🧠 BrainByte",
    body: "👑 Your rivals are moving. Protect your rank."
  },
  {
    title: "🧠 BrainByte",
    body: "⏱️ One puzzle can keep the streak alive."
  },
  {
    title: "🧠 BrainByte",
    body: "💡 Daily brain training is unlocked. Jump in."
  },
  {
    title: "🧠 BrainByte",
    body: "🎮 A fresh challenge is waiting in the arena."
  }
];

const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  muted: false,
  permission: "default",
  token: "",
  tokenUpdatedAt: null,
  reminderFrequencyMinutes: DEFAULT_FREQUENCY_MINUTES,
  lastReminderAt: null,
  lastError: ""
};

let reminderTimerId = null;
let activeReminderEmail = "";

function log(message, details) {
  if (details === undefined) {
    console.info(LOG_PREFIX, message);
    return;
  }

  console.info(LOG_PREFIX, message, details);
}

function logError(message, error) {
  console.error(LOG_PREFIX, message, error);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeSettings(settings = {}) {
  return {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...settings,
    muted: false,
    reminderFrequencyMinutes: DEFAULT_FREQUENCY_MINUTES
  };
}

export function getNotificationSettings(email) {
  return normalizeSettings(readUserData("notificationSettings", DEFAULT_NOTIFICATION_SETTINGS, email));
}

export function saveNotificationSettings(email, updates) {
  const next = normalizeSettings({
    ...getNotificationSettings(email),
    ...updates
  });

  saveUserData("notificationSettings", next, email);
  return next;
}

export function getNotificationSupportStatus() {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Notifications are only available in the browser." };
  }

  if (!("Notification" in window)) {
    return { supported: false, reason: "This browser does not support notifications." };
  }

  if (!("serviceWorker" in navigator)) {
    return { supported: false, reason: "Service workers are required for push notifications." };
  }

  if (!window.isSecureContext) {
    return {
      supported: false,
      reason: "Push notifications require HTTPS or localhost."
    };
  }

  return { supported: true, reason: "" };
}

function getServiceWorkerSupportStatus() {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Service workers are only available in the browser." };
  }

  if (!("serviceWorker" in navigator)) {
    return { supported: false, reason: "This browser does not support service workers." };
  }

  if (!window.isSecureContext) {
    return { supported: false, reason: "Service workers require HTTPS or localhost." };
  }

  return { supported: true, reason: "" };
}

function getRegistrationWorkerUrl(registration) {
  return (
    registration.active?.scriptURL
    || registration.waiting?.scriptURL
    || registration.installing?.scriptURL
    || ""
  );
}

function getRegistrationScriptPath(registration) {
  const workerUrl = getRegistrationWorkerUrl(registration);

  if (!workerUrl) return "";

  try {
    return new URL(workerUrl).pathname;
  } catch (error) {
    logError("Could not parse service worker script URL.", error);
    return "";
  }
}

async function validateMessagingWorkerFile() {
  log("Validating Firebase messaging service worker file.", NOTIFICATION_SW_PATH);

  let response;

  try {
    response = await fetch(NOTIFICATION_SW_PATH, {
      cache: "no-store",
      headers: {
        Accept: "application/javascript,text/javascript,*/*;q=0.1"
      }
    });
  } catch (error) {
    logError("Firebase messaging service worker file request failed.", error);
    throw new Error("Firebase messaging service worker file could not be loaded.");
  }

  const contentType = response.headers.get("content-type") || "";
  const normalizedContentType = contentType.toLowerCase();

  if (!response.ok) {
    throw new Error(`Firebase messaging service worker file returned HTTP ${response.status}.`);
  }

  if (!VALID_WORKER_MIME_TYPES.some((mimeType) => normalizedContentType.includes(mimeType))) {
    throw new Error(
      `Firebase messaging service worker file has invalid MIME type "${contentType || "unknown"}".`
    );
  }

  const workerSource = await response.clone().text();

  if (/^\s*<!doctype html/i.test(workerSource) || /^\s*<html/i.test(workerSource)) {
    throw new Error("Firebase messaging service worker path returned HTML instead of JavaScript.");
  }

  if (/\b(?:import|export)\s+/m.test(workerSource)) {
    throw new Error("Firebase messaging service worker must be plain JavaScript without ES module syntax.");
  }

  log("Firebase messaging service worker file validated.", { contentType });
  return true;
}

async function unregisterBrokenServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const unregisterTasks = [];
  let messagingRegistration = null;

  registrations.forEach((registration) => {
    const scriptPath = getRegistrationScriptPath(registration);
    const isRootScope = registration.scope === `${window.location.origin}/`;

    if (scriptPath === NOTIFICATION_SW_PATH && !messagingRegistration) {
      messagingRegistration = registration;
      return;
    }

    if (scriptPath === NOTIFICATION_SW_PATH || isRootScope || !scriptPath) {
      log("Unregistering stale or duplicate service worker.", {
        scope: registration.scope,
        scriptPath: scriptPath || "unknown"
      });
      unregisterTasks.push(registration.unregister());
    }
  });

  await Promise.all(unregisterTasks);

  return messagingRegistration;
}

export function getNextReminderMessage() {
  const currentIndex = Number(localStorage.getItem(MESSAGE_INDEX_KEY) || 0);
  const lastIndex = Number(localStorage.getItem(LAST_MESSAGE_INDEX_KEY) || -1);
  let nextIndex = currentIndex % REMINDER_MESSAGES.length;

  if (REMINDER_MESSAGES.length > 1 && nextIndex === lastIndex) {
    nextIndex = (nextIndex + 1) % REMINDER_MESSAGES.length;
  }

  const message = REMINDER_MESSAGES[nextIndex];

  localStorage.setItem(
    MESSAGE_INDEX_KEY,
    String((nextIndex + 1) % REMINDER_MESSAGES.length)
  );
  localStorage.setItem(LAST_MESSAGE_INDEX_KEY, String(nextIndex));

  log("Selected rotating reminder message.", {
    index: nextIndex,
    body: message.body
  });

  return message;
}

export async function registerMessagingServiceWorker() {
  const support = getServiceWorkerSupportStatus();

  if (!support.supported) {
    log("Service worker registration skipped.", support.reason);
    throw new Error(support.reason);
  }

  await validateMessagingWorkerFile();

  const existingRegistration = await unregisterBrokenServiceWorkers();

  if (existingRegistration) {
    log("Firebase messaging service worker already registered.", existingRegistration.scope);
    try {
      await existingRegistration.update();
      log("Firebase messaging service worker update check completed.", existingRegistration.scope);
    } catch (error) {
      logError("Firebase messaging service worker update check failed.", error);
    }

    return existingRegistration;
  }

  let registration;

  try {
    registration = await navigator.serviceWorker.register(NOTIFICATION_SW_PATH, {
      scope: "/",
      updateViaCache: "none"
    });
  } catch (error) {
    logError("Firebase messaging service worker registration failed.", error);
    throw new Error(error?.message || "Firebase messaging service worker registration failed.");
  }

  log("Firebase messaging service worker registered.", registration.scope);
  return registration;
}

async function getMessagingToken() {
  log("Initializing Firebase Messaging.");

  let messaging = null;

  try {
    messaging = await getFirebaseMessaging();
  } catch (error) {
    logError("Firebase Messaging initialization failed.", error);
    return { token: "", error: "Firebase Messaging initialization failed." };
  }

  if (!messaging) {
    log("Firebase Messaging unsupported in this browser.");
    return { token: "", error: "Firebase Messaging is not supported in this browser." };
  }

  const serviceWorkerRegistration = await registerMessagingServiceWorker();
  let token = "";

  try {
    token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration
    });
  } catch (error) {
    logError("FCM getToken() failed.", error);
    return { token: "", error: error?.message || "Firebase notification token generation failed." };
  }

  log("FCM token generation result.", token ? { token } : "No token returned.");

  return { token, error: token ? "" : "Firebase did not return a notification token." };
}

export async function requestNotificationPermission(email) {
  const support = getNotificationSupportStatus();
  log("Notification support status.", support);

  if (!support.supported) {
    saveNotificationSettings(email, {
      enabled: false,
      permission: "unsupported",
      lastError: support.reason
    });

    return { success: false, message: support.reason };
  }

  try {
    log("Current notification permission.", Notification.permission);
    const permission = await Notification.requestPermission();
    log("Notification permission response.", permission);

    if (permission !== "granted") {
      saveNotificationSettings(email, {
        enabled: false,
        permission,
        lastError: "Notification permission was not granted."
      });

      return {
        success: false,
        message: permission === "denied"
          ? "Notifications are blocked. Enable them in your browser settings to receive streak reminders."
          : "Notifications were not enabled."
      };
    }

    const { token, error } = await getMessagingToken();

    if (!token) {
      saveNotificationSettings(email, {
        enabled: true,
        muted: false,
        permission,
        lastError: error
      });
      scheduleHourlyNotifications(email);
      log("Browser notification fallback enabled after FCM token failure.", error);

      return {
        success: true,
        message: `${error} Browser notification reminders are active as a fallback.`
      };
    }

    saveNotificationSettings(email, {
      enabled: true,
      muted: false,
      permission,
      token,
      tokenUpdatedAt: nowIso(),
      lastError: ""
    });

    scheduleHourlyNotifications(email);
    log("Notifications enabled with FCM token.", buildNotificationSubscriptionRecord(email));

    return {
      success: true,
      token,
      message: "Notifications enabled. Hourly BrainByte reminders are active."
    };
  } catch (error) {
    const message = error?.message || "Notifications could not be enabled.";
    logError("Notification permission flow failed.", error);

    saveNotificationSettings(email, {
      enabled: false,
      permission: Notification.permission,
      lastError: message
    });

    return { success: false, message };
  }
}

export function buildNotificationSubscriptionRecord(email) {
  const settings = getNotificationSettings(email);

  return {
    email,
    token: settings.token,
    enabled: settings.enabled,
    muted: settings.muted,
    permission: settings.permission,
    reminderFrequencyMinutes: settings.reminderFrequencyMinutes,
    tokenUpdatedAt: settings.tokenUpdatedAt,
    platform: navigator.userAgent,
    vapidKeyVersion: "brainbyte-web-v1"
  };
}

export async function showNotification(options = {}) {
  const support = getNotificationSupportStatus();

  if (!support.supported || Notification.permission !== "granted") {
    log("showNotification skipped.", {
      supported: support.supported,
      permission: typeof Notification !== "undefined" ? Notification.permission : "unavailable"
    });
    return false;
  }

  const { title, body } = {
    ...getNextReminderMessage(),
    ...options
  };

  const payload = {
    body,
    icon: "/brainbyte-logo-removebg-preview.png",
    badge: "/brainbyte-logo-removebg-preview.png",
    tag: options.tag || "brainbyte-hourly-reminder",
    renotify: Boolean(options.renotify),
    data: {
      url: window.location.origin
    }
  };

  try {
    const registration = await registerMessagingServiceWorker();
    await registration.showNotification(title, payload);
    log("Notification shown via service worker.", { title, tag: payload.tag });
    return true;
  } catch (error) {
    logError("Service worker notification failed. Falling back to Browser Notifications API.", error);
    new Notification(title, payload);
    log("Notification shown via Browser Notifications API.", { title, tag: payload.tag });
    return true;
  }
}

function canSendReminder(settings) {
  if (!settings.enabled || Notification.permission !== "granted") {
    return false;
  }

  const lastReminderAt = Number(localStorage.getItem(LAST_REMINDER_KEY) || 0);
  const requiredGapMs = Math.max(MIN_REMINDER_GAP_MS, DEFAULT_FREQUENCY_MINUTES * 60 * 1000);

  return Date.now() - lastReminderAt >= requiredGapMs;
}

async function triggerReminder(email) {
  const settings = getNotificationSettings(email);

  if (!canSendReminder(settings)) return false;

  const shown = await showNotification({ tag: "brainbyte-hourly-reminder" });

  if (shown) {
    localStorage.setItem(LAST_REMINDER_KEY, String(Date.now()));
    saveNotificationSettings(email, {
      lastReminderAt: nowIso(),
      lastError: ""
    });
  }

  return shown;
}

function clearReminderTimer() {
  if (reminderTimerId) {
    window.clearInterval(reminderTimerId);
    log("Active-session reminder interval cleared.", { email: activeReminderEmail });
    reminderTimerId = null;
  }

  localStorage.removeItem(REMINDER_TIMER_KEY);
}

export function scheduleHourlyNotifications(email) {
  if (reminderTimerId) {
    log("Duplicate reminder interval prevented.", { activeReminderEmail, nextEmail: email });
  }

  clearReminderTimer();

  const settings = getNotificationSettings(email);

  if (!settings.enabled || Notification.permission !== "granted") {
    log("Active-session reminder scheduling skipped.", {
      enabled: settings.enabled,
      permission: Notification.permission
    });
    return () => {};
  }

  activeReminderEmail = email;
  localStorage.setItem(REMINDER_TIMER_KEY, email);

  const intervalMs = DEFAULT_FREQUENCY_MINUTES * 60 * 1000;
  reminderTimerId = window.setInterval(() => {
    triggerReminder(email);
  }, intervalMs);
  log("Active-session reminder interval scheduled.", {
    email,
    frequencyMinutes: DEFAULT_FREQUENCY_MINUTES
  });

  navigator.serviceWorker?.controller?.postMessage({
    type: "BRAINBYTE_REMINDERS_ENABLED",
    frequencyMinutes: DEFAULT_FREQUENCY_MINUTES
  });

  return stopNotifications;
}

export async function initializeNotifications(email) {
  const support = getNotificationSupportStatus();
  log("Initializing notifications on app startup.", { email, support });

  if (!support.supported) {
    saveNotificationSettings(email, {
      enabled: false,
      permission: "unsupported",
      lastError: support.reason
    });
    return null;
  }

  try {
    await registerMessagingServiceWorker();
  } catch (error) {
    logError("Startup service worker registration failed.", error);
    saveNotificationSettings(email, {
      lastError: error?.message || "Service worker registration failed."
    });
    return getNotificationSettings(email);
  }

  const existingSettings = getNotificationSettings(email);

  if (Notification.permission === "granted") {
    if (!existingSettings.enabled) {
      log("Permission is granted, but reminders are disabled by user preference.");
      saveNotificationSettings(email, {
        permission: "granted"
      });
      return getNotificationSettings(email);
    }

    try {
      const { token } = await getMessagingToken();

      if (token) {
        saveNotificationSettings(email, {
          enabled: true,
          permission: "granted",
          token,
          tokenUpdatedAt: nowIso(),
          lastError: ""
        });
      }
    } catch {
      saveNotificationSettings(email, {
        permission: "granted",
        lastError: "FCM token refresh failed. Browser reminders remain available."
      });
    }

    scheduleHourlyNotifications(email);
  } else {
    log("Notification permission is not granted on startup.", Notification.permission);
    saveNotificationSettings(email, {
      enabled: false,
      permission: Notification.permission
    });
  }

  return getNotificationSettings(email);
}

export function stopNotifications(email = activeReminderEmail) {
  clearReminderTimer();

  if (email) {
    saveNotificationSettings(email, {
      enabled: false
    });
  }

  navigator.serviceWorker?.controller?.postMessage({
    type: "BRAINBYTE_REMINDERS_DISABLED"
  });
  log("Notifications stopped.", { email });
}

export function stopActiveSessionReminders() {
  clearReminderTimer();
  navigator.serviceWorker?.controller?.postMessage({
    type: "BRAINBYTE_ACTIVE_REMINDERS_STOPPED"
  });
}

export function updateNotificationPreferences(email, updates) {
  const settings = saveNotificationSettings(email, updates);
  log("Notification preferences updated.", {
    email,
    enabled: settings.enabled,
    reminderFrequencyMinutes: DEFAULT_FREQUENCY_MINUTES
  });

  if (settings.enabled && settings.permission === "granted") {
    scheduleHourlyNotifications(email);
  } else {
    clearReminderTimer();
  }

  return settings;
}

export async function sendTestNotification(email) {
  const settings = getNotificationSettings(email);

  if (!settings.enabled) {
    return {
      success: false,
      message: "Enable notifications before sending a test."
    };
  }

  const shown = await showNotification({
    title: "🧠 BrainByte",
    body: "⚡ Test alert: your BrainByte streak engine is ready.",
    tag: "brainbyte-test-notification",
    renotify: true
  });

  return {
    success: shown,
    message: shown ? "Test notification sent." : "Test notification could not be shown."
  };
}

export async function subscribeToForegroundMessages(onNotification) {
  let messaging = null;

  try {
    messaging = await getFirebaseMessaging();
  } catch (error) {
    logError("Foreground Firebase Messaging initialization failed.", error);
    return () => {};
  }

  if (!messaging) {
    log("Foreground FCM listener skipped because messaging is unsupported.");
    return () => {};
  }

  log("Foreground FCM listener registered.");
  return onMessage(messaging, (payload) => {
    log("Foreground FCM message received.", payload);
    onNotification({
      title: payload.notification?.title || "🧠 BrainByte",
      body: payload.notification?.body || "⚔️ Your next BrainByte challenge is waiting.",
      payload
    });
  });
}

export const requestBrainByteNotifications = requestNotificationPermission;
export const refreshStoredMessagingToken = initializeNotifications;
export const showChallengeReadyNotification = () => showNotification({
  title: "🧠 BrainByte",
  body: "🎯 Today's puzzle challenge is live. Solve it and protect your streak.",
  tag: "brainbyte-daily-challenge",
  renotify: true
});
