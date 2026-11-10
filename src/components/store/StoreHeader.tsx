"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import BrandLogo from "@/components/store/BrandLogo";
import ScrollProgress from "@/components/store/ScrollProgress";
import {
  IconBag,
  IconHeart,
  IconSearch,
  IconMenu,
  IconClose,
  IconChevronDown,
  IconUser,
} from "@/components/ui/icons";
import { MAIN_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface CategoryLink {
  slug: string;
  name: string;
  productCount: number;
}

interface StoreHeaderProps {
  categories?: CategoryLink[];
}

export default function StoreHeader({ categories = [] }: StoreHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart, wishlist, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
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
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setOpenGroup(null);
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

  return (
    <>
      <ScrollProgress />
      <div className={cn("site-chrome", scrolled && "site-chrome-scrolled")}>
        <div className="announcement-bar" aria-hidden="true">
          <div className="announcement-track">
            {Array.from({ length: 2 }).map((_, loop) => (
              <div key={loop} className="announcement-group">
                <span>Cash on Delivery · Pakistan</span>
                <span className="dot">·</span>
                <span>Free Shipping on Qualifying Orders</span>
                <span className="dot">·</span>
                <span>Custom Team Kits</span>
                <span className="dot">·</span>
                <span>Ships Across Pakistan</span>
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
              <Link href="/" className="store-brand" aria-label="VIFACTIVE home">
                <BrandLogo className="store-brand-logo" />
              </Link>
            </div>

          <nav className="header-nav" aria-label="Primary">
            {MAIN_NAV.map((group) =>
              group.children?.length ? (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(group.label)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button
                    type="button"
                    className="header-nav-link flex items-center gap-1"
                    onClick={() => {
                      if (group.href) router.push(group.href);
                      setOpenGroup((v) => (v === group.label ? null : group.label));
                    }}
                    aria-expanded={openGroup === group.label}
                  >
                    {group.label}
                    <IconChevronDown size={12} />
                  </button>
                  {openGroup === group.label && (
                    <div className="collections-dropdown nav-mega" role="menu">
                      <p className="collections-dropdown-title">{group.label}</p>
                      <div>
                        {group.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="collections-dropdown-link"
                            role="menuitem"
                          >
                            <span>{child.label}</span>
                            <span>→</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={group.label} href={group.href || "/shop"} className="header-nav-link">
                  {group.label}
                </Link>
              )
            )}
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
            <Link href="/account" className="icon-btn relative hidden sm:flex" aria-label="My Account">
              <IconUser size={18} />
            </Link>
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
      </div>

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
              {MAIN_NAV.map((group) => (
                <div key={group.label}>
                  {group.children?.length ? (
                    <>
                      <button
                        type="button"
                        className="mobile-nav-link mobile-nav-toggle"
                        onClick={() =>
                          setMobileOpen((v) => (v === group.label ? null : group.label))
                        }
                      >
                        <span>{group.label}</span>
                        <IconChevronDown size={14} />
                      </button>
                      {mobileOpen === group.label &&
                        group.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="mobile-nav-link mobile-nav-link-sub"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                    </>
                  ) : (
                    <Link
                      href={group.href || "/shop"}
                      className="mobile-nav-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      {group.label}
                    </Link>
                  )}
                </div>
              ))}
              <Link href="/account" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Sign In / My Account
              </Link>
              <Link href="/track" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Order Tracking
              </Link>
              <Link href="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Contact Us
              </Link>
              <Link href="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                About Us
              </Link>
              {categories.length > 0 && (
                <p className="mobile-nav-section">Live collections</p>
              )}
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="mobile-nav-link mobile-nav-link-sub"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
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
