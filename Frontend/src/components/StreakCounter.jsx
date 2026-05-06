function StreakCounter({ currentStreak, longestStreak, lastActiveDate }) {
  return (
    <div className="streak-counter">
      <div>
        <span>Current Streak</span>
        <strong>{currentStreak} {currentStreak === 1 ? "day" : "days"}</strong>
      </div>
      <div>
        <span>Longest Streak</span>
        <strong>{longestStreak} {longestStreak === 1 ? "day" : "days"}</strong>
      </div>
      <div>
        <span>Last Active</span>
        <strong>{lastActiveDate || "Not yet"}</strong>
      </div>
    </div>
  );
}

export default StreakCounter;
