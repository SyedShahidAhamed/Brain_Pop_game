import { useEffect, useState } from "react";
import { getDailyQuiz, PUZZLE_BANK } from "../utils/puzzleGenerator";

function DailyQuizExample({ userId }) {
  const [dailyQuiz, setDailyQuiz] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Same user + same date returns the same 5 persisted questions.
    setDailyQuiz(getDailyQuiz(PUZZLE_BANK, userId));
  }, [userId]);

  if (!dailyQuiz) {
    return <p>Loading daily quiz...</p>;
  }

  return (
    <section>
      <h1>Daily Quiz</h1>
      <p>Date: {dailyQuiz.date}</p>

      <ol>
        {dailyQuiz.questions.map((puzzle) => (
          <li key={puzzle.id}>
            <p>{puzzle.question}</p>
            <small>{puzzle.difficulty}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default DailyQuizExample;
