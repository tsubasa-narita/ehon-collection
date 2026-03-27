import VoiceButton from './VoiceButton';
import './ChildTabBar.css';

/**
 * 子どもモード用タブバー
 * 大きなアイコン、ひらがな、3Dっぽい立体的なボタン
 */
export default function ChildTabBar({ activeTab, onTabChange, onScanClick, onSwitchMode }) {
  const tabs = [
    { key: 'map', label: 'マップ', emoji: '🗺️', voice: 'でんしゃマップ' },
    { key: 'books', label: 'えほん', emoji: '📚', voice: 'えほんリスト' },
    { key: 'collection', label: 'ずかん', emoji: '🏆', voice: 'でんしゃずかん' },
  ];

  return (
    <nav className="child-tab-bar">
      {tabs.map((tab) => (
        <VoiceButton
          key={tab.key}
          className={`child-tab-item ${activeTab === tab.key ? 'child-tab-active' : ''}`}
          voiceText={tab.voice}
          onClick={() => onTabChange(tab.key)}
          aria-label={tab.label}
        >
          <span className="child-tab-emoji">{tab.emoji}</span>
          <span className="child-tab-label">{tab.label}</span>
        </VoiceButton>
      ))}

      {/* Mode switch button (top-left corner) */}
      <button
        className="child-mode-switch-btn"
        onClick={onSwitchMode}
        aria-label="おやモードにきりかえ"
        title="おやモードにきりかえ"
      >
        🔧
      </button>
    </nav>
  );
}
