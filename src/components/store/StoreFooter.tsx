"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/store/BrandLogo";
import { IconArrowRight, IconInstagram, IconPinterest } from "@/components/ui/icons";
import { storeName, storeTagline } from "@/lib/utils";

export default function StoreFooter() {
  const name = storeName();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <>
      <section className="newsletter">
        <div className="newsletter-inner">
          <span className="section-eyebrow">Stay in the loop</span>
          <h2 className="section-title mt-3">New drops & training picks</h2>
          <p className="section-desc">
            Get notified about new arrivals, restocks, and exclusive offers.
          </p>
          {subscribed ? (
            <p className="font-display text-lg text-copper mt-6">
              Thank you. You&apos;re on the list.
            </p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="newsletter-input"
                aria-label="Email address"
              />
              <button type="submit" className="btn-copper">
                Subscribe
                <IconArrowRight size={14} />
              </button>
            </form>
          )}
          <p className="font-ui text-[10px] text-pearl-muted tracking-wide mt-4">
            By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        {/* Row 1 — Brand */}
        <div className="footer-row footer-row-brand">
          <div className="footer-brand">
            <BrandLogo className="footer-brand-logo" />
            <p>
              {storeTagline()} Premium activewear for gym, run, and everyday — PKR & international
              shipping.
            </p>
            <div className="footer-social">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <IconInstagram size={18} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Pinterest"
              >
                <IconPinterest size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Row 2 — Link columns */}
        <div className="footer-row footer-row-links">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link href="/shop">All Products</Link>
            <Link href="/shop?sort=newest">New Arrivals</Link>
            <Link href="/shop?sort=rating">Best Sellers</Link>
            <Link href="/shop?category=mens-tops">Men&apos;s Tops</Link>
            <Link href="/shop?category=mens-bottoms">Men&apos;s Bottoms</Link>
            <Link href="/shop?category=womens-tops">Women&apos;s Tops</Link>
            <Link href="/shop?category=sets-coords">Sets & Co-ords</Link>
          </div>

          <div className="footer-col">
            <h4>Client Care</h4>
            <Link href="/about">About Us</Link>
            <Link href="/track">Order Tracking</Link>
            <Link href="/shipping">Shipping &amp; Returns</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/faq">FAQ</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/about">About {name}</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/shipping">Discreet Packaging</Link>
          </div>
        </div>

        {/* Row 3 — Copyright + payments */}
        <div className="footer-row footer-row-bottom">
          <div className="footer-bottom-inner">
            <p className="footer-copy">
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>
            <div className="payment-badges">
              <span className="payment-badge">COD</span>
              <span className="payment-badge">JazzCash</span>
              <span className="payment-badge">EasyPaisa</span>
              <span className="payment-badge">Visa</span>
              <span className="payment-badge">Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
