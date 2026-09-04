import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import Reveal from "@/components/ui/Reveal";
import { IconGem, IconGlobe, IconLock, IconHeadset } from "@/components/ui/icons";
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
        <section className="page-hero">
          <p className="section-eyebrow">Our story</p>
          <h1 className="section-title mt-2">About {name}</h1>
          <div className="section-divider" />
          <p className="section-desc max-w-2xl mx-auto">
            {name} builds performance activewear for people who train with intent — gym sessions,
            outdoor runs, and everyday movement that still needs to look sharp.
          </p>
        </section>

        <Reveal className="editorial mb-16" variant="fade">
          <div className="editorial-body">
            <p className="section-eyebrow">What we believe</p>
            <h2 className="section-title mt-3">Move better. Look ready.</h2>
            <p className="section-desc">
              Great gear should disappear into the work — flexible fit, clean design, and fabrics
              that keep up when the session gets serious. That is the standard behind every Peak drop.
            </p>
            <p className="section-desc">
              From men&apos;s and women&apos;s essentials to coordinated sets, we keep the edit focused so
              you can build a rotation that actually gets worn.
            </p>
            <div className="mt-8">
              <Link href="/shop" className="btn-copper">
                Shop the collection
              </Link>
            </div>
          </div>
          <div
            className="editorial-media"
            style={{
              minHeight: 420,
              background:
                "linear-gradient(160deg, rgba(7,8,9,.2), rgba(7,8,9,.55)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80) center/cover",
            }}
          >
            <span className="editorial-media-tag">Train Ready</span>
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
