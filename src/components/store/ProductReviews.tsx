import type { Review } from "@/types";
import { IconStar } from "@/components/ui/icons";

interface ProductReviewsProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function ProductReviews({
  reviews,
  rating,
  reviewCount,
}: ProductReviewsProps) {
  if (reviews.length === 0 && reviewCount === 0) return null;

  return (
    <section className="pdp-reviews" aria-labelledby="pdp-reviews-title">
      <div className="pdp-reviews-head">
        <div>
          <p className="peak-section-kicker">Reviews</p>
          <h2 id="pdp-reviews-title" className="peak-section-title section-title text-pearl">
            What buyers say
          </h2>
        </div>
        <div className="pdp-reviews-summary" aria-label={`Average ${rating.toFixed(1)} of 5`}>
          <strong>{rating.toFixed(1)}</strong>
          <span>
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar
                key={i}
                size={12}
                className={i < Math.round(rating) ? "opacity-100" : "opacity-25"}
              />
            ))}
          </span>
          <em>{reviewCount} reviews</em>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="font-ui text-sm text-pearl-muted">
          No written reviews yet — be the first after your order arrives.
        </p>
      ) : (
        <div className="pdp-reviews-grid">
          {reviews.map((r) => (
            <article key={r.id} className="pdp-review-card">
              <div className="pdp-review-stars" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={11}
                    className={i < r.rating ? "opacity-100" : "opacity-20"}
                  />
                ))}
              </div>
              {r.title && <h3>{r.title}</h3>}
              <p>{r.body}</p>
              <footer>
                <span>{r.authorName}</span>
                <em>Verified buyer</em>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
