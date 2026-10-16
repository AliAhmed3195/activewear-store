import type { Review } from "@/types";
import { IconStar } from "@/components/ui/icons";

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
}

function authorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ReviewsSection({ reviews, title = "Athlete feedback" }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);

  return (
    <section className="section-pad peak-reviews-section border-t border-[var(--divider)]">
      <div className="container-luxury">
        <header className="peak-reviews-head">
          <div className="peak-reviews-head-copy">
            <p className="peak-section-kicker">Community</p>
            <h2 className="peak-reviews-title font-display">{title}</h2>
            <p className="peak-reviews-sub font-ui">
              Real feedback from athletes and everyday movers
            </p>
          </div>
          <div className="peak-reviews-summary font-ui" aria-label="Average rating">
            <span className="peak-reviews-summary-value">{avg.toFixed(1)}</span>
            <div>
              <div className="peak-review-stars peak-review-stars--summary" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={14}
                    className={i < Math.round(avg) ? "is-filled" : "is-muted"}
                  />
                ))}
              </div>
              <p className="peak-reviews-summary-meta">
                {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </header>

        <div className="peak-reviews-grid">
          {reviews.map((r) => (
            <article key={r.id} className="peak-review-card">
              <span className="peak-review-quote font-display" aria-hidden="true">&ldquo;</span>
              <div className="peak-review-stars" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={13}
                    className={i < r.rating ? "is-filled" : "is-muted"}
                  />
                ))}
              </div>
              {r.title && <p className="peak-review-card-title font-ui">{r.title}</p>}
              <p className="peak-review-body font-ui">{r.body}</p>
              <footer className="peak-review-author font-ui">
                <span className="peak-review-avatar" aria-hidden="true">
                  {authorInitials(r.authorName)}
                </span>
                <span className="peak-review-name">{r.authorName}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
