import { useState } from 'react';
import { getCalendarDays, formatDateKey } from '../utils/statsHelper';
import './ReadingCalendar.css';

const DAY_HEADERS = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'];

function getStampEmoji(count) {
  if (count >= 3) return '🚅';
  if (count >= 2) return '🚃';
  if (count >= 1) return '🚂';
  return null;
}

export default function ReadingCalendar({ readingData }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const days = getCalendarDays(viewYear, viewMonth);
  const todayKey = formatDateKey(now);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  const selectedBooks = selectedDate ? (readingData.get(selectedDate) || []) : [];

  return (
    <div className="calendar">
      {/* Month navigation */}
      <div className="calendar-nav">
        <button className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="まえのつき">◀</button>
        <h3 className="calendar-month-label">
          {viewYear}ねん {viewMonth + 1}がつ
        </h3>
        <button className="calendar-nav-btn" onClick={goToNextMonth} aria-label="つぎのつき">▶</button>
      </div>

      {/* Day headers */}
      <div className="calendar-grid">
        {DAY_HEADERS.map((day, i) => (
          <div
            key={day}
            className={`calendar-day-header ${i === 0 ? 'calendar-sunday' : ''} ${i === 6 ? 'calendar-saturday' : ''}`}
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, i) => {
          if (!day.date) {
            return <div key={`empty-${i}`} className="calendar-cell calendar-cell-empty" />;
          }
          const dateKey = formatDateKey(day.date);
          const books = readingData.get(dateKey) || [];
          const stamp = getStampEmoji(books.length);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const dow = day.date.getDay();

          return (
            <button
              key={dateKey}
              className={`calendar-cell ${isToday ? 'calendar-today' : ''} ${isSelected ? 'calendar-selected' : ''} ${stamp ? 'calendar-has-stamp' : ''}`}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              aria-label={`${day.dayOfMonth}にち${books.length > 0 ? `、${books.length}さつよんだ` : ''}`}
            >
              <span className={`calendar-day-num ${dow === 0 ? 'calendar-sunday' : ''} ${dow === 6 ? 'calendar-saturday' : ''}`}>
                {day.dayOfMonth}
              </span>
              {stamp && (
                <span className="calendar-stamp">{stamp}</span>
              )}
              {books.length > 1 && (
                <span className="calendar-count">{books.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date detail */}
      {selectedDate && selectedBooks.length > 0 && (
        <div className="calendar-detail animate-fade-in">
          <h4 className="calendar-detail-title">
            📖 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}によんだえほん
          </h4>
          <ul className="calendar-detail-list">
            {selectedBooks.map((book, i) => (
              <li key={i} className="calendar-detail-item">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="" className="calendar-detail-cover" />
                ) : (
                  <span className="calendar-detail-cover-placeholder">📚</span>
                )}
                <span className="calendar-detail-book-title">{book.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedDate && selectedBooks.length === 0 && (
        <div className="calendar-detail animate-fade-in">
          <p className="calendar-detail-empty">このひはえほんをよんでないよ</p>
        </div>
      )}
    </div>
  );
}
