import { useState, useEffect, useCallback } from "react";
import PuzzleCard from "../components/PuzzleCard";
import PuzzleInput from "../components/PuzzleInput";
import ScoreBoard from "../components/ScoreBoard";
import HeatmapContainer from "../components/HeatmapContainer";
import HintButton from "../components/HintButton";
import Logo from "../components/Logo";
import NotificationButton from "../components/NotificationButton";
import ShareAchievementButton from "../components/ShareAchievementButton";
import { getStreakData, recordDailyActivity } from "../utils/activityStorage";
import {
  completeCurrentPuzzle,
  getGameState,
  markHintUsed,
  skipCurrentPuzzle
} from "../utils/dailyState";
import { getLeaderboardRowForEmail } from "../utils/leaderboardStorage";

const PUZZLE_TIME_LIMIT = 60;

function Home({ currentUser, onLogout, onNavigate, showToast }) {
  const [gameState, setGameState] = useState(null);
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT);
  const [showHint, setShowHint] = useState(false);
  const [refreshHeatmap, setRefreshHeatmap] = useState(false);
  const userEmail = currentUser?.email;
  const streakData = userEmail
    ? getStreakData(userEmail)
    : { currentStreak: 0, longestStreak: 0 };
  const leaderboardAchievement = getLeaderboardRowForEmail(userEmail);
  const shareAchievement = leaderboardAchievement || {
    username: currentUser?.username,
    email: userEmail,
    score: gameState?.score || 0,
    solvedQuestions: gameState?.solvedQuestions || 0,
    totalQuestions: gameState?.totalQuestions || 5,
    completionPercentage: gameState?.completionPercentage || 0,
    completionTime: gameState?.completionTime || "Not Finished",
    currentStreak: streakData.currentStreak || 0,
    longestStreak: streakData.longestStreak || 0
  };

  useEffect(() => {
    if (userEmail) {
      setGameState(getGameState(userEmail));
    }
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail || !gameState?.completed) return;

    recordDailyActivity(userEmail, {
      score: gameState.score,
      solvedQuestions: gameState.solvedQuestions,
      totalQuestions: gameState.totalQuestions,
      completionPercentage: gameState.completionPercentage,
      timeTakenSeconds: gameState.timeTakenSeconds,
      completed: gameState.completed,
      completedAt: gameState.completedAt,
      completionDurationMs: gameState.completionDurationMs,
      completionTime: gameState.completionTime
    });
  }, [gameState, userEmail]);

  const handleTimeout = useCallback(() => {
    const nextState = skipCurrentPuzzle(userEmail);

    setGameState(nextState);
    setTimeLeft(PUZZLE_TIME_LIMIT);
    setShowHint(false);
    setRefreshHeatmap((current) => !current);
  }, [userEmail]);

  useEffect(() => {
    if (!gameState?.currentPuzzle) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.currentPuzzle, handleTimeout]);

  const handleSolved = useCallback(() => {
    const nextState = completeCurrentPuzzle(userEmail);

    recordDailyActivity(userEmail, {
      score: nextState.score,
      solvedQuestions: nextState.solvedQuestions,
      totalQuestions: nextState.totalQuestions,
      completionPercentage: nextState.completionPercentage,
      timeTakenSeconds: nextState.timeTakenSeconds,
      completed: nextState.completed,
      completedAt: nextState.completedAt,
      completionDurationMs: nextState.completionDurationMs,
      completionTime: nextState.completionTime
    });

    setGameState(nextState);
    setTimeLeft(PUZZLE_TIME_LIMIT);
    setShowHint(false);
    setRefreshHeatmap((current) => !current);
  }, [userEmail]);

  const handleHintClick = useCallback(() => {
    if (gameState.hintUsed) return;

    setGameState(markHintUsed(userEmail));
    setShowHint(true);
  }, [gameState, userEmail]);

  if (!gameState) {
    return (
      <div className="loading brand-loading">
        <Logo size="hero" showText subtitle="Loading your daily challenge..." />
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-topbar">
        <Logo size="nav" showText subtitle="Daily Logic Puzzle" className="topbar-brand" />

        <div className="topbar-actions">
          <div className="nav-streak" aria-label={`Current streak ${streakData.currentStreak} days`}>
            <span>Streak</span>
            <strong>{streakData.currentStreak}</strong>
          </div>
          <div className="user-chip">
            <span>{currentUser?.username}</span>
          </div>
          <NotificationButton
            userEmail={userEmail}
            compact
            onToast={showToast}
          />
          <button
            className="leaderboard-button"
            type="button"
            onClick={() => onNavigate("/profile")}
          >
            Profile
          </button>
          <button
            className="leaderboard-button"
            type="button"
            onClick={() => onNavigate("/leaderboard")}
          >
            <span aria-hidden="true">🏆</span>
            Leaderboard
          </button>
          <button className="logout-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <ScoreBoard
        score={gameState.score}
        solvedQuestions={gameState.solvedQuestions}
        remainingQuestions={gameState.remainingQuestions}
        completionPercentage={gameState.completionPercentage}
        currentPuzzle={Math.min(gameState.currentIndex + 1, gameState.totalQuestions)}
        totalPuzzles={gameState.totalQuestions}
      />

      {gameState.isComplete ? (
        <div className="completion-message">
          <h2>{gameState.completed ? "Congratulations!" : "Daily run finished"}</h2>
          <p>
            {gameState.completed
              ? "You've completed all 5 puzzles for today!"
              : "Today's puzzle queue is finished. Complete every puzzle to lock a leaderboard time."}
          </p>
          {gameState.completed && (
            <div className="completion-time-badge">
              <span>Timer Complete</span>
              <strong>Finished in {gameState.completionTime}</strong>
            </div>
          )}
          <p>Final Score: {gameState.score} | Puzzles Solved: {gameState.solvedQuestions}</p>
          <div className="completion-share-actions">
            <ShareAchievementButton
              achievement={shareAchievement}
              label="Share Achievement"
              onToast={showToast}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="puzzle-header">
            <div className="puzzle-info">
              <span className="puzzle-number">
                Puzzle {gameState.currentIndex + 1}/{gameState.totalQuestions}
              </span>
              <span className={`difficulty-badge ${gameState.currentPuzzle?.difficultyLabel.toLowerCase()}`}>
                {gameState.currentPuzzle?.difficultyLabel}
              </span>
            </div>
            <div className={`timer ${timeLeft <= 10 ? "warning" : ""}`}>
              {timeLeft}s
            </div>
          </div>

          {gameState.currentPuzzle && (
            <>
              <PuzzleCard
                question={gameState.currentPuzzle.question}
              />

              {showHint && (
                <HintButton puzzle={gameState.currentPuzzle} showHint={true} />
              )}

              <div className="controls">
                <PuzzleInput
                  key={gameState.currentPuzzle.question}
                  answer={gameState.currentPuzzle.answer}
                  onSolved={handleSolved}
                  disabled={false}
                  timeUp={timeLeft === 0}
                />

                <button
                  className="hint-button"
                  onClick={handleHintClick}
                  disabled={!gameState.hintAvailable || timeLeft === 0}
                  title={gameState.hintAvailable ? "Use your daily hint" : "Hint already used today"}
                >
                  {gameState.hintAvailable ? "Use Hint" : "Hint Used"}
                </button>
              </div>
            </>
          )}
        </>
      )}

      <HeatmapContainer userEmail={userEmail} refresh={refreshHeatmap} />
    </div>
  );
}

export default Home;
