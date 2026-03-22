import { useState, useEffect } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import BookCard from './BookCard';
import './BookList.css';

export default function BookList({ onSelectBook, refreshKey }) {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const { getAllBooks } = useBookDB();

  useEffect(() => {
    loadBooks();
  }, [refreshKey]);

  const loadBooks = async () => {
    const allBooks = await getAllBooks();
    setBooks(allBooks);
  };

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return b.readCount === 0;
    if (filter === 'read') return b.readCount > 0;
    if (filter === 'favorite') return b.favorite;
    return true;
  });

  const filters = [
    { key: 'all', label: 'ぜんぶ', emoji: '📚' },
    { key: 'unread', label: 'まだ', emoji: '📖' },
    { key: 'read', label: 'よんだ', emoji: '✅' },
    { key: 'favorite', label: 'すき', emoji: '❤️' },
  ];

  return (
    <div className="book-list-page page">
      <div className="page-header">
        <h1 className="page-title">📚 えほんリスト</h1>
        <span className="book-count">{books.length}さつ</span>
      </div>

      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? 'filter-chip-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            <span className="filter-emoji">{f.emoji}</span>
            <span className="filter-label">{f.label}</span>
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="book-list-empty animate-fade-in">
          <div className="empty-emoji">🚂</div>
          <p className="empty-text">
            {filter === 'all'
              ? 'えほんをとうろくしよう！'
              : 'このフィルタにあうえほんがないよ'}
          </p>
        </div>
      ) : (
        <div className="book-grid animate-fade-in">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onClick={onSelectBook} />
          ))}
        </div>
      )}
    </div>
  );
}
