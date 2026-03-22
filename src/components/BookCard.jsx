import './BookCard.css';

export default function BookCard({ book, onClick }) {
  return (
    <div className="book-card card" onClick={() => onClick?.(book)} role="button" tabIndex={0}>
      <div className="book-card-cover-wrap">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="book-card-cover" />
        ) : (
          <div className="book-card-cover book-card-cover-placeholder">📚</div>
        )}
        {book.favorite && <span className="book-card-fav">❤️</span>}
        {book.readCount > 0 && (
          <span className="book-card-count">{book.readCount}かい</span>
        )}
      </div>
      <div className="book-card-info">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
      </div>
    </div>
  );
}
