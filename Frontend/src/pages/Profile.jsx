import Logo from "../components/Logo";
import NotificationButton from "../components/NotificationButton";
import ShareAchievementButton from "../components/ShareAchievementButton";
import { getStatistics, getStreakData } from "../utils/activityStorage";
import { getLeaderboardRowForEmail } from "../utils/leaderboardStorage";

function Profile({ currentUser, onBack, showToast }) {
  const streakData = getStreakData(currentUser.email);
  const statistics = getStatistics(currentUser.email);
  const leaderboardRow = getLeaderboardRowForEmail(currentUser.email);
  const achievement = leaderboardRow || {
    username: currentUser.username,
    email: currentUser.email,
    rank: null,
    score: statistics.highScore || 0,
    solvedQuestions: 0,
    totalQuestions: 5,
    completionTime: "Not Finished",
    currentStreak: streakData.currentStreak || 0,
    longestStreak: streakData.longestStreak || 0,
    completionPercentage: 0
  };

  return (
    <main className="profile-page">
      <header className="leaderboard-topbar">
        <Logo size="nav" showText subtitle="Player profile" />
        <button className="leaderboard-back" type="button" onClick={onBack}>
          Back to Game
        </button>
      </header>

      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {currentUser.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-copy">
          <span className="leaderboard-kicker">BrainByte Profile</span>
          <h1>{currentUser.username}</h1>
          <p>Show off your daily rank, streak power, and puzzle performance.</p>
        </div>
        <ShareAchievementButton
          achievement={achievement}
          context="profile"
          label="Share Achievement"
          onToast={showToast}
        />
      </section>

      <section className="profile-settings-panel" aria-label="Profile settings">
        <div>
          <span className="leaderboard-kicker">Settings</span>
          <h2>Notification Center</h2>
          <p>Turn on daily challenge alerts for streak reminders across desktop, mobile, and PWA installs.</p>
        </div>
        <NotificationButton
          userEmail={currentUser.email}
          onToast={showToast}
        />
      </section>

      <section className="profile-stat-grid" aria-label="Profile stats">
        <div className="profile-stat-card">
          <span>Today's Rank</span>
          <strong>{leaderboardRow ? `#${leaderboardRow.rank}` : "--"}</strong>
        </div>
        <div className="profile-stat-card">
          <span>High Score</span>
          <strong>{statistics.highScore || 0}</strong>
        </div>
        <div className="profile-stat-card">
          <span>Current Streak</span>
          <strong>{streakData.currentStreak || 0}</strong>
        </div>
        <div className="profile-stat-card">
          <span>Total Solved</span>
          <strong>{statistics.totalSolved || 0}</strong>
        </div>
      </section>
    </main>
  );
}

export default Profile;
