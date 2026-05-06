import React, { useState } from "react";
import { generateHint } from "../utils/hintGenerator";

function HintButton({ puzzle, showHint }) {
  const [hint, setHint] = useState(null);

  React.useEffect(() => {
    if (showHint) {
      const generatedHint = generateHint(puzzle);
      setHint(generatedHint);
    }
  }, [showHint, puzzle]);

  if (!showHint || !hint) return null;

  return (
    <div className="hint-display">
      <div className="hint-content">
        <p>{hint.hint}</p>
        <small className="hint-level">Level: {hint.level}</small>
      </div>
    </div>
  );
}

export default HintButton;