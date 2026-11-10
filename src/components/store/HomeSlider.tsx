"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

export type HomeSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image: string;
};

interface HomeSliderProps {
  slides: HomeSlide[];
  brandName: string;
}

export default function HomeSlider({ slides, brandName }: HomeSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6000);
    return () => window.clearInterval(id);
  }, [total, paused]);

  if (total === 0) return null;

  const go = (next: number) => setIndex((next + total) % total);
  const slide = slides[index];

  return (
    <section
      className="home-slider home-slider-lifestyle"
      aria-roledescription="carousel"
      aria-label={`${brandName} featured banners`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`home-slider-slide${i === index ? " is-active" : ""}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${total}`}
          aria-hidden={i !== index}
        >
          <div
            className="home-slider-media"
            style={{ backgroundImage: `url(${s.image})` }}
            aria-hidden="true"
          />
          <div className="home-slider-shade" aria-hidden="true" />
        </div>
      ))}

      <div className="home-slider-inner">
        <p className="peak-hero-eyebrow">{slide.eyebrow}</p>
        <h1 className="home-slider-title">{slide.title}</h1>
        <p className="peak-hero-copy font-ui">{slide.subtitle}</p>
        <div className="peak-hero-actions">
          <Link href={slide.ctaHref} className="btn-copper">
            {slide.ctaLabel}
          </Link>
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className="home-slider-arrow is-prev"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
          >
            <IconChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="home-slider-arrow is-next"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
          >
            <IconChevronRight size={20} />
          </button>
          <div className="home-slider-dots" role="tablist" aria-label="Slide indicators">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                className={`home-slider-dot${i === index ? " is-active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
