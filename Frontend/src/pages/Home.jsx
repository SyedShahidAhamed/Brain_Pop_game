import { useState, useEffect, useCallback } from "react";
import PuzzleCard from "../components/PuzzleCard";
import PuzzleInput from "../components/PuzzleInput";
import ScoreBoard from "../components/ScoreBoard";
import HeatmapContainer from "../components/HeatmapContainer";
import HintButton from "../components/HintButton";
import { recordDailyActivity } from "../utils/activityStorage";
import {
  completeCurrentPuzzle,
  getGameState,
  markHintUsed,
  skipCurrentPuzzle
} from "../utils/dailyState";

const PUZZLE_TIME_LIMIT = 60;

function Home({ currentUser, onLogout }) {
  const [gameState, setGameState] = useState(null);
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT);
  const [showHint, setShowHint] = useState(false);
  const [refreshHeatmap, setRefreshHeatmap] = useState(false);
  const userEmail = currentUser?.email;

  useEffect(() => {
    if (userEmail) {
      setGameState(getGameState(userEmail));
    }
  }, [userEmail]);

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
      completionPercentage: nextState.completionPercentage
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
    return <div className="loading">Loading today's puzzles...</div>;
  }

  return (
    <div className="game-container">
      <header className="game-topbar">
        <div>
          <h1>Daily Logic Puzzle</h1>
          <p>Welcome, <strong>{currentUser?.username}</strong>. Solve today's puzzles and keep your streak alive.</p>
        </div>
        <button className="logout-button" type="button" onClick={onLogout}>
          Logout
        </button>
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
          <h2>Congratulations!</h2>
          <p>You've completed all 5 puzzles for today!</p>
          <p>Final Score: {gameState.score} | Puzzles Solved: {gameState.solvedQuestions}</p>
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
