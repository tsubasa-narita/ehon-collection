import { useState } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import { useVoice } from '../hooks/useVoice';
import { useSound } from '../hooks/useSound';
import { getUnlockedTrains, getCurrentStation } from '../utils/trainData';
import GachaAnimation from './GachaAnimation';
import ConfirmModal from './ConfirmModal';
import VoiceButton from './VoiceButton';
import './BookDetail.css';

export default function BookDetail({ book, onBack, onUpdate }) {
  const [currentBook, setCurrentBook] = useState(book);
  const [celebrating, setCelebrating] = useState(false);
  const [gachaTrain, setGachaTrain] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { markAsRead, toggleFavorite, deleteBook, getTotalReadCount } = useBookDB();
  const { speak } = useVoice();
  const { playStationArrival } = useSound();

  const handleMarkRead = async () => {
    const oldCount = await getTotalReadCount();
    const oldTrains = getUnlockedTrains(oldCount);
    const oldStation = getCurrentStation(oldCount);

    const updated = await markAsRead(currentBook.id);
    if (updated) {
      setCurrentBook(updated);
      setCelebrating(true);
      speak('すごい！えほんをよめたね！');
      if (onUpdate) onUpdate(updated);

      const newCount = await getTotalReadCount();
      const newTrains = getUnlockedTrains(newCount);
      const newStation = getCurrentStation(newCount);

      if (newStation.id !== oldStation.id) {
        playStationArrival(newStation.id);
      }

      const newlyUnlocked = newTrains.filter(
        (t) => !oldTrains.find((o) => o.id === t.id)
      );

      setTimeout(() => {
        setCelebrating(false);
        if (newlyUnlocked.length > 0) {
          setGachaTrain(newlyUnlocked[0]);
        }
      }, 3000);
    }
  };

  const handleToggleFavorite = async () => {
    const updated = await toggleFavorite(currentBook.id);
    if (updated) {
      setCurrentBook(updated);
      if (updated.favorite) {
        speak('おきにいりにしたよ！');
      }
      if (onUpdate) onUpdate(updated);
    }
  };

  const handleDelete = async () => {
    await deleteBook(currentBook.id);
    setShowDeleteConfirm(false);
    if (onUpdate) onUpdate(null);
    onBack();
  };

  return (
    <div className="book-detail-page page">
      {/* Celebration overlay */}
      {celebrating && (
        <div className="celebration-overlay">
          <div className="celebration-content animate-bounce-in">
            <div className="celebration-emoji">🎉🚂🎉</div>
            <h2 className="celebration-text">すごい！</h2>
            <p className="celebration-sub">えほんをよめたね！</p>
            <div className="confetti-container">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#ff6b35', '#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#e91e63'][i % 6],
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gacha animation */}
      {gachaTrain && (
        <GachaAnimation
          train={gachaTrain}
          onComplete={() => setGachaTrain(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="🗑️ さくじょ"
          message="このえほんをけしてもいいですか？"
          confirmLabel="けす"
          cancelLabel="やめる"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="detail-back-btn" onClick={onBack} aria-label="もどる">
          <span className="detail-back-icon">←</span>
          <span className="detail-back-label">もどる</span>
        </button>
        <button
          className="detail-delete-btn"
          onClick={() => setShowDeleteConfirm(true)}
          aria-label="さくじょ"
        >
          🗑️
        </button>
      </div>

      {/* Cover */}
      <div className="detail-cover-section animate-fade-in">
        {currentBook.coverUrl ? (
          <img src={currentBook.coverUrl} alt={currentBook.title} className="detail-cover" />
        ) : (
          <div className="detail-cover detail-cover-placeholder">📚</div>
        )}
      </div>

      {/* Info */}
      <div className="detail-info animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h1 className="detail-title">{currentBook.title}</h1>
        <p className="detail-author">✍️ {currentBook.author}</p>
        {currentBook.publisher && (
          <p className="detail-publisher">🏢 {currentBook.publisher}</p>
        )}
      </div>

      {/* Stats */}
      <div className="detail-stats animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="stat-card">
          <span className="stat-number">{currentBook.readCount || 0}</span>
          <span className="stat-label">かい よんだ</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{currentBook.favorite ? '❤️' : '🤍'}</span>
          <span className="stat-label">おきにいり</span>
        </div>
      </div>

      {/* Actions */}
      <div className="detail-actions animate-fade-in" style={{ animationDelay: '300ms' }}>
        <VoiceButton
          className="btn-success read-btn animate-pulse"
          voiceText="よんだ ボタン"
          onClick={handleMarkRead}
        >
          📖 よんだ！
        </VoiceButton>

        <VoiceButton
          className={`btn-ghost fav-btn ${currentBook.favorite ? 'fav-active' : ''}`}
          voiceText={currentBook.favorite ? 'おきにいりをとりけす' : 'おきにいりにする'}
          onClick={handleToggleFavorite}
        >
          {currentBook.favorite ? '❤️ おきにいり' : '🤍 おきにいりにする'}
        </VoiceButton>
      </div>

      {/* Read history */}
      {currentBook.readDates && currentBook.readDates.length > 0 && (
        <div className="detail-history animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="history-title">📅 よんだひ</h3>
          <ul className="history-list">
            {currentBook.readDates.slice(-5).reverse().map((date, i) => (
              <li key={i} className="history-item">
                🚂 {new Date(date).toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
