import { useState } from 'react';
import { useVoice } from '../hooks/useVoice';
import './ChildBookCard.css';

/**
 * 子ども専用の大きな絵本カード
 * グラスモーフィズム、アニメーション、バッジ等でリッチな見た目
 */
export default function ChildBookCard({ book, onClick }) {
  const { speak } = useVoice();
  const [imgFailed, setImgFailed] = useState(false);

  const handleClick = () => {
    speak(book.title);
    onClick(book);
  };

  const showPlaceholder = !book.coverUrl || imgFailed;

  return (
    <button className="child-book-card animate-float" onClick={handleClick}>
      {/* 読んだ回数バッジ */}
      {book.readCount > 0 && (
        <div className="child-book-badge child-book-badge-read">
          <span className="badge-bg">🏅</span>
          <span className="badge-text">{book.readCount}かい</span>
        </div>
      )}

      {/* ハートバッジ */}
      {book.favorite && (
        <div className="child-book-badge child-book-badge-heart">
          ❤️
        </div>
      )}

      {/* 表紙画像エリア */}
      <div className="child-book-cover-wrap">
        {!showPlaceholder && (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="child-book-cover"
            onError={() => setImgFailed(true)}
          />
        )}

        {showPlaceholder && (
          <div className="child-book-cover-placeholder">
            📚
          </div>
        )}
      </div>

      {/* タイトルエリア (グラスモーフィズム) */}
      <div className="child-book-info glass-card">
        <h3 className="child-book-title">{book.title}</h3>
      </div>
    </button>
  );
}
