"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
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

function normalizeCategories(list: CategoryLink[]) {
  return list.filter((cat) => cat.productCount > 0);
}

export default function StoreHeader({ categories = [] }: StoreHeaderProps) {
  return (
    <Suspense fallback={<StoreHeaderBar categories={categories} />}>
      <StoreHeaderWithParams categories={categories} />
    </Suspense>
  );
}

function StoreHeaderWithParams({ categories = [] }: StoreHeaderProps) {
  const searchParams = useSearchParams();
  return (
    <StoreHeaderBar
      categories={categories}
      sort={searchParams.get("sort")}
      category={searchParams.get("category")}
      queryParam={searchParams.get("q")}
    />
  );
}

function StoreHeaderBar({
  categories = [],
  sort = null,
  category = null,
  queryParam = null,
}: StoreHeaderProps & {
  sort?: string | null;
  category?: string | null;
  queryParam?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart, wishlist, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionsHover, setCollectionsHover] = useState(false);
  const [collectionsPinned, setCollectionsPinned] = useState(false);
  const collectionsOpen = collectionsHover || collectionsPinned;
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [navCategories, setNavCategories] = useState<CategoryLink[]>(() =>
    normalizeCategories(categories)
  );
  const collectionsRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoverCloseTimer = useRef<number>(0);

  useEffect(() => {
    setNavCategories(normalizeCategories(categories));
  }, [categories]);

  useEffect(() => {
    if (categories.length > 0) return;
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        setNavCategories(normalizeCategories(data as CategoryLink[]));
      })
      .catch(() => {
        if (!cancelled) setNavCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categories.length]);

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
    setCollectionsHover(false);
    setCollectionsPinned(false);
  }, [pathname, sort, category, queryParam]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSearchOpen(false);
      setMenuOpen(false);
      setCollectionsHover(false);
      setCollectionsPinned(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!collectionsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!collectionsRef.current?.contains(event.target as Node)) {
        setCollectionsHover(false);
        setCollectionsPinned(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [collectionsOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    menuPanelRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [searchOpen]);

  useEffect(() => {
    return () => window.clearTimeout(hoverCloseTimer.current);
  }, []);

  const openCollections = () => {
    window.clearTimeout(hoverCloseTimer.current);
    setCollectionsHover(true);
  };

  const scheduleCloseCollections = () => {
    window.clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = window.setTimeout(() => {
      setCollectionsHover(false);
    }, 160);
  };

  if (pathname.startsWith("/admin")) return null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  const shopClean = pathname === "/shop" && !category && !queryParam;
  const isActive = (href: string) => {
    if (href === "/about") return pathname.startsWith("/about");
    if (href === "/shop") return shopClean && !sort;
    if (href === "/shop?sort=newest") return shopClean && sort === "newest";
    if (href === "/shop?sort=rating") return shopClean && sort === "rating";
    return false;
  };
  const collectionsActive = pathname === "/shop" && Boolean(category);
  const wishlistActive = pathname.startsWith("/wishlist");

  return (
    <>
      <ScrollProgress />
      <div className="announcement-bar" role="region" aria-label="Store announcements">
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
              ref={collectionsRef}
              className="header-collections"
              onMouseEnter={openCollections}
              onMouseLeave={scheduleCloseCollections}
            >
              <button
                type="button"
                className={cn("header-nav-link", (collectionsOpen || collectionsActive) && "active")}
                aria-expanded={collectionsOpen}
                aria-haspopup="menu"
                onClick={() => setCollectionsPinned((open) => !open)}
              >
                Collections
                <IconChevronDown size={12} className={cn("header-chevron", collectionsOpen && "open")} />
              </button>
              <div
                className={cn("collections-dropdown", collectionsOpen && "open")}
                role="menu"
                aria-hidden={!collectionsOpen}
                inert={!collectionsOpen}
              >
                <p className="collections-dropdown-title">Shop collections</p>
                <div>
                  {navCategories.length === 0 ? (
                    <p className="collections-empty">Collections will appear here.</p>
                  ) : (
                    navCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className={cn(
                          "collections-dropdown-link",
                          category === cat.slug && "active"
                        )}
                        role="menuitem"
                        tabIndex={collectionsOpen ? 0 : -1}
                        onClick={() => {
                          setCollectionsHover(false);
                          setCollectionsPinned(false);
                        }}
                      >
                        <span>{cat.name}</span>
                        <span className="collections-count">{cat.productCount}</span>
                      </Link>
                    ))
                  )}
                  <Link
                    href="/shop"
                    className="collections-dropdown-link collections-dropdown-all"
                    tabIndex={collectionsOpen ? 0 : -1}
                    onClick={() => {
                      setCollectionsHover(false);
                      setCollectionsPinned(false);
                    }}
                  >
                    <span>View all products</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
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
            <Link
              href="/wishlist"
              className={cn("icon-btn relative", wishlistActive && "active")}
              aria-label="Wishlist"
            >
              <IconHeart size={18} filled={wishlist.length > 0} />
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </Link>
            <button
              type="button"
              className="icon-btn header-bag relative"
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

      <div
        className={cn("search-overlay", searchOpen && "open")}
        onClick={() => setSearchOpen(false)}
        aria-hidden={!searchOpen}
        inert={!searchOpen}
      >
        <div className="search-box" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <span className="badge-micro">Search the store</span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              tabIndex={searchOpen ? 0 : -1}
            >
              <IconClose size={18} />
            </button>
          </div>
          <form onSubmit={submitSearch}>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tees, joggers, sets…"
              className="search-input-lg"
              tabIndex={searchOpen ? 0 : -1}
            />
          </form>
          <p className="font-ui text-[10px] text-pearl-muted tracking-widest capitalize mt-4">
            Press Enter to search
          </p>
        </div>
      </div>

      <div
            className={cn("mobile-nav-overlay", menuOpen && "open")}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={menuPanelRef}
            className={cn("mobile-nav-panel", menuOpen && "open")}
            role="dialog"
            aria-modal={menuOpen}
            aria-label="Menu"
            tabIndex={-1}
            inert={!menuOpen}
          >
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
              <Link href="/shop" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Shop All
              </Link>
              <Link href="/shop?sort=newest" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                New In
              </Link>
              <Link href="/shop?sort=rating" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Best Sellers
              </Link>
              <Link href="/wishlist" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Wishlist{wishlist.length > 0 ? ` (${wishlist.length})` : ""}
              </Link>
              {navCategories.length > 0 && <p className="mobile-nav-section">Collections</p>}
              {navCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="mobile-nav-link mobile-nav-link-sub"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                About
              </Link>
              <Link href="/track" className="mobile-nav-link mobile-nav-link-sub" onClick={() => setMenuOpen(false)}>
                Order Tracking
              </Link>
            </nav>
            <div className="mobile-nav-footer">
              <p>Nationwide Shipping · COD Available</p>
            </div>
          </div>
    </>
  );
}
