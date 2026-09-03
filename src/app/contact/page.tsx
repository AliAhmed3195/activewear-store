import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import { IconMail, IconMessage, IconHeadset } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Elvene Noir for order help, sizing, and delivery questions.",
};

export default function ContactPage() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@elvenenoir.com";

  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Client Care</p>
          <h1 className="section-title mt-2">Contact Us</h1>
          <div className="section-divider" />
          <p className="section-desc max-w-xl mx-auto">
            For order status, sizing, or delivery questions — we respond with discretion and care.
          </p>
        </section>

        <div className="contact-grid">
          <div className="luxury-card contact-card">
            <span className="contact-card-icon">
              <IconMail size={22} />
            </span>
            <h2>Email</h2>
            <p>Write to us for orders, sizing, or general enquiries.</p>
            <a href={`mailto:${email}`} className="contact-link">
              {email}
            </a>
          </div>

          {wa ? (
            <div className="luxury-card contact-card">
              <span className="contact-card-icon">
                <IconMessage size={22} />
              </span>
              <h2>WhatsApp</h2>
              <p>Private messaging for quick order updates and support.</p>
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-copper inline-flex mt-1"
              >
                Message on WhatsApp
              </a>
            </div>
          ) : (
            <div className="luxury-card contact-card">
              <span className="contact-card-icon">
                <IconHeadset size={22} />
              </span>
              <h2>Client Care</h2>
              <p>Our team responds within 24 hours on business days.</p>
              <Link href="/faq" className="section-link mt-1">
                View FAQ
              </Link>
            </div>
          )}
        </div>

        <p className="font-ui text-sm text-pearl-muted text-center max-w-md mx-auto mb-16">
          Please include your order number (EN-…) when writing about an existing order.{" "}
          <Link href="/track" className="text-copper hover:text-pearl transition-colors">
            Track your order
          </Link>
        </p>
      </main>
      <StoreFooter />
    </div>
  );
}
