import dayjs from "dayjs";

export function calculateStreakData(activityMap) {
  const activeDates = Object.keys(activityMap)
    .filter((date) => activityMap[date]?.active)
    .sort();

  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null
    };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < activeDates.length; i += 1) {
    const previousDate = dayjs(activeDates[i - 1]);
    const currentDate = dayjs(activeDates[i]);

    if (currentDate.diff(previousDate, "day") === 1) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const today = dayjs().format("YYYY-MM-DD");
  const lastActiveDate = activeDates[activeDates.length - 1];
  const yesterday = dayjs(today).subtract(1, "day").format("YYYY-MM-DD");
  const currentStreak = lastActiveDate === today || lastActiveDate === yesterday
    ? runningStreak
    : 0;

  return {
    currentStreak,
    longestStreak,
    lastActiveDate
  };
}
