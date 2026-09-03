import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery timelines, discreet packaging, and return guidelines for Elvene Noir.",
};

export default function ShippingPage() {
  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Client Care</p>
          <h1 className="section-title mt-2">Shipping &amp; Returns</h1>
          <div className="section-divider" />
        </section>
        <article className="legal-prose luxury-card max-w-3xl mx-auto p-6 md:p-10 mb-16">
          <h2>Shipping (Worldwide)</h2>
          <p>
            We ship internationally. Delivery times vary by destination — typically 3–10 working
            days for many regions, depending on customs and courier capacity. A phone number with
            country code is required so the courier can reach you.
          </p>
          <h2>Shipping charges</h2>
          <p>
            Flat shipping applies at checkout. Orders above the free-shipping threshold ship free.
            Exact amounts are shown before you confirm your order.
          </p>
          <h2>Discreet packaging</h2>
          <p>
            Every order leaves in plain, discreet packaging with no product description on the
            outer label.
          </p>
          <h2>Payment</h2>
          <p>
            Card payment via Stripe is available worldwide. Cash on delivery may be offered in
            select regions. Please keep your phone reachable for courier confirmation.
          </p>
          <h2>Returns &amp; exchanges</h2>
          <p>
            Unworn items with hygiene seals intact may be eligible for exchange within 7 days of
            delivery if the size is wrong or the item is faulty. Worn, washed, or unsealed intimate
            apparel cannot be returned for hygiene reasons. Contact us with your order number to
            start a request.
          </p>
          <h2>Track your order</h2>
          <p>
            Use <Link href="/track">Order Tracking</Link> with your order number and email, or{" "}
            <Link href="/contact">contact us</Link> for help.
          </p>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
