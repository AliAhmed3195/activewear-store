"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { IconClose, IconSearch } from "@/components/ui/icons";

type Hit = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string | null;
  image: string;
  priceCentsPkr: number;
  priceCentsUsd: number;
};

interface PredictiveSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function PredictiveSearch({ open, onClose }: PredictiveSearchProps) {
  const router = useRouter();
  const { currency } = useCart();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setHits(Array.isArray(data.products) ? data.products : []);
      } catch {
        /* aborted or network */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    onClose();
    startTransition(() => {
      router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    });
  };

  return (
    <div className="search-overlay predictive-search" onClick={onClose}>
      <div className="search-box predictive-search-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <span className="badge-micro">Live search</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
            <IconClose size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="predictive-search-form">
          <IconSearch size={18} />
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tees, polos, kits…"
            className="search-input-lg"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={`${inputId}-list`}
          />
        </form>

        <div id={`${inputId}-list`} className="predictive-search-results" role="listbox">
          {loading && <p className="predictive-search-hint">Searching…</p>}
          {!loading && query.trim().length >= 2 && hits.length === 0 && (
            <p className="predictive-search-hint">No matches — try another word.</p>
          )}
          {!loading &&
            hits.map((hit) => {
              const price =
                currency === "usd" ? hit.priceCentsUsd : hit.priceCentsPkr;
              return (
                <Link
                  key={hit.id}
                  href={`/product/${hit.slug}`}
                  className="predictive-search-hit"
                  role="option"
                  onClick={onClose}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hit.image || "/brand/vifactive-mark.png"} alt="" />
                  <span>
                    <strong>{hit.name}</strong>
                    <em>{hit.category ?? hit.tagline}</em>
                  </span>
                  <b>{formatPrice(price, currency)}</b>
                </Link>
              );
            })}
        </div>

        <div className="predictive-search-footer">
          <button
            type="button"
            className="peak-text-link"
            onClick={() => {
              const q = query.trim();
              onClose();
              router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
            }}
          >
            View all results →
          </button>
          <p>Enter to open full shop results</p>
        </div>
      </div>
    </div>
  );
}
