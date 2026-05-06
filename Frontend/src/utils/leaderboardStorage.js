import dayjs from "dayjs";
import { DEFAULT_STREAK_DATA, readUserData } from "./userStorage";

const USERS_KEY = "users";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export function formatDuration(seconds = 0) {
  if (!seconds) return "Not Finished";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

function formatCompletionTime(record) {
  if (!record.completed) return "Not Finished";
  if (record.completionTime) return record.completionTime;
  if (record.completionDurationMs) return formatDuration(Math.round(record.completionDurationMs / 1000));

  return formatDuration(record.timeTakenSeconds);
}

export function getLeaderboardRows() {
  const today = dayjs().format("YYYY-MM-DD");
  const users = readJson(USERS_KEY, []);

  return users
    .map((user) => {
      const activity = readUserData("activity", {}, user.email);
      const streak = readUserData("streak", DEFAULT_STREAK_DATA, user.email);
      const todayRecord = activity[today] || {};
      const solvedQuestions = todayRecord.solvedQuestions || 0;
      const totalQuestions = todayRecord.totalQuestions || 5;
      const completionPercentage = todayRecord.completionPercentage || 0;
      const timeTakenSeconds = todayRecord.timeTakenSeconds || 0;
      const completed = Boolean(todayRecord.completed);
      const activeToday = user.lastLoginDate === today || Boolean(todayRecord.active);

      return {
        email: user.email,
        username: user.username || user.email,
        activeToday,
        solvedQuestions,
        totalQuestions,
        score: todayRecord.score || 0,
        timeTakenSeconds,
        completed,
        completionTime: formatCompletionTime(todayRecord),
        completionDurationMs: todayRecord.completionDurationMs || 0,
        currentStreak: streak.currentStreak || 0,
        longestStreak: streak.longestStreak || 0,
        completionPercentage
      };
    })
    .filter((row) => row.activeToday || row.solvedQuestions > 0)
    .sort((first, second) => (
      second.solvedQuestions - first.solvedQuestions
      || (first.completionDurationMs || Number.MAX_SAFE_INTEGER)
        - (second.completionDurationMs || Number.MAX_SAFE_INTEGER)
      || second.currentStreak - first.currentStreak
      || second.score - first.score
      || first.username.localeCompare(second.username)
    ))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function getLeaderboardRowForEmail(email) {
  if (!email) return null;

  return getLeaderboardRows().find((row) => row.email === email) || null;
}
