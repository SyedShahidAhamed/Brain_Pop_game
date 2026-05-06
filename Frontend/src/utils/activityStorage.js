import dayjs from "dayjs";
import { DEFAULT_STREAK_DATA, readUserData, saveUserData } from "./userStorage";

export function getActivityMap(email) {
  return readUserData("activity", {}, email);
}

export function getStreakData(email) {
  return readUserData("streak", DEFAULT_STREAK_DATA, email);
}

export function getStatistics(email) {
  return readUserData("statistics", {
    totalSolved: 0,
    highScore: 0
  }, email);
}

function calculateNextStreak(today, previousStreakData) {
  const yesterday = dayjs(today).subtract(1, "day").format("YYYY-MM-DD");

  if (previousStreakData.lastActiveDate === today) {
    return previousStreakData.currentStreak || 1;
  }

  if (previousStreakData.lastActiveDate === yesterday) {
    return (previousStreakData.currentStreak || 0) + 1;
  }

  return 1;
}

export function recordDailyActivity(email, {
  score,
  solvedQuestions,
  totalQuestions,
  completionPercentage
}) {
  const today = dayjs().format("YYYY-MM-DD");
  const activityMap = getActivityMap(email);
  const previousRecord = activityMap[today] || {};
  const nextSolvedQuestions = Math.max(previousRecord.solvedQuestions || 0, solvedQuestions);
  const nextCompletionPercentage = Math.max(
    previousRecord.completionPercentage || 0,
    completionPercentage
  );

  activityMap[today] = {
    date: today,
    active: nextSolvedQuestions > 0,
    score: Math.max(previousRecord.score || 0, score),
    solvedQuestions: nextSolvedQuestions,
    totalQuestions,
    completionPercentage: nextCompletionPercentage
  };

  saveUserData("activity", activityMap, email);
  saveUserData("heatmap", activityMap, email);

  if (nextSolvedQuestions > 0) {
    const streakData = getStreakData(email);
    const currentStreak = calculateNextStreak(today, streakData);
    const longestStreak = Math.max(streakData.longestStreak || 0, currentStreak);

    saveUserData("streak", {
      currentStreak,
      longestStreak,
      lastActiveDate: today
    }, email);
  }

  const allTimeSolved = Object.values(activityMap).reduce(
    (total, record) => total + (record.solvedQuestions || 0),
    0
  );
  const statistics = getStatistics(email);

  saveUserData("statistics", {
    totalSolved: Math.max(statistics.totalSolved || 0, allTimeSolved),
    highScore: Math.max(statistics.highScore || 0, score)
  }, email);

  return {
    activityMap: getActivityMap(email),
    streakData: getStreakData(email),
    statistics: getStatistics(email)
  };
}
