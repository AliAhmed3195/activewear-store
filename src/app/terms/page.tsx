import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import PageHero from "@/components/store/PageHero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the Elvene Noir online boutique.",
};

export default function TermsPage() {
  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <PageHero
          eyebrow="Legal"
          title="Terms of Service"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
        />
        <article className="legal-prose luxury-card max-w-3xl mx-auto p-6 md:p-10 mb-16">
          <p className="text-pearl-muted text-sm mb-6">Last updated: July 2026</p>
          <h2>Agreement</h2>
          <p>
            By browsing or purchasing from Elvene Noir you agree to these terms. Prices are listed
            in the store currency shown at checkout and may change without notice until an order is
            confirmed. We ship internationally — you must select a valid shipping country.
          </p>
          <h2>Orders</h2>
          <p>
            Placing an order is an offer to buy. We may decline or cancel orders for stock, pricing,
            or fraud reasons. Cash-on-delivery orders may be verified by phone or WhatsApp before
            dispatch. You are responsible for providing accurate contact and shipping details.
          </p>
          <h2>Payment</h2>
          <p>
            We accept cash on delivery and online card payments via Stripe. Online payments are
            charged when the order is confirmed. COD amounts are collected by the courier on
            delivery.
          </p>
          <h2>Intimate apparel</h2>
          <p>
            For hygiene reasons, lingerie and sleepwear that has been worn, washed, or had hygiene
            seals removed cannot be returned unless faulty. See our{" "}
            <Link href="/shipping">Shipping &amp; Returns</Link> policy.
          </p>
          <h2>Liability</h2>
          <p>
            To the fullest extent permitted by law, Elvene Noir is not liable for indirect or
            consequential losses arising from use of the site or delays outside our control
            (including courier delays).
          </p>
          <p className="mt-8">
            Need help? <Link href="/contact">Contact us</Link>.
          </p>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
