import { useVoice } from '../hooks/useVoice';
import './ChildBookCard.css';

/**
 * 子ども専用の大きな絵本カード
 * グラスモーフィズム、アニメーション、バッジ等でリッチな見た目
 */
export default function ChildBookCard({ book, onClick }) {
  const { speak } = useVoice();

  const handleClick = () => {
    speak(book.title);
    onClick(book);
  };

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
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="child-book-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.querySelector('.child-book-cover-placeholder').style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Placeholder if no image */}
        <div 
          className="child-book-cover-placeholder"
          style={{ display: book.coverUrl ? 'none' : 'flex' }}
        >
          📚
        </div>
      </div>

      {/* タイトルエリア (グラスモーフィズム) */}
      <div className="child-book-info glass-card">
        <h3 className="child-book-title">{book.title}</h3>
      </div>
    </button>
  );
}
