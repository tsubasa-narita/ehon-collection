import './ParentTabBar.css';

/**
 * 親モード用タブバー
 * コンパクト、多機能タブ、スキャンボタン付き
 */
export default function ParentTabBar({ activeTab, onTabChange, onScanClick, onSwitchMode }) {
  const tabs = [
    { key: 'books', label: '書籍管理', emoji: '📚' },
    { key: 'stats', label: '統計', emoji: '📊' },
    { key: 'settings', label: '設定', emoji: '⚙️' },
  ];

  return (
    <nav className="parent-tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`parent-tab-item ${activeTab === tab.key ? 'parent-tab-active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          aria-label={tab.label}
        >
          <span className="parent-tab-emoji">{tab.emoji}</span>
          <span className="parent-tab-label">{tab.label}</span>
        </button>
      ))}

      {/* Scan button */}
      <button
        className="parent-scan-btn"
        onClick={onScanClick}
        aria-label="スキャン"
      >
        <span className="parent-scan-icon">📷</span>
      </button>

      {/* Switch to child mode */}
      <button
        className="parent-mode-switch-btn"
        onClick={onSwitchMode}
        aria-label="子どもモードに切りかえ"
        title="子どもモードに切りかえ"
      >
        🚂 こどもモード
      </button>
    </nav>
  );
}
