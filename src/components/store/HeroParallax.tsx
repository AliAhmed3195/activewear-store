"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { IconArrowRight } from "@/components/ui/icons";

interface HeroParallaxProps {
  heroImage: string;
  catalogCount?: number;
}

export default function HeroParallax({ heroImage, catalogCount = 0 }: HeroParallaxProps) {
  const rootRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip pointer parallax on touch / small viewports
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let raf = 0;
    let mx = 0;
    let my = 0;
    let scrollY = 0;

    const apply = () => {
      raf = 0;
      if (visualRef.current) {
        visualRef.current.style.transform = `translate3d(${mx * 12}px, ${
          my * 12 + scrollY * 0.06
        }px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(${mx * -8}px, ${
          my * -8 - scrollY * 0.04
        }px, 0)`;
        contentRef.current.style.opacity = String(Math.max(0, 1 - scrollY / 620));
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width - 0.5;
      my = (e.clientY - rect.top) / rect.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    if (finePointer) root.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (finePointer) root.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero hero-cinematic hero-split" ref={rootRef}>
      <div className="hero-bg" aria-hidden="true" />

      <div className="hero-orb hero-orb-1" aria-hidden="true" />
      <div className="hero-orb hero-orb-2" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-content hero-split-grid">
        <div className="hero-inner" ref={contentRef}>
          <div className="hero-badge-row">
            <span className="hero-season-badge">International Edit</span>
            <span className="hero-season-dot" aria-hidden="true" />
            <span className="hero-season-label">Elvene Noir</span>
          </div>
          <p className="hero-eyebrow hero-eyebrow-line">Worldwide Shipping · Discreet Delivery · Limited Edit</p>
          <h1 className="hero-title">
            Intimacy,{" "}
            <em className="hero-shimmer font-accent">Perfected</em>
          </h1>
          <p className="hero-sub">
            Luxury lingerie for the midnight hour — lace, satin, and bridal sets shipped worldwide,
            wrapped with total discretion.
          </p>
          <div className="hero-chips">
            <span className="hero-chip">Ships Worldwide</span>
            <span className="hero-chip">Bridal Atelier</span>
            <span className="hero-chip">Discreet Packaging</span>
          </div>
          <div className="hero-cta-row">
            <Link href="/shop" className="btn-copper btn-lg">
              {catalogCount > 0 ? `Shop All ${catalogCount} Pieces` : "Shop All"}
              <IconArrowRight size={14} />
            </Link>
            <Link href="/shop?category=bridal-atelier" className="btn-outline btn-lg">
              Bridal Atelier
            </Link>
          </div>
        </div>

        {heroImage && (
          <div className="hero-visual" ref={visualRef}>
            <div className="hero-visual-frame">
              <SafeImage
                key={heroImage}
                src={heroImage}
                alt="Elvene Noir editorial — black lace nocturne look"
                fallbackLabel="Elvene Noir"
                fill
                priority
                sizes="(max-width: 1023px) 90vw, 42vw"
                className="hero-visual-image"
              />
            </div>
          </div>
        )}
      </div>

      <div className="hero-scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  );
}
