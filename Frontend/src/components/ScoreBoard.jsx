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
        <p>Score</p>
        <strong>{score}</strong>
      </div>
      <div className="score-item">
        <p>Solved</p>
        <strong>{solvedQuestions}/{totalPuzzles}</strong>
      </div>
      <div className="score-item">
        <p>Remaining</p>
        <strong>{remainingQuestions}</strong>
      </div>
      <div className="score-item">
        <p>Current</p>
        <strong>{currentPuzzle}/{totalPuzzles}</strong>
      </div>
      <div className="progress-card">
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
