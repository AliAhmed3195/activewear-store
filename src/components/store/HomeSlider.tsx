"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  /** Optional silent autoplay video (MP4/WebM). Falls back to image. */
  video?: string;
};

interface HomeSliderProps {
  slides: HomeSlide[];
  brandName: string;
}

const SLIDE_MS = 6500;

export default function HomeSlider({ slides, brandName }: HomeSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(Date.now());
  const total = slides.length;

  useEffect(() => {
    startedAt.current = Date.now();
    setProgress(0);
  }, [index]);

  useEffect(() => {
    if (total <= 1) return;
    let raf = 0;
    const loop = () => {
      if (!paused) {
        const elapsed = Date.now() - startedAt.current;
        if (elapsed >= SLIDE_MS) {
          setIndex((i) => (i + 1) % total);
        } else {
          setProgress((elapsed / SLIDE_MS) * 100);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [total, paused, index]);

  if (total === 0) return null;

  const go = (next: number) => setIndex((next + total) % total);
  const slide = slides[index];

  return (
    <section
      className="home-slider home-slider-lifestyle home-slider-nike"
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
          >
            {s.video && i === index && (
              <video
                className="home-slider-video"
                src={s.video}
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"
              />
            )}
          </div>
          <div className="home-slider-shade" aria-hidden="true" />
        </div>
      ))}

      <div className="home-slider-inner">
        <p className="peak-hero-eyebrow">{slide.eyebrow}</p>
        <h1 className="home-slider-title">{slide.title}</h1>
        <p className="peak-hero-copy font-ui">{slide.subtitle}</p>
        <div className="peak-hero-actions">
          <Link href={slide.ctaHref} className="btn-pill btn-pill-solid">
            {slide.ctaLabel}
          </Link>
          {slide.secondaryLabel && slide.secondaryHref && (
            <Link href={slide.secondaryHref} className="btn-pill btn-pill-ghost">
              {slide.secondaryLabel}
            </Link>
          )}
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
          <div className="home-slider-progress" aria-hidden="true">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`home-slider-progress-seg${i === index ? " is-active" : ""}${i < index ? " is-done" : ""}`}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span
                  style={
                    i === index
                      ? { transform: `scaleX(${Math.min(100, progress) / 100})` }
                      : undefined
                  }
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
