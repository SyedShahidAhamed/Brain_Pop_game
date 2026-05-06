import Logo from "../components/Logo";
import ShareAchievementButton from "../components/ShareAchievementButton";
import { getLeaderboardRows } from "../utils/leaderboardStorage";

const podiumLabels = ["Gold", "Silver", "Bronze"];

function PlayerAvatar({ username }) {
  return (
    <span className="leaderboard-avatar" aria-hidden="true">
      {username.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Leaderboard({ currentUser, onBack, showToast }) {
  const rows = getLeaderboardRows();
  const topPlayers = rows.slice(0, 3);
  const activeToday = rows.filter((row) => row.activeToday).length;
  const currentPlayer = rows.find((row) => row.email === currentUser?.email);

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-topbar">
        <Logo size="nav" showText subtitle="Competitive rankings" />
        <button className="leaderboard-back" type="button" onClick={onBack}>
          Back to Game
        </button>
      </header>

      <section className="leaderboard-hero">
        <div>
          <span className="leaderboard-kicker">Global Arena</span>
          <h1>Leaderboard</h1>
          <p>Ranked by solved puzzles, completion speed, streak power, and score.</p>
        </div>
        <div className="leaderboard-hero-stack">
          <div className="active-count-card">
            <span>Players Active Today</span>
            <strong>{activeToday}</strong>
          </div>
          {currentPlayer && (
            <div className="current-achievement-card">
              <span>Your Arena Status</span>
              <strong>#{currentPlayer.rank} - {currentPlayer.score} pts</strong>
              <ShareAchievementButton
                achievement={currentPlayer}
                label="Share Achievement"
                compact
                onToast={showToast}
              />
            </div>
          )}
        </div>
      </section>

      {topPlayers.length > 0 && (
        <section className="podium-grid" aria-label="Top players">
          {topPlayers.map((player, index) => (
            <article className={`podium-card podium-${index + 1}`} key={player.email}>
              <span className="podium-label">{podiumLabels[index]}</span>
              <div className="podium-rank">#{player.rank}</div>
              <PlayerAvatar username={player.username} />
              <h2>{player.username}</h2>
              <p>Solved {player.solvedQuestions}/{player.totalQuestions}</p>
              <div className="podium-stats">
                <span>{player.completionTime}</span>
                <span>{player.currentStreak} day streak</span>
                <span>{player.score} pts</span>
              </div>
              <ShareAchievementButton
                achievement={player}
                label="Share Rank"
                compact
                onToast={showToast}
              />
            </article>
          ))}
        </section>
      )}

      <section className="leaderboard-table" aria-label="Player rankings">
        {rows.length === 0 ? (
          <div className="empty-leaderboard">
            <h2>No rankings yet</h2>
            <p>Complete a puzzle today to claim the first BrainByte leaderboard spot.</p>
          </div>
        ) : (
          rows.map((player) => (
            <article className="leaderboard-row" key={player.email}>
              <div className="rank-cell">#{player.rank}</div>
              <div className="player-cell">
                <PlayerAvatar username={player.username} />
                <div>
                  <h3>{player.username}</h3>
                  <span className={player.activeToday ? "status-online" : "status-offline"}>
                    {player.activeToday ? "Active today" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="metric-cell">
                <span>Solved</span>
                <strong>{player.solvedQuestions}/{player.totalQuestions}</strong>
              </div>
              <div className="metric-cell">
                <span>Time</span>
                <strong>{player.completionTime}</strong>
              </div>
              <div className="metric-cell">
                <span>Streak</span>
                <strong>{player.currentStreak}</strong>
              </div>
              <div className="metric-cell">
                <span>Best</span>
                <strong>{player.longestStreak}</strong>
              </div>
              <div className="metric-cell">
                <span>Score</span>
                <strong>{player.score}</strong>
              </div>
              <div className="completion-cell">
                <span>{player.completionPercentage}%</span>
                <div className="leaderboard-progress">
                  <div style={{ width: `${player.completionPercentage}%` }}></div>
                </div>
              </div>
              <div className="share-cell">
                <ShareAchievementButton
                  achievement={player}
                  label="Share Score"
                  compact
                  onToast={showToast}
                />
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default Leaderboard;
