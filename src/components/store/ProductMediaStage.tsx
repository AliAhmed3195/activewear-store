"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import type { Product, ProductVariant } from "@/types";
import { getGallery } from "@/lib/product-mapper";
import { cn } from "@/lib/utils";

interface ProductMediaStageProps {
  product: Product;
  variant: ProductVariant;
}

export default function ProductMediaStage({ product, variant }: ProductMediaStageProps) {
  const touchStartX = useRef<number | null>(null);
  const gallery = getGallery(product, variant.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = gallery.length - 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [variant.id]);

  const selectIndex = useCallback((i: number) => setActiveIndex(i), []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(lastIndex, i + 1));
  }, [lastIndex]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(delta) < 40) return;
      if (delta < 0) goNext();
      if (delta > 0) goPrev();
    },
    [goNext, goPrev]
  );

  if (gallery.length === 0) {
    return (
      <div className="pdp-gallery-empty">
        <span>No image</span>
      </div>
    );
  }

  return (
    <div className="pdp-gallery">
      {gallery.length > 1 && (
        <div className="pdp-thumbs" aria-label="Product thumbnails">
          {gallery.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => selectIndex(i)}
              className={cn("pdp-thumb", i === activeIndex && "is-active")}
              aria-label={`View image ${i + 1}`}
            >
              <SafeImage
                src={url}
                alt=""
                fallbackLabel={`View ${i + 1}`}
                fill
                sizes="80px"
                className="product-image-contain"
              />
            </button>
          ))}
        </div>
      )}

      <div
        className="pdp-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <SafeImage
          src={gallery[activeIndex]}
          alt={`${product.name} — image ${activeIndex + 1}`}
          fallbackLabel={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="product-image-contain pdp-stage-img"
          priority
        />

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              className="pdp-nav pdp-nav-prev"
              onClick={goPrev}
              disabled={activeIndex === 0}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="pdp-nav pdp-nav-next"
              onClick={goNext}
              disabled={activeIndex === lastIndex}
              aria-label="Next image"
            >
              ›
            </button>
            <span className="pdp-counter">
              {activeIndex + 1} / {gallery.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
