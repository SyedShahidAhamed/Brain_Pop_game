const CURRENT_USER_KEY = "currentUser";

const DEFAULT_STREAK_DATA = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null
};

// Reads the active login session. This is the only global session key.
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

// Builds keys such as progress_user@email.com and streak_user@email.com.
export function getUserKey(key, email) {
  const userEmail = email || getCurrentUser()?.email;

  if (!userEmail) {
    return null;
  }

  return `${key}_${userEmail.trim().toLowerCase()}`;
}

export function readUserData(key, fallback, email) {
  const storageKey = getUserKey(key, email);

  if (!storageKey) return fallback;

  try {
    const storedData = localStorage.getItem(storageKey);
    return storedData ? JSON.parse(storedData) : fallback;
  } catch {
    return fallback;
  }
}

export function saveUserData(key, value, email) {
  const storageKey = getUserKey(key, email);

  if (!storageKey) return;

  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function initializeUserGameData(email) {
  const emptyData = {
    progress: null,
    activity: {},
    streak: DEFAULT_STREAK_DATA,
    heatmap: {},
    settings: {},
    notificationSettings: {
      enabled: false,
      muted: false,
      permission: "default",
      token: "",
      tokenUpdatedAt: null,
      reminderFrequencyMinutes: 60,
      lastReminderAt: null,
      lastError: ""
    },
    statistics: {
      totalSolved: 0,
      highScore: 0
    }
  };

  Object.entries(emptyData).forEach(([key, value]) => {
    const storageKey = getUserKey(key, email);

    if (storageKey && !localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }
  });
}

export { CURRENT_USER_KEY, DEFAULT_STREAK_DATA };
