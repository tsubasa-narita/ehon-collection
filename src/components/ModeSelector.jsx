import { useVoice } from '../hooks/useVoice';
import './ModeSelector.css';

/**
 * モード選択画面
 * アプリ起動時に子どもモード / 親モードを選択
 */
export default function ModeSelector({ onSelectMode }) {
  const { speak } = useVoice();

  const handleChildMode = () => {
    speak('でんしゃモード！しゅっぱつしんこう！');
    onSelectMode('child');
  };

  const handleParentMode = () => {
    onSelectMode('parent');
  };

  return (
    <div className="mode-selector-overlay">
      {/* Animated background tracks */}
      <div className="mode-bg-tracks">
        <div className="mode-bg-train mode-bg-train-1">🚂</div>
        <div className="mode-bg-train mode-bg-train-2">🚃</div>
        <div className="mode-bg-train mode-bg-train-3">🚄</div>
      </div>

      <div className="mode-selector-content">
        <div className="mode-selector-header">
          <h1 className="mode-selector-title">📚 えほんコレクション</h1>
          <p className="mode-selector-subtitle">だれがつかう？</p>
        </div>

        <div className="mode-cards">
          {/* 子どもモード */}
          <button
            className="mode-card mode-card-child"
            onClick={handleChildMode}
            aria-label="子どもモード"
          >
            <div className="mode-card-glow mode-card-glow-child" />
            <div className="mode-card-inner">
              <span className="mode-card-emoji">🚂</span>
              <h2 className="mode-card-title">でんしゃモード</h2>
              <p className="mode-card-desc">
                えほんをよんで
                <br />
                でんしゃをあつめよう！
              </p>
              <div className="mode-card-badge">こどもよう</div>
            </div>
          </button>

          {/* 親モード */}
          <button
            className="mode-card mode-card-parent"
            onClick={handleParentMode}
            aria-label="親モード"
          >
            <div className="mode-card-glow mode-card-glow-parent" />
            <div className="mode-card-inner">
              <span className="mode-card-emoji">📖</span>
              <h2 className="mode-card-title">おやモード</h2>
              <p className="mode-card-desc">
                登録・管理
                <br />
                レポート確認
              </p>
              <div className="mode-card-badge mode-card-badge-parent">保護者用</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
