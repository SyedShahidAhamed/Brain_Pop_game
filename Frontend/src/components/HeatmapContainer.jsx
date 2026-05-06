import dayjs from "dayjs";
import HeatmapGrid from "./HeatmapGrid";
import StreakCounter from "./StreakCounter";
import { getActivityMap, getStreakData } from "../utils/activityStorage";

function HeatmapContainer({ userEmail, refresh }) {
  const activityMap = getActivityMap(userEmail);
  const streakData = getStreakData(userEmail);

  const allDaysInYear = Array.from({ length: 365 }, (_, index) =>
    dayjs().startOf("year").add(index, "day").format("YYYY-MM-DD")
  );

  return (
    <section className="activity-section">
      <div className="section-heading">
        <h2>Activity Heatmap</h2>
        <p>Each highlighted square means you solved at least one puzzle that day.</p>
      </div>
      <StreakCounter
        currentStreak = {streakData.currentStreak}
        longestStreak = {streakData.longestStreak}
        lastActiveDate ={streakData.lastActiveDate}
      />
      <HeatmapGrid days={allDaysInYear} activity={activityMap} refresh={refresh} />
    </section>
  );
}

export default HeatmapContainer;
