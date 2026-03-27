import './SkeletonLoader.css';

function SkeletonCard() {
  return (
    <div className="skeleton-book-card">
      <div className="skeleton skeleton-cover" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
    </div>
  );
}

export function SkeletonShelf({ count = 3 }) {
  return (
    <div>
      <div className="skeleton skeleton-shelf-title" />
      <div className="skeleton-shelf">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-shelf-card">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
