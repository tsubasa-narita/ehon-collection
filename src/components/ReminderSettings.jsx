import { useReminder } from '../hooks/useReminder';
import './ReminderSettings.css';

export default function ReminderSettings() {
  const {
    reminderEnabled,
    reminderTime,
    notificationPermission,
    requestPermission,
    setReminderTime,
    toggleReminder,
  } = useReminder();

  return (
    <div className="reminder">
      {/* Toggle */}
      <div className="reminder-row">
        <span className="reminder-label">よみきかせリマインダー</span>
        <label className="reminder-switch">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => toggleReminder(e.target.checked)}
          />
          <span className="reminder-slider" />
        </label>
      </div>

      {reminderEnabled && (
        <>
          {/* Time picker */}
          <div className="reminder-row">
            <span className="reminder-label">じかん</span>
            <input
              type="time"
              className="reminder-time-input"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          {/* Permission status */}
          <div className="reminder-permission">
            {notificationPermission === 'default' && (
              <button className="btn-primary reminder-perm-btn" onClick={requestPermission}>
                🔔 つうちをゆるす
              </button>
            )}
            {notificationPermission === 'granted' && (
              <p className="reminder-perm-ok">✅ つうちOK</p>
            )}
            {notificationPermission === 'denied' && (
              <p className="reminder-perm-denied">
                ⚠️ つうちがブロックされています<br />
                <span className="reminder-perm-hint">ブラウザのせっていからゆるしてね</span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
