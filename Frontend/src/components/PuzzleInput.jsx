import { useState, useEffect, useRef } from "react";
import { validateAnswer } from "../utils/puzzleGenerator";

function PuzzleInput({ answer, onSolved, disabled, timeUp }) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled && !timeUp) {
      inputRef.current?.focus();
    }
  }, [answer, disabled, timeUp]);

  useEffect(() => {
    setInput("");
    setFeedback("");
  }, [answer]);

  useEffect(() => {
    if (timeUp) {
      setFeedback(`Time's up. Correct answer: ${answer}`);
    }
  }, [timeUp, answer]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (disabled || timeUp) return;

    if (validateAnswer(input, answer)) {
      onSolved();
      setInput("");
      setFeedback("");
    } else {
      setFeedback("Try again.");
    }
  };

  return (
    <div className="puzzle-input">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="number"
          step="any"
          placeholder="Enter answer"
          value={input}
          disabled={disabled || timeUp}
          onChange={(event) => setInput(event.target.value)}
          autoComplete="off"
        />
        <button type="submit" disabled={disabled || timeUp}>
          Submit
        </button>
      </form>

      {feedback && (
        <p style={{ marginTop: "8px", fontWeight: "bold" }} className="puzzle-result">
          {feedback}
        </p>
      )}
    </div>
  );
}

export default PuzzleInput;
