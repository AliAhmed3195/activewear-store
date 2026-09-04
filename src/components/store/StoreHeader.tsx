"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import BrandLogo from "@/components/store/BrandLogo";
import ScrollProgress from "@/components/store/ScrollProgress";
import { IconBag, IconHeart, IconSearch, IconMenu, IconClose, IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface CategoryLink {
  slug: string;
  name: string;
  productCount: number;
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?sort=newest", label: "New In" },
  { href: "/shop?sort=rating", label: "Best Sellers" },
  { href: "/about", label: "About" },
];

interface StoreHeaderProps {
  categories?: CategoryLink[];
}

export default function StoreHeader({ categories = [] }: StoreHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart, wishlist, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  const isActive = (href: string) => {
    if (href === "/shop") return pathname === "/shop";
    if (href.startsWith("/about")) return pathname.startsWith("/about");
    return false;
  };

  return (
    <>
      <ScrollProgress />
      <div className="announcement-bar" aria-hidden="true">
        <div className="announcement-track">
          {Array.from({ length: 2 }).map((_, loop) => (
            <div key={loop} className="announcement-group">
              <span>Free Shipping on Qualifying Orders</span>
              <span className="dot">·</span>
              <span>Performance Fabrics</span>
              <span className="dot">·</span>
              <span>Ships Across Pakistan</span>
              <span className="dot">·</span>
              <span>Secure Checkout</span>
              <span className="dot">·</span>
              <span>
                <Link href="/track" className="underline-offset-2 hover:underline">
                  Order Tracking
                </Link>
              </span>
              <span className="dot">·</span>
            </div>
          ))}
        </div>
      </div>

      <header className={cn("store-header", scrolled && "store-header-scrolled")}>
        <div className="store-header-inner">
          <div className="header-left">
            <Link href="/" className="store-brand" aria-label="Peak Activewear home">
              <BrandLogo className="store-brand-logo" />
            </Link>
          </div>

          <nav className="header-nav" aria-label="Primary">
            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                className="header-nav-link flex items-center gap-1"
                onClick={() => router.push("/shop")}
              >
                Collections
                <IconChevronDown size={12} />
              </button>
              {collectionsOpen && categories.length > 0 && (
                <div className="luxury-card collections-dropdown">
                  <span className="badge-micro">Explore Collections</span>
                  <div className="mt-3">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className="collections-dropdown-link"
                      >
                        <span>{cat.name}</span>
                        <span>{cat.productCount}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn("header-nav-link", isActive(link.href) && "active")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <IconSearch size={18} />
            </button>
            <Link href="/shop" className="icon-btn relative hidden sm:flex" aria-label="Wishlist">
              <IconHeart size={18} />
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </Link>
            <button
              type="button"
              className="icon-btn relative"
              onClick={toggleCart}
              aria-label="Shopping bag"
            >
              <IconBag size={18} />
              {totalItems > 0 && <span className="badge-count">{totalItems}</span>}
            </button>
            <button
              type="button"
              className="header-menu-btn icon-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-box" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-micro">Search the store</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <IconClose size={18} />
              </button>
            </div>
            <form onSubmit={submitSearch}>
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tees, joggers, sets…"
                className="search-input-lg"
              />
            </form>
            <p className="font-ui text-[10px] text-pearl-muted tracking-widest capitalize mt-4">
              Press Enter to search
            </p>
          </div>
        </div>
      )}

      {menuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="mobile-nav-panel" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">Menu</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <IconClose size={18} />
              </button>
            </div>
            <nav className="mobile-nav-links">
              <Link href="/shop" className="mobile-nav-link">
                Shop All
              </Link>
              <Link href="/shop?sort=newest" className="mobile-nav-link">
                New In
              </Link>
              <Link href="/shop?sort=rating" className="mobile-nav-link">
                Best Sellers
              </Link>
              {categories.length > 0 && (
                <p className="mobile-nav-section">Collections</p>
              )}
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="mobile-nav-link mobile-nav-link-sub">
                  {cat.name}
                </Link>
              ))}
              <Link href="/about" className="mobile-nav-link">
                About
              </Link>
              <Link href="/track" className="mobile-nav-link mobile-nav-link-sub">
                Order Tracking
              </Link>
            </nav>
            <div className="mobile-nav-footer">
              <p>Nationwide Shipping · COD Available</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
