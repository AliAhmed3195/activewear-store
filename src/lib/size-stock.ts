/** Per-size inventory helpers. Stored as Prisma Json on Product.sizeStock */

export type SizeStockMap = Record<string, number>;

export function isSizeStockMap(value: unknown): value is SizeStockMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((n) => typeof n === "number" && Number.isFinite(n));
}

/** Normalize JSON / legacy total stock into a size → qty map. */
export function normalizeSizeStock(
  raw: unknown,
  sizes: string[],
  fallbackTotal = 0
): SizeStockMap {
  const map: SizeStockMap = {};
  const source = isSizeStockMap(raw) ? raw : {};

  for (const size of sizes) {
    const n = source[size];
    map[size] = typeof n === "number" && n >= 0 ? Math.floor(n) : 0;
  }

  const summed = Object.values(map).reduce((a, b) => a + b, 0);
  if (summed === 0 && fallbackTotal > 0 && sizes.length > 0) {
    const base = Math.floor(fallbackTotal / sizes.length);
    let rem = fallbackTotal - base * sizes.length;
    for (const size of sizes) {
      map[size] = base + (rem > 0 ? 1 : 0);
      if (rem > 0) rem -= 1;
    }
  }

  return map;
}

export function totalFromSizeStock(sizeStock: SizeStockMap): number {
  return Object.values(sizeStock).reduce((a, b) => a + b, 0);
}

export function stockForSize(
  sizeStock: SizeStockMap | null | undefined,
  size: string,
  fallbackTotal = 0
): number {
  if (sizeStock && typeof sizeStock[size] === "number") {
    return Math.max(0, Math.floor(sizeStock[size]));
  }
  return Math.max(0, fallbackTotal);
}

/** Keep only enabled sizes; drop zero-only keys that aren't offered. */
export function pickSizeStock(sizes: string[], sizeStock: SizeStockMap): SizeStockMap {
  const next: SizeStockMap = {};
  for (const s of sizes) {
    next[s] = Math.max(0, Math.floor(sizeStock[s] ?? 0));
  }
  return next;
}
