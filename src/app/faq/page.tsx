import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about sizing, COD, shipping, and returns.",
};

const FAQS = [
  {
    q: "Do you ship internationally?",
    a: "Yes. We ship worldwide — select your country at checkout. Delivery times vary by destination.",
  },
  {
    q: "Do you offer Cash on Delivery?",
    a: "COD is available in select regions. Card payment via Stripe works internationally.",
  },
  {
    q: "How long does delivery take?",
    a: "Usually 3–10 working days depending on your country, customs, and courier.",
  },
  {
    q: "Is packaging discreet?",
    a: "Yes. Outer packaging has no product description.",
  },
  {
    q: "Can I return lingerie?",
    a: "Unworn items with seals intact may be exchanged within 7 days if faulty or wrong size. Worn/unsealed pieces cannot be returned for hygiene reasons.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number and checkout email.",
  },
];

export default function FaqPage() {
  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Client Care</p>
          <h1 className="section-title mt-2">FAQ</h1>
          <div className="section-divider" />
          <p className="section-desc max-w-xl mx-auto">
            Answers to common questions about shipping, payments, and returns.
          </p>
        </section>

        <div className="faq-list">
          {FAQS.map((item) => (
            <article key={item.q} className="faq-item">
              <h2>{item.q}</h2>
              <p>{item.a}</p>
            </article>
          ))}
        </div>

        <p className="font-ui text-sm text-pearl-muted text-center pb-16">
          Still need help?{" "}
          <Link href="/contact" className="text-copper hover:text-pearl transition-colors">
            Contact us
          </Link>{" "}
          or{" "}
          <Link href="/track" className="text-copper hover:text-pearl transition-colors">
            track your order
          </Link>
          .
        </p>
      </main>
      <StoreFooter />
    </div>
  );
}
