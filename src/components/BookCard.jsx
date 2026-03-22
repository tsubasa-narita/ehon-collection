import './BookCard.css';

const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.style.display = 'none';
  const placeholder = e.target.parentNode.querySelector('.book-card-cover-placeholder');
  if (placeholder) placeholder.style.display = 'flex';
};

export default function BookCard({ book, onClick }) {
  return (
    <div
      className="book-card card"
      onClick={() => onClick?.(book)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(book); } }}
      role="button"
      tabIndex={0}
    >
      <div className="book-card-cover-wrap">
        {book.coverUrl && (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="book-card-cover"
            onError={handleImgError}
          />
        )}
        <div
          className="book-card-cover book-card-cover-placeholder"
          style={{ display: book.coverUrl ? 'none' : 'flex' }}
        >
          📚
        </div>
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
