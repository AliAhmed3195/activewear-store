import type { Review } from "@/types";
import { IconStar } from "@/components/ui/icons";

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
}

export default function ReviewsSection({
  reviews,
  title = "Athlete feedback",
}: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);

  return (
    <section className="section-pad peak-reviews peak-reviews-pro">
      <div className="container-luxury">
        <div className="peak-section-head peak-section-head-center reviews-head">
          <div>
            <p className="peak-section-kicker">Trusted by athletes</p>
            <h2 className="peak-section-title section-title text-pearl">{title}</h2>
            <p className="peak-section-sub font-ui reviews-sub">
              Real notes from athletes and everyday movers.
            </p>
            <div className="reviews-summary" aria-label={`Average rating ${avg.toFixed(1)} of 5`}>
              <div className="reviews-summary-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={13}
                    className={i < Math.round(avg) ? "opacity-100" : "opacity-25"}
                  />
                ))}
              </div>
              <span className="reviews-summary-score">{avg.toFixed(1)}</span>
              <span className="reviews-summary-count">{reviews.length} verified reviews</span>
            </div>
          </div>
        </div>

        <div className="peak-review-grid peak-review-grid-pro">
          {reviews.map((r) => (
            <article key={r.id} className="peak-review peak-review-pro">
              <div className="peak-review-top">
                <div className="peak-review-stars" aria-label={`${r.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar
                      key={i}
                      size={12}
                      className={i < r.rating ? "opacity-100" : "opacity-20"}
                    />
                  ))}
                </div>
                <span className="peak-review-mark" aria-hidden="true">
                  ”
                </span>
              </div>
              <p className="peak-review-quote">{r.body}</p>
              <footer className="peak-review-author">
                <span className="peak-review-avatar" aria-hidden="true">
                  {r.authorName.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{r.authorName}</strong>
                  <span>Verified buyer</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
