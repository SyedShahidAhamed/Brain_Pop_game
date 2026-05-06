import HeatmapCell from "./HeatmapCell";

function HeatmapGrid({ days, activity }) {
  function getActivityLevel(record) {
    if (!record?.active) return 0;
    if (record.completionPercentage >= 100) return 4;
    if (record.completionPercentage >= 60) return 3;
    if (record.completionPercentage >= 30) return 2;
    return 1;
  }

  return (
    <div className="heatmap-grid">
      {days.map((date) => {
        const record = activity[date];
        const level = getActivityLevel(record);

        return (
          <HeatmapCell
            key={date}
            level={level}
            date={date}
            solvedQuestions={record?.solvedQuestions || 0}
            completionPercentage={record?.completionPercentage || 0}
          />
        );
      })}
    </div>
  );
}

export default HeatmapGrid;
