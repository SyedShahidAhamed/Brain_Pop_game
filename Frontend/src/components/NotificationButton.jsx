import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNotificationSettings,
  getNotificationSupportStatus,
  requestBrainByteNotifications,
  sendTestNotification,
  updateNotificationPreferences
} from "../utils/notificationMessaging";

function BellIcon() {
  return (
    <svg className="notification-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22a2.8 2.8 0 0 0 2.58-1.72H9.42A2.8 2.8 0 0 0 12 22Zm7.16-5.84-1.62-1.86V9.62a5.58 5.58 0 0 0-4.42-5.47V3.4a1.12 1.12 0 1 0-2.24 0v.75a5.58 5.58 0 0 0-4.42 5.47v4.68l-1.62 1.86a1.18 1.18 0 0 0 .9 1.96h12.52a1.18 1.18 0 0 0 .9-1.96Z" />
    </svg>
  );
}

function NotificationButton({ userEmail, compact = false, onToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [settings, setSettings] = useState(() => getNotificationSettings(userEmail));
  const isMountedRef = useRef(true);
  const support = useMemo(() => getNotificationSupportStatus(), []);
  const isEnabled = settings.enabled && settings.permission === "granted";

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSettings(getNotificationSettings(userEmail));
  }, [userEmail]);

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

  async function enableNotifications() {
    setIsEnabling(true);

    let result;

    try {
      result = await requestBrainByteNotifications(userEmail);
    } catch (error) {
      result = {
        success: false,
        message: error?.message || "Notifications could not be enabled."
      };
    }

    if (!isMountedRef.current) return;

    setSettings(getNotificationSettings(userEmail));
    setIsEnabling(false);

    if (result.success) {
      notify(result.message);
      return;
    }

    notify(result.message, "error");
  }

  function handleDisable() {
    const nextSettings = updateNotificationPreferences(userEmail, {
      enabled: false
    });

    setSettings(nextSettings);
    notify("Notifications disabled.");
  }

  async function handleToggleChange(event) {
    if (event.target.checked) {
      await enableNotifications();
      return;
    }

    handleDisable();
  }

  async function handleTestNotification() {
    const result = await sendTestNotification(userEmail);
    notify(result.message, result.success ? "success" : "error");
  }

  return (
    <>
      <button
        className={`notification-enable-button${compact ? " notification-enable-compact" : ""}${isEnabled ? " notification-enabled" : ""}`}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <BellIcon />
        <span>{isEnabled ? "Notifications On" : "Enable Notifications"}</span>
      </button>

      {isOpen && (
        <div className="notification-modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
            aria-describedby="notification-modal-copy"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="notification-modal-close"
              type="button"
              aria-label="Close notification modal"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

            <h2 id="notification-modal-title">Enable BrainByte Alerts</h2>
            <p className="notification-simple-copy" id="notification-modal-copy">
              Get hourly reminders to maintain your streak.
            </p>

            <label className={`notification-master-toggle${isEnabled ? " notification-master-on" : ""}`}>
              <span>{isEnabled ? "ON" : "OFF"}</span>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleToggleChange}
                disabled={!support.supported || isEnabling}
              />
              <i aria-hidden="true"></i>
            </label>

            {!support.supported && (
              <p className="notification-error">{support.reason}</p>
            )}

            <div className="notification-modal-actions">
              <button
                className="notification-test-action"
                type="button"
                onClick={handleTestNotification}
                disabled={!isEnabled}
              >
                Test Notification
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default NotificationButton;
