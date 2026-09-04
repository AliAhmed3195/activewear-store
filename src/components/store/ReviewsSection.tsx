import type { Review } from "@/types";
import { IconStar } from "@/components/ui/icons";

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
}

export default function ReviewsSection({ reviews, title = "Athlete feedback" }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="section-pad border-t border-[var(--divider)]">
      <div className="container-luxury">
        <h2 className="section-title text-pearl">{title}</h2>
        <p className="section-eyebrow mt-2">Real feedback from athletes and everyday movers</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {reviews.map((r) => (
            <article key={r.id} className="luxury-card p-5">
              <div className="flex text-copper text-sm mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={12}
                    className={i < r.rating ? "opacity-100" : "opacity-25"}
                  />
                ))}
              </div>
              <p className="font-ui text-sm text-pearl-muted leading-relaxed">{r.body}</p>
              <p className="font-ui text-xs text-pearl mt-4 tracking-wide">{r.authorName}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
