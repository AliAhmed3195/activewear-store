"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/store/BrandLogo";
import {
  IconArrowRight,
  IconCheck,
  IconGlobe,
  IconInstagram,
  IconPinterest,
  IconShield,
  IconTruck,
} from "@/components/ui/icons";
import { storeName, storeTagline } from "@/lib/utils";

type StoreFooterProps = {
  logoUrl?: string | null;
};

export default function StoreFooter({ logoUrl = null }: StoreFooterProps) {
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
      <section className="newsletter" aria-labelledby="newsletter-heading">
        <div className="newsletter-inner">
          <span className="section-eyebrow newsletter-eyebrow">Training updates</span>
          <h2 id="newsletter-heading" className="section-title newsletter-heading mt-3">
            New drops &amp; restocks
          </h2>
          <p className="section-desc newsletter-desc">
            Be first to know about new arrivals, restocks, and limited drops.
          </p>

          {subscribed ? (
            <p className="newsletter-thanks font-display" role="status">
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
                autoComplete="email"
              />
              <button type="submit" className="newsletter-submit">
                Subscribe
                <IconArrowRight size={14} />
              </button>
            </form>
          )}

          <p className="newsletter-legal font-ui">
            By subscribing you agree to our{" "}
            <Link href="/privacy" className="newsletter-legal-link">Privacy Policy</Link>. Unsubscribe
            anytime.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-row footer-main">
          <div className="footer-main-grid">
            <div className="footer-brand">
              <BrandLogo className="footer-brand-logo" logoUrl={logoUrl} />
              <p className="footer-tagline font-ui">
                <strong>{storeTagline()}</strong> Premium activewear for gym, run, and everyday — PKR
                &amp; international shipping.
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

            <div className="footer-navs">
              <div className="footer-col">
                <h4 className="font-ui">Shop</h4>
                <ul className="footer-links">
                  <li><Link href="/shop">All Products</Link></li>
                  <li><Link href="/shop?sort=newest">New Arrivals</Link></li>
                  <li><Link href="/shop?sort=rating">Best Sellers</Link></li>
                  <li><Link href="/wishlist">Wishlist</Link></li>
                  <li><Link href="/shop?category=mens-tops">Men&apos;s Tops</Link></li>
                  <li><Link href="/shop?category=mens-bottoms">Men&apos;s Bottoms</Link></li>
                  <li><Link href="/shop?category=womens-tops">Women&apos;s Tops</Link></li>
                  <li><Link href="/shop?category=sets-coords">Sets &amp; Co-ords</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="font-ui">Support</h4>
                <ul className="footer-links">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/track">Order Tracking</Link></li>
                  <li><Link href="/shipping">Shipping &amp; Returns</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="font-ui">Company</h4>
                <ul className="footer-links">
                  <li><Link href="/about">About {name}</Link></li>
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                  <li><Link href="/terms">Terms of Service</Link></li>
                  <li><Link href="/shipping">Shipping Info</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-trust" aria-label="Store benefits">
          <div className="footer-trust-inner footer-row">
            <div className="footer-trust-item">
              <span className="footer-trust-icon" aria-hidden="true">
                <IconTruck size={20} />
              </span>
              <div>
                <p className="footer-trust-title font-ui">Nationwide shipping</p>
                <p className="footer-trust-desc font-ui">PK &amp; international delivery</p>
              </div>
            </div>
            <div className="footer-trust-item">
              <span className="footer-trust-icon" aria-hidden="true">
                <IconShield size={20} />
              </span>
              <div>
                <p className="footer-trust-title font-ui">Secure checkout</p>
                <p className="footer-trust-desc font-ui">Card, COD &amp; wallets</p>
              </div>
            </div>
            <div className="footer-trust-item">
              <span className="footer-trust-icon" aria-hidden="true">
                <IconCheck size={20} />
              </span>
              <div>
                <p className="footer-trust-title font-ui">Quality guaranteed</p>
                <p className="footer-trust-desc font-ui">Performance-first fabrics</p>
              </div>
            </div>
            <div className="footer-trust-item">
              <span className="footer-trust-icon" aria-hidden="true">
                <IconGlobe size={20} />
              </span>
              <div>
                <p className="footer-trust-title font-ui">Easy returns</p>
                <p className="footer-trust-desc font-ui">Clear shipping policy</p>
              </div>
            </div>
          </div>
        </div>

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
