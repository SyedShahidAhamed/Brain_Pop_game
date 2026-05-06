import React from "react";

const intensityMap = {
  0: "#1d2633",
  1: "#0c8d8d",
  2: "#00b8b8",
  3: "#34f5c5",
  4: "#d7ff6f"
};

function HeatmapCell({ level, date, solvedQuestions, completionPercentage }) {
  const title = `${date}: ${solvedQuestions} solved, ${completionPercentage}% complete`;

  return (
    <div
      className={`heatmap-cell heatmap-level-${level}`}
      title={title}
      style={{ backgroundColor: intensityMap[level] }}
    ></div>
  );
}

export default React.memo(HeatmapCell);
