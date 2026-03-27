import { useState, useEffect } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import BookCard from './BookCard';
import { SkeletonGrid } from './SkeletonLoader';
import './BookList.css';

export default function BookList({ onSelectBook, refreshKey }) {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const { getAllBooks } = useBookDB();

  useEffect(() => {
    loadBooks();
  }, [refreshKey]);

  const loadBooks = async () => {
    setIsLoading(true);
    const allBooks = await getAllBooks();
    setBooks(allBooks);
    setIsLoading(false);
  };

  const filteredBooks = books.filter((b) => {
    if (filter === 'unread' && b.readCount !== 0) return false;
    if (filter === 'read' && !(b.readCount > 0)) return false;
    if (filter === 'favorite' && !b.favorite) return false;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const title = (b.title || '').toLowerCase();
      const author = (b.author || '').toLowerCase();
      if (!title.includes(q) && !author.includes(q)) return false;
    }
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

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="タイトル・さくしゃでさがす"
          aria-label="タイトル・さくしゃでさがす"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <button className="search-clear" onClick={() => setSearchText('')} aria-label="クリア">
            ✕
          </button>
        )}
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

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : filteredBooks.length === 0 ? (
        <div className="book-list-empty animate-fade-in">
          <div className="empty-emoji">🚂</div>
          <p className="empty-text">
            {searchText.trim()
              ? 'みつかりませんでした'
              : filter === 'all'
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
