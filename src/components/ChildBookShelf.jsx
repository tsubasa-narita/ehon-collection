import { useState, useEffect, useMemo } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import ChildBookCard from './ChildBookCard';
import './ChildBookShelf.css';

/**
 * 子ども専用の本棚コンポーネント (カルーセル形式)
 * 「きょうのおすすめ」「おきにいり」「ぜんぶ」など横スクロールで並ぶ
 */
export default function ChildBookShelf({ onSelectBook, refreshKey }) {
  const [books, setBooks] = useState([]);
  const { getAllBooks } = useBookDB();

  useEffect(() => {
    loadBooks();
  }, [refreshKey]);

  const loadBooks = async () => {
    const allBooks = await getAllBooks();
    setBooks(allBooks);
  };

  // 1. おきにいりの絵本
  const favorites = useMemo(() => books.filter((b) => b.favorite), [books]);

  // 2. きょうのおすすめ (未読またはランダムな1〜2冊)
  const recommendations = useMemo(() => {
    if (books.length === 0) return [];
    
    // 未読本を優先
    const unread = books.filter(b => !b.readCount || b.readCount === 0);
    let candidates = unread.length > 0 ? unread : books;
    
    // シャッフルして最大2冊選択
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(2, shuffled.length));
  }, [books]);

  if (books.length === 0) {
    return (
      <div className="child-bookshelf-empty animate-fade-in">
        <div className="empty-emoji">🚂💭📚</div>
        <p className="empty-text">
          まだえほんがないよ。<br />
          おやにとうろくしてもらおう！
        </p>
      </div>
    );
  }

  return (
    <div className="child-bookshelf-page page">
      
      {/* ヒーローセクション: おすすめ */}
      {recommendations.length > 0 && (
        <section className="shelf-section animate-fade-in">
          <h2 className="shelf-title">
            <span className="shelf-icon">✨</span>
            きょうのおすすめ
          </h2>
          <div className="shelf-carousel hero-carousel">
            {recommendations.map(book => (
              <ChildBookCard 
                key={`rec-${book.id}`} 
                book={book} 
                onClick={onSelectBook} 
              />
            ))}
          </div>
        </section>
      )}

      {/* セクション: おきにいり */}
      {favorites.length > 0 && (
        <section className="shelf-section animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="shelf-title">
            <span className="shelf-icon">💖</span>
            おきにいりのえほん
          </h2>
          <div className="shelf-carousel">
            {favorites.map(book => (
              <ChildBookCard 
                key={`fav-${book.id}`} 
                book={book} 
                onClick={onSelectBook} 
              />
            ))}
          </div>
        </section>
      )}

      {/* セクション: ぜんぶ */}
      <section className="shelf-section animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="shelf-title">
          <span className="shelf-icon">📚</span>
          ぜんぶのえほん ({books.length})
        </h2>
        <div className="shelf-carousel">
          {books.map(book => (
            <ChildBookCard 
              key={`all-${book.id}`} 
              book={book} 
              onClick={onSelectBook} 
            />
          ))}
        </div>
      </section>

    </div>
  );
}
