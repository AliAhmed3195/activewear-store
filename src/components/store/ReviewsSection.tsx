import type { Review } from "@/types";
import { IconStar } from "@/components/ui/icons";

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
}

export default function ReviewsSection({ reviews, title = "Athlete feedback" }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="section-pad peak-reviews">
      <div className="container-luxury">
        <div className="peak-section-head peak-section-head-center">
          <div>
            <p className="peak-section-kicker">Social proof</p>
            <h2 className="peak-section-title section-title text-pearl">{title}</h2>
            <p className="peak-section-sub font-ui">
              Real notes from athletes and everyday movers.
            </p>
          </div>
        </div>

        <div className="peak-review-grid">
          {reviews.map((r) => (
            <article key={r.id} className="peak-review">
              <div className="peak-review-stars" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={12}
                    className={i < r.rating ? "opacity-100" : "opacity-25"}
                  />
                ))}
              </div>
              <p className="peak-review-quote">“{r.body}”</p>
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
