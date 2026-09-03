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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(delta) < 40) return;
      if (delta < 0 && activeIndex < lastIndex) selectIndex(activeIndex + 1);
      if (delta > 0 && activeIndex > 0) selectIndex(activeIndex - 1);
    },
    [activeIndex, lastIndex, selectIndex]
  );

  if (gallery.length === 0) {
    return (
      <div className="product-stage aspect-[4/5] bg-surface border border-[var(--divider)] flex items-center justify-center">
        <span className="text-pearl-muted text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="product-stage-wrap">
      <div
        className="product-stage aspect-[4/5] relative bg-surface border border-[var(--divider)] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <SafeImage
          src={gallery[activeIndex]}
          alt={product.name}
          fallbackLabel={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="product-image-contain"
          priority
        />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {gallery.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => selectIndex(i)}
              className={cn(
                "relative w-16 h-20 border flex-shrink-0 overflow-hidden",
                i === activeIndex ? "border-copper" : "border-[var(--divider)]"
              )}
            >
              <SafeImage
                src={url}
                alt=""
                fallbackLabel={`View ${i + 1}`}
                fill
                sizes="64px"
                className="product-image-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
