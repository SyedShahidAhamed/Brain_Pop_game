import { CURRENT_USER_KEY, initializeUserGameData } from "./userStorage";
import dayjs from "dayjs";

const USERS_KEY = "users";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function readUsers() {
  return readJson(USERS_KEY, []);
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function publicUser(user) {
  return {
    username: user.username,
    email: user.email
  };
}

function saveCurrentUser(user) {
  const sessionUser = publicUser(user);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  initializeUserGameData(sessionUser.email);

  const today = dayjs().format("YYYY-MM-DD");
  saveUsers(readUsers().map((storedUser) => (
    storedUser.email === sessionUser.email
      ? { ...storedUser, lastLoginDate: today }
      : storedUser
  )));

  return sessionUser;
}

export function getCurrentUser() {
  const currentUser = readJson(CURRENT_USER_KEY, null);

  if (currentUser?.email) {
    initializeUserGameData(currentUser.email);
    return currentUser;
  }

  return null;
}

export function signupUser({ username, email, password }) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    return { success: false, message: "An account with this email already exists." };
  }

  // Demo-only storage: passwords are saved in localStorage for project demonstration.
  const newUser = {
    username: username.trim(),
    email: normalizedEmail,
    password
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: saveCurrentUser(newUser) };
}

export function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const matchedUser = users.find(
    (user) => user.email === normalizedEmail && user.password === password
  );

  if (!matchedUser) {
    return { success: false, message: "Invalid email or password." };
  }

  return { success: true, user: saveCurrentUser(matchedUser) };
}

export function logoutUser() {
  // Logout clears only the active session. User-specific game data stays saved.
  localStorage.removeItem(CURRENT_USER_KEY);
}
