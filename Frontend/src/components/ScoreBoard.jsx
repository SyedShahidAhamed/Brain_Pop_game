function ScoreBoard({
  score,
  solvedQuestions,
  remainingQuestions,
  completionPercentage,
  currentPuzzle,
  totalPuzzles
}) {
  return (
    <div className="score-board">
      <div className="score-item">
        <span className="score-icon" aria-hidden="true">◈</span>
        <p>Score</p>
        <strong>{score}</strong>
      </div>
      <div className="score-item">
        <span className="score-icon" aria-hidden="true">✓</span>
        <p>Solved</p>
        <strong>{solvedQuestions}/{totalPuzzles}</strong>
      </div>
      <div className="score-item">
        <span className="score-icon" aria-hidden="true">⌁</span>
        <p>Remaining</p>
        <strong>{remainingQuestions}</strong>
      </div>
      <div className="score-item">
        <span className="score-icon" aria-hidden="true">↗</span>
        <p>Current</p>
        <strong>{currentPuzzle}/{totalPuzzles}</strong>
      </div>
      <div className="progress-card">
        <span className="score-icon" aria-hidden="true">▣</span>
        <div className="progress-label">
          <span>Completion</span>
          <strong>{completionPercentage}%</strong>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default ScoreBoard;
