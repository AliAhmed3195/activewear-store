import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import PageHero from "@/components/store/PageHero";
import Reveal from "@/components/ui/Reveal";
import {
  IconArrowRight,
  IconGem,
  IconGlobe,
  IconHeadset,
  IconLock,
  IconStar,
} from "@/components/ui/icons";

const BELIEF_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85";
import { storeName, storeTagline } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `${storeTagline()} Learn about ${storeName()} — performance activewear for gym, run, and everyday.`,
};

const VALUES = [
  {
    icon: IconGem,
    title: "Performance Fabrics",
    body: "Breathable, flexible materials selected for training comfort and lasting wear.",
  },
  {
    icon: IconHeadset,
    title: "Real Support",
    body: "Fast help on sizing, COD, and delivery — WhatsApp and email when you need it.",
  },
  {
    icon: IconGlobe,
    title: "Ship With Confidence",
    body: "Nationwide Pakistan shipping first, with international checkout ready when you are.",
  },
  {
    icon: IconLock,
    title: "Secure Payments",
    body: "Pay by card worldwide, or COD / JazzCash / EasyPaisa where available.",
  },
];

export default function AboutPage() {
  const name = storeName();

  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main">
        <PageHero
          eyebrow="Our story"
          title={`About ${name}`}
          description={`${name} builds performance activewear for people who train with intent — gym sessions, outdoor runs, and everyday movement that still needs to look sharp.`}
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        />

        <Reveal className="editorial editorial--belief mb-16 container-luxury" variant="fade">
          <div className="editorial-body">
            <div className="editorial-body-mesh" aria-hidden="true" />
            <div className="editorial-body-grain" aria-hidden="true" />
            <span className="editorial-watermark font-display" aria-hidden="true">01</span>

            <div className="editorial-body-content">
              <p className="editorial-kicker font-ui">What we believe</p>
              <h2 className="editorial-title font-display">
                <span className="editorial-title-line">Move better.</span>
                <span className="editorial-title-line editorial-title-accent">Look ready.</span>
              </h2>
              <div className="editorial-rule" aria-hidden="true" />

              <div className="editorial-copy font-ui">
                <p className="editorial-lead">
                  Great gear should disappear into the work — flexible fit, clean design, and fabrics
                  that keep up when the session gets serious.
                </p>
                <p>
                  From men&apos;s and women&apos;s essentials to coordinated sets, we keep the edit focused so
                  you can build a rotation that actually gets worn.
                </p>
              </div>

              <div className="editorial-metrics font-ui" aria-label="Brand highlights">
                <div className="editorial-metric">
                  <span className="editorial-metric-icon" aria-hidden="true">
                    <IconGem size={18} />
                  </span>
                  <div>
                    <p className="editorial-metric-value">Pro fabrics</p>
                    <p className="editorial-metric-label">Breathable &amp; durable</p>
                  </div>
                </div>
                <div className="editorial-metric">
                  <span className="editorial-metric-icon" aria-hidden="true">
                    <IconStar size={18} />
                  </span>
                  <div>
                    <p className="editorial-metric-value">4.8★ rated</p>
                    <p className="editorial-metric-label">Loved by athletes</p>
                  </div>
                </div>
                <div className="editorial-metric">
                  <span className="editorial-metric-icon" aria-hidden="true">
                    <IconGlobe size={18} />
                  </span>
                  <div>
                    <p className="editorial-metric-value">PK + global</p>
                    <p className="editorial-metric-label">Ships worldwide</p>
                  </div>
                </div>
              </div>

              <div className="editorial-actions">
                <Link href="/shop" className="editorial-cta font-ui">
                  Shop the collection
                  <IconArrowRight size={16} />
                </Link>
                <Link href="/shop?sort=newest" className="editorial-cta-ghost font-ui">
                  View new arrivals
                </Link>
              </div>
            </div>
          </div>

          <div className="editorial-media editorial-media--belief">
            <div
              className="editorial-media-bg"
              style={{ backgroundImage: `url(${BELIEF_IMAGE})` }}
              aria-hidden="true"
            />
            <div className="editorial-media-fade" aria-hidden="true" />
            <div className="editorial-frame" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="editorial-media-tag font-ui">Train ready</span>
            <div className="editorial-float-card font-ui">
              <p className="editorial-float-kicker">Peak standard</p>
              <p className="editorial-float-title">Gym · Run · Street</p>
              <p className="editorial-float-desc">One rotation, zero compromise</p>
            </div>
          </div>
        </Reveal>

        <section className="section-tight">
          <Reveal className="section-head">
            <p className="section-eyebrow">Why Peak</p>
            <h2 className="section-title">The Peak standard</h2>
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
