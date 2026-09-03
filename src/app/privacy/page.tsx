import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Elvene Noir collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">The Maison</p>
          <h1 className="section-title mt-2">Privacy Policy</h1>
          <div className="section-divider" />
        </section>
        <article className="legal-prose luxury-card max-w-3xl mx-auto p-6 md:p-10 mb-16">
          <p className="text-pearl-muted text-sm mb-6">Last updated: July 2026</p>
          <h2>Information we collect</h2>
          <p>
            When you place an order we collect your name, email, phone number, shipping address,
            and order details. Payment card data is processed by Stripe and is never stored on our
            servers. For cash-on-delivery orders we only store the contact details you provide.
          </p>
          <h2>How we use it</h2>
          <p>
            We use your information to fulfil orders, confirm delivery, prevent fraud, improve the
            shop, and contact you about your purchase. We may send order updates by email, SMS, or
            WhatsApp using the number you provide.
          </p>
          <h2>Sharing</h2>
          <p>
            We share necessary details with payment processors, courier partners, and email/SMS
            providers solely to complete your order. We do not sell your personal data.
          </p>
          <h2>Security &amp; packaging</h2>
          <p>
            Orders ship in discreet packaging without product descriptions on the outer label. We
            take reasonable technical measures to protect your data, but no online transmission is
            fully secure.
          </p>
          <h2>Your choices</h2>
          <p>
            You may request access, correction, or deletion of your personal data by contacting us.
            Newsletter subscribers can unsubscribe at any time.
          </p>
          <p className="mt-8">
            Questions? <Link href="/contact">Contact us</Link>.
          </p>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
