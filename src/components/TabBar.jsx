import VoiceButton from './VoiceButton';
import './TabBar.css';

export default function TabBar({ activeTab, onTabChange, onScanClick }) {
  const tabs = [
    { key: 'map', label: 'マップ', emoji: '🗺️', voice: 'でんしゃマップ' },
    { key: 'stats', label: 'きろく', emoji: '📊', voice: 'きろく' },
    { key: 'books', label: 'えほん', emoji: '📚', voice: 'えほんリスト' },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <VoiceButton
          key={tab.key}
          className={`tab-item ${activeTab === tab.key ? 'tab-active' : ''}`}
          voiceText={tab.voice}
          onClick={() => onTabChange(tab.key)}
          aria-label={tab.label}
        >
          <span className="tab-emoji">{tab.emoji}</span>
          <span className="tab-label">{tab.label}</span>
        </VoiceButton>
      ))}

      {/* Center scan button */}
      <VoiceButton
        className="tab-scan-btn"
        voiceText="えほんをとうろくする"
        onClick={onScanClick}
        aria-label="スキャン"
      >
        <span className="scan-icon">📷</span>
      </VoiceButton>
    </nav>
  );
}
