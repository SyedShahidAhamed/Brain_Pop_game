import { useEffect, useMemo, useRef, useState } from "react";
import {
  SHARE_PLATFORMS,
  buildShareData,
  downloadAchievementCard,
  getPlatformShareUrl
} from "../utils/shareAchievement";

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="share-icon">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.22.09-.45.09-.7s-.04-.48-.09-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .25.04.48.09.7L8.04 9.81A3 3 0 1 0 8.04 14.2l7.12 4.18c-.04.19-.06.39-.06.6a2.9 2.9 0 1 0 2.9-2.9Z" />
    </svg>
  );
}

function ShareAchievementButton({
  achievement,
  context = "achievement",
  label = "Share Achievement",
  compact = false,
  onToast
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const copiedTimerRef = useRef(null);
  const shareData = useMemo(() => buildShareData(achievement, context), [achievement, context]);

  useEffect(() => () => {
    if (copiedTimerRef.current) {
      window.clearTimeout(copiedTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function notify(message, type = "success") {
    if (onToast) {
      onToast(message, type);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setCopied(true);
      notify("Achievement copied to clipboard.");
      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 1600);
    } catch {
      notify("Copy failed. Open a social option instead.", "error");
    }
  }

  async function downloadCard() {
    setIsDownloading(true);

    try {
      await downloadAchievementCard(achievement, context);
      notify("Achievement card downloaded.");
    } catch {
      notify("Achievement card could not be generated.", "error");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handlePrimaryShare() {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        notify("Achievement shared.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    setIsOpen(true);
  }

  function handlePlatformClick(platform) {
    window.open(getPlatformShareUrl(platform.id, shareData), "_blank", "noopener,noreferrer");
    notify(`Opening ${platform.label} share.`);
  }

  return (
    <>
      <button
        className={`share-achievement-button${compact ? " share-achievement-compact" : ""}`}
        type="button"
        onClick={handlePrimaryShare}
      >
        <ShareIcon />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className="share-modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            aria-describedby="share-modal-copy"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="share-modal-close"
              type="button"
              aria-label="Close share modal"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <span className="share-modal-kicker">Neon Broadcast</span>
            <h2 id="share-modal-title">Share Achievement</h2>
            <p id="share-modal-copy">{shareData.text}</p>

            <div className="share-social-grid">
              {SHARE_PLATFORMS.map((platform) => (
                <button
                  className={`share-social share-social-${platform.id}`}
                  type="button"
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                >
                  <span aria-hidden="true">{platform.shortLabel}</span>
                  {platform.label}
                </button>
              ))}
            </div>

            <div className="share-modal-actions">
              <button
                className={`share-copy-button${copied ? " share-copy-success" : ""}`}
                type="button"
                onClick={copyLink}
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
              <button
                className="share-download-button"
                type="button"
                onClick={downloadCard}
                disabled={isDownloading}
              >
                {isDownloading ? "Creating Card" : "Instagram Card"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default ShareAchievementButton;
