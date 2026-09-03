import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import Reveal from "@/components/ui/Reveal";
import { IconGem, IconGlobe, IconLock, IconHeadset } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "The Atelier — Elvene Noir",
  description:
    "The story behind Elvene Noir — a maison devoted to luxury lingerie, hand-finished from the world's finest fabrics.",
};

const VALUES = [
  {
    icon: IconGem,
    title: "Curated Fabrics",
    body: "Lace, satin, and silk pieces selected for touch, drape, and after-dark presence.",
  },
  {
    icon: IconHeadset,
    title: "Discreet Concierge",
    body: "WhatsApp and email support for sizing, COD, and delivery — always private.",
  },
  {
    icon: IconGlobe,
    title: "Shipped Worldwide",
    body: "International delivery in plain packaging with no product description on the outer label.",
  },
  {
    icon: IconLock,
    title: "Secure Card & COD",
    body: "Pay by card worldwide, or cash on delivery where available. Your details stay protected.",
  },
];

export default function AboutPage() {
  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Est. Midnight</p>
          <h1 className="section-title mt-2">The Elvene Atelier</h1>
          <div className="section-divider" />
          <p className="section-desc max-w-2xl mx-auto">
            Elvene Noir is an international maison for luxury lingerie and sleepwear — nocturne
            lace, bridal satin, soft foundations, and twin sets designed for the hours that stay
            private.
          </p>
        </section>

        <Reveal className="editorial mb-16" variant="fade">
          <div className="editorial-body">
            <p className="section-eyebrow">Our Philosophy</p>
            <h2 className="section-title mt-3">Luxury, Worn Closest</h2>
            <p className="section-desc">
              Founded on the belief that lingerie is a ritual, not an afterthought, Elvene Noir
              builds a focused wardrobe for nights at home, travel, and honeymoon suites —
              always wrapped with discretion.
            </p>
            <p className="section-desc">
              We keep the edit intentional: eight new arrivals across six collections, with cash
              on delivery and client care that never shouts.
            </p>
            <div className="mt-8">
              <Link href="/shop" className="btn-copper">
                Explore the Collection
              </Link>
            </div>
          </div>
          <div className="editorial-media" style={{ minHeight: 420 }}>
            <div className="absolute inset-0 product-stage" />
            <span className="editorial-media-tag">The Maison</span>
          </div>
        </Reveal>

        <section className="section-tight">
          <Reveal className="section-head">
            <p className="section-eyebrow">Why Elvene Noir</p>
            <h2 className="section-title">The Elvene Standard</h2>
            <div className="section-divider" />
          </Reveal>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="value-card">
                <v.icon className="trust-icon" size={22} />
                <div>
                  <h4>{v.title}</h4>
                  <p>{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
