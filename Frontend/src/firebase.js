import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, isSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyC7235Xpzx_O4KVBnsRHMXHRnCty6fVvqA",
  authDomain: "brainbyte-e692f.firebaseapp.com",
  projectId: "brainbyte-e692f",
  storageBucket: "brainbyte-e692f.firebasestorage.app",
  messagingSenderId: "664462606969",
  appId: "1:664462606969:web:b65465737321ccb18acaa8",
  measurementId: "G-10TPKN51WR"
};

const LOG_PREFIX = "[BrainByte Firebase]";

let app;

try {
  app = initializeApp(firebaseConfig);
  console.info(LOG_PREFIX, "Firebase app initialized.", {
    projectId: firebaseConfig.projectId,
    messagingSenderId: firebaseConfig.messagingSenderId
  });
} catch (error) {
  console.error(LOG_PREFIX, "Firebase app initialization failed.", error);
  throw error;
}

let analyticsInstance = null;

if (typeof window !== "undefined") {
  try {
    analyticsInstance = getAnalytics(app);
    console.info(LOG_PREFIX, "Firebase Analytics initialized.");
  } catch (error) {
    console.warn(LOG_PREFIX, "Firebase Analytics initialization skipped.", error);
  }
}

export const analytics = analyticsInstance;

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") {
    console.info(LOG_PREFIX, "Firebase Messaging skipped outside the browser.");
    return null;
  }

  try {
    const supported = await isSupported();
    console.info(LOG_PREFIX, "Firebase Messaging support status.", supported);
    return supported ? getMessaging(app) : null;
  } catch (error) {
    console.error(LOG_PREFIX, "Firebase Messaging support check failed.", error);
    return null;
  }
}

export default app;
