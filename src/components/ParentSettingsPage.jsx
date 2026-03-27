import DataSync from './DataSync';
import ReminderSettings from './ReminderSettings';
import { useMode } from '../contexts/ModeContext';
import './ParentSettingsPage.css';

/**
 * 親モード: 設定ページ
 * データ同期、リマインダー、アプリ設定を集約
 */
export default function ParentSettingsPage({ onDataChanged }) {
  const { setMode } = useMode();

  return (
    <div className="parent-settings-page page">
      <h1 className="parent-settings-title animate-fade-in">⚙️ 設定</h1>

      <div className="parent-settings-section animate-fade-in">
        <h2 className="parent-settings-section-title">🔔 リマインダー</h2>
        <ReminderSettings />
      </div>

      <div className="parent-settings-section animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="parent-settings-section-title">💾 データ管理</h2>
        <DataSync onDataChanged={onDataChanged} />
      </div>

      <div className="parent-settings-section animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="parent-settings-section-title">ℹ️ アプリ情報</h2>
        <div className="parent-settings-info">
          <p className="parent-settings-info-item">
            <span className="parent-settings-info-label">バージョン</span>
            <span className="parent-settings-info-value">2.0.0</span>
          </p>
          <p className="parent-settings-info-item">
            <span className="parent-settings-info-label">モード</span>
            <span className="parent-settings-info-value">保護者モード</span>
          </p>
        </div>
      </div>
    </div>
  );
}
