import logoUrl from "../assets/brainbyte-logo-removebg-preview.png";

export const SHARE_PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", shortLabel: "WA" },
  { id: "twitter", label: "Twitter/X", shortLabel: "X" },
  { id: "linkedin", label: "LinkedIn", shortLabel: "IN" },
  { id: "facebook", label: "Facebook", shortLabel: "FB" },
  { id: "telegram", label: "Telegram", shortLabel: "TG" }
];

const DEFAULT_ACHIEVEMENT = {
  username: "BrainByte Player",
  rank: null,
  score: 0,
  solvedQuestions: 0,
  totalQuestions: 5,
  completionTime: "Not Finished",
  currentStreak: 0,
  completionPercentage: 0
};

function normalizeAchievement(achievement = {}) {
  return {
    ...DEFAULT_ACHIEVEMENT,
    ...achievement,
    username: achievement.username || DEFAULT_ACHIEVEMENT.username
  };
}

export function buildShareText(achievement, context = "achievement") {
  const stats = normalizeAchievement(achievement);
  const rankLine = stats.rank
    ? `I ranked #${stats.rank} today on BrainByte!`
    : `I just finished today's BrainByte challenge!`;
  const contextLine = context === "profile"
    ? `${stats.username}'s BrainByte profile is heating up.`
    : rankLine;

  return [
    `\u{1F9E0} BrainByte Achievement`,
    "",
    `\u{1F9E0} ${contextLine}`,
    "",
    `\u{1F525} Streak: ${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`,
    `\u{26A1} Solved: ${stats.solvedQuestions}/${stats.totalQuestions} puzzles`,
    `\u{23F1} Time: ${stats.completionTime || "Not Finished"}`,
    `Score: ${stats.score} pts`,
    "",
    "Can you beat my score?",
    "",
    "#BrainByte #PuzzleGame #BrainTraining"
  ].join("\n");
}

export function buildShareData(achievement, context) {
  return {
    title: "BrainByte Achievement",
    text: buildShareText(achievement, context),
    url: window.location.href
  };
}

export function getPlatformShareUrl(platformId, shareData) {
  const shareUrl = encodeURIComponent(shareData.url);
  const text = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
  const summary = encodeURIComponent(shareData.text);
  const title = encodeURIComponent(shareData.title);

  switch (platformId) {
    case "whatsapp":
      return `https://wa.me/?text=${text}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${shareUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${title}&summary=${summary}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${summary}`;
    case "telegram":
      return `https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(shareData.text)}`;
    default:
      return shareData.url;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawRoundRect(context, x, y, width, height, radius) {
  const curve = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + curve, y);
  context.arcTo(x + width, y, x + width, y + height, curve);
  context.arcTo(x + width, y + height, x, y + height, curve);
  context.arcTo(x, y + height, x, y, curve);
  context.arcTo(x, y, x + width, y, curve);
  context.closePath();
}

function drawMetric(context, label, value, x, y, width) {
  drawRoundRect(context, x, y, width, 86, 20);
  context.fillStyle = "rgba(255, 255, 255, 0.075)";
  context.fill();
  context.strokeStyle = "rgba(0, 245, 255, 0.24)";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#94a3b8";
  context.font = "700 18px Inter, Segoe UI, sans-serif";
  context.fillText(label.toUpperCase(), x + 22, y + 30);

  context.fillStyle = "#ffffff";
  context.font = "900 30px Inter, Segoe UI, sans-serif";
  context.fillText(String(value), x + 22, y + 65);
}

export async function createAchievementCardDataUrl(achievement, context = "achievement") {
  const stats = normalizeAchievement(achievement);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");

  const background = ctx.createLinearGradient(0, 0, 1200, 630);
  background.addColorStop(0, "#050816");
  background.addColorStop(0.48, "#0b1020");
  background.addColorStop(1, "#070b14");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = "rgba(0, 245, 255, 0.12)";
  ctx.shadowColor = "rgba(0, 245, 255, 0.9)";
  ctx.shadowBlur = 44;
  ctx.beginPath();
  ctx.arc(210, 115, 128, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(124, 58, 237, 0.18)";
  ctx.shadowColor = "rgba(124, 58, 237, 0.9)";
  ctx.shadowBlur = 52;
  ctx.beginPath();
  ctx.arc(980, 120, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawRoundRect(ctx, 54, 48, 1092, 534, 34);
  ctx.fillStyle = "rgba(15, 23, 42, 0.74)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 245, 255, 0.36)";
  ctx.lineWidth = 2;
  ctx.stroke();

  try {
    const logo = await loadImage(logoUrl);
    drawRoundRect(ctx, 88, 82, 92, 92, 24);
    ctx.fillStyle = "rgba(2, 6, 23, 0.82)";
    ctx.fill();
    ctx.drawImage(logo, 98, 98, 72, 56);
  } catch {
    drawRoundRect(ctx, 88, 82, 92, 92, 24);
    ctx.fillStyle = "#00f5ff";
    ctx.fill();
    ctx.fillStyle = "#031017";
    ctx.font = "900 52px Inter, Segoe UI, sans-serif";
    ctx.fillText("B", 118, 145);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "950 42px Inter, Segoe UI, sans-serif";
  ctx.fillText("BrainByte", 202, 118);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "800 22px Inter, Segoe UI, sans-serif";
  ctx.fillText("Daily leaderboard achievement", 204, 154);

  ctx.fillStyle = "#00f5ff";
  ctx.font = "900 28px Inter, Segoe UI, sans-serif";
  ctx.fillText(context === "profile" ? "PROFILE POWER" : "RANK LOCKED", 88, 246);

  ctx.fillStyle = "#ffffff";
  ctx.font = "950 88px Inter, Segoe UI, sans-serif";
  ctx.fillText(stats.rank ? `#${stats.rank}` : "Daily Run", 88, 338);

  ctx.fillStyle = "#c4b5fd";
  ctx.font = "900 34px Inter, Segoe UI, sans-serif";
  ctx.fillText(stats.username, 88, 388);

  drawMetric(ctx, "Score", `${stats.score} pts`, 88, 438, 230);
  drawMetric(ctx, "Solved", `${stats.solvedQuestions}/${stats.totalQuestions}`, 340, 438, 230);
  drawMetric(ctx, "Time", stats.completionTime || "Not Finished", 592, 438, 230);
  drawMetric(ctx, "Streak", `${stats.currentStreak} days`, 844, 438, 230);

  ctx.strokeStyle = "rgba(124, 58, 237, 0.72)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(845, 214);
  ctx.lineTo(1088, 214);
  ctx.stroke();

  ctx.fillStyle = "#f8fbff";
  ctx.font = "950 58px Inter, Segoe UI, sans-serif";
  ctx.fillText("Can you", 842, 292);
  ctx.fillText("beat this?", 842, 360);

  ctx.fillStyle = "#00f5ff";
  ctx.font = "800 24px Inter, Segoe UI, sans-serif";
  ctx.fillText("#BrainByte #PuzzleGame #BrainTraining", 88, 566);

  return canvas.toDataURL("image/png");
}

export async function downloadAchievementCard(achievement, context) {
  const dataUrl = await createAchievementCardDataUrl(achievement, context);
  const link = document.createElement("a");
  const stats = normalizeAchievement(achievement);
  const rank = stats.rank ? `rank-${stats.rank}` : "achievement";

  link.href = dataUrl;
  link.download = `brainbyte-${rank}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  return dataUrl;
}
