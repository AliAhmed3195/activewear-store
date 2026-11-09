import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

interface BestSellersSectionProps {
  products: Product[];
}

export default function BestSellersSection({ products }: BestSellersSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="section-pad peak-sec-bestsellers" id="best-sellers">
      <div className="container-luxury">
        <div className="peak-section-head">
          <div>
            <p className="peak-section-kicker">Most loved</p>
            <h2 className="peak-section-title section-title text-pearl">Best Sellers</h2>
            <p className="peak-section-sub font-ui">
              Top picks — pick your size and add to cart in one step.
            </p>
          </div>
          <Link href="/shop?sort=rating" className="peak-text-link">
            Shop best sellers <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} showSizes />
          ))}
        </div>
      </div>
    </section>
  );
}
