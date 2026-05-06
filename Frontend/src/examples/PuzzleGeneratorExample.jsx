import { useState } from "react";
import {
  createGameState,
  getHint,
  resolveAnswer,
  validateAnswer
} from "../utils/puzzleGenerator";

function PuzzleGeneratorExample() {
  const [difficulty, setDifficulty] = useState("medium");
  const [gameState, setGameState] = useState(() => createGameState("medium"));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);

  const handleDifficultyChange = (event) => {
    const nextDifficulty = event.target.value;

    setDifficulty(nextDifficulty);
    setGameState(createGameState(nextDifficulty));
    setAnswer("");
    setFeedback("");
    setHintVisible(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isCorrect = validateAnswer(answer, gameState.currentPuzzle.answer);
    const nextState = resolveAnswer(gameState, answer, difficulty);

    setGameState(nextState);
    setAnswer("");
    setHintVisible(false);
    setFeedback(isCorrect ? "Correct! +10 points" : "Wrong answer. 0 points");
  };

  return (
    <section>
      <header>
        <h1>Random Puzzle Generator</h1>
        <p>Score: {gameState.score}</p>
        <p>Puzzles solved: {gameState.puzzlesSolved}</p>
      </header>

      <label>
        Difficulty
        <select value={difficulty} onChange={handleDifficultyChange}>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <article>
        <p>{gameState.currentPuzzle.question}</p>
        <small>{gameState.currentPuzzle.difficultyLabel}</small>
      </article>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="any"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Enter answer"
        />
        <button type="submit">Submit</button>
      </form>

      <button type="button" onClick={() => setHintVisible((current) => !current)}>
        Hint
      </button>

      {hintVisible && <p>{getHint(gameState.currentPuzzle)}</p>}
      {feedback && <p>{feedback}</p>}
    </section>
  );
}

export default PuzzleGeneratorExample;
