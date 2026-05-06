importScripts("https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js");

const LOG_PREFIX = "[BrainByte SW]";

let messaging = null;

try {
  firebase.initializeApp({
    apiKey: "AIzaSyC7235Xpzx_O4KVBnsRHMXHRnCty6fVvqA",
    authDomain: "brainbyte-e692f.firebaseapp.com",
    projectId: "brainbyte-e692f",
    storageBucket: "brainbyte-e692f.firebasestorage.app",
    messagingSenderId: "664462606969",
    appId: "1:664462606969:web:b65465737321ccb18acaa8",
    measurementId: "G-10TPKN51WR"
  });

  messaging = firebase.messaging();
  console.info(LOG_PREFIX, "Firebase Messaging initialized.");
} catch (error) {
  console.error(LOG_PREFIX, "Firebase initialization failed.", error);
}

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.info(LOG_PREFIX, "Background FCM message received.", payload);
    const title = (payload.notification && payload.notification.title) || "🧠 BrainByte";
    const options = {
      body: (payload.notification && payload.notification.body) || "⚔️ Your next challenge is waiting. Solve it now.",
      icon: "/brainbyte-logo-removebg-preview.png",
      badge: "/brainbyte-logo-removebg-preview.png",
      tag: (payload.data && payload.data.tag) || "brainbyte-hourly-reminder",
      renotify: true,
      data: {
        url: (payload.fcmOptions && payload.fcmOptions.link) || (payload.data && payload.data.url) || self.location.origin
      }
    };

    self.registration.showNotification(title, options);
  });
}

self.addEventListener("install", (event) => {
  console.info(LOG_PREFIX, "Installing service worker.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.info(LOG_PREFIX, "Activating service worker.");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  console.info(LOG_PREFIX, "Message received.", event.data);
  if (event.data && event.data.type === "BRAINBYTE_REMINDERS_ENABLED") {
    self.registration.showNotification("🧠 BrainByte", {
      body: "⚡ Hourly streak reminders are active. Your next challenge is waiting.",
      icon: "/brainbyte-logo-removebg-preview.png",
      badge: "/brainbyte-logo-removebg-preview.png",
      tag: "brainbyte-reminders-enabled",
      data: {
        url: self.location.origin
      }
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  console.info(LOG_PREFIX, "Notification clicked.", event.notification && event.notification.tag);
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existingClient = clientList.find((client) => client.url.startsWith(self.location.origin));

      if (existingClient) {
        existingClient.focus();
        existingClient.navigate(targetUrl);
        return;
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
