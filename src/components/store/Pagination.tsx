import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, value);
    });
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <nav className="shop-pagination" aria-label="Pagination">
      <Link
        href={buildHref(page - 1)}
        className={cn("btn-outline", page <= 1 && "pointer-events-none opacity-40")}
        aria-disabled={page <= 1}
      >
        Previous
      </Link>

      <div className="shop-pagination-pages">
        {pageWindow(page, totalPages).map((item, i) =>
          item === "…" ? (
            <span key={`e-${i}`} className="shop-pagination-ellipsis">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(item)}
              className={cn("shop-pagination-page", item === page && "is-active")}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </Link>
          )
        )}
      </div>

      <Link
        href={buildHref(page + 1)}
        className={cn("btn-outline", page >= totalPages && "pointer-events-none opacity-40")}
        aria-disabled={page >= totalPages}
      >
        Next
      </Link>
    </nav>
  );
}
