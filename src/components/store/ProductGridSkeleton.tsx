export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton skeleton-card-media" />
          <div className="skeleton skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton skeleton-line" style={{ width: "80%" }} />
          <div className="skeleton skeleton-line" style={{ width: "30%" }} />
        </div>
      ))}
    </div>
  );
}
