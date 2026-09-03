"use client";

import { useMemo, useState } from "react";
import { totalFromSizeStock, type SizeStockMap } from "@/lib/size-stock";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];
const PRESETS = [
  { id: "core", label: "S–L", sizes: ["S", "M", "L"], qty: 10 },
  { id: "full", label: "Full run", sizes: ["XS", "S", "M", "L", "XL"], qty: 8 },
  { id: "plus", label: "+XL focus", sizes: ["M", "L", "XL"], qty: 12 },
] as const;

interface SizeStockManagerProps {
  sizes: string[];
  sizeStock: SizeStockMap;
  onToggle: (size: string) => void;
  onQty: (size: string, qty: number) => void;
  /** Apply a full sizes + stock map in one go (quick tools) */
  onApply?: (next: { sizes: string[]; sizeStock: SizeStockMap }) => void;
  allSizes?: string[];
  compact?: boolean;
}

export default function SizeStockManager({
  sizes,
  sizeStock,
  onToggle,
  onQty,
  onApply,
  allSizes = DEFAULT_SIZES,
  compact = false,
}: SizeStockManagerProps) {
  const [fillQty, setFillQty] = useState(10);
  const [poolQty, setPoolQty] = useState(50);

  const total = useMemo(
    () =>
      totalFromSizeStock(Object.fromEntries(sizes.map((s) => [s, sizeStock[s] ?? 0]))),
    [sizes, sizeStock]
  );

  const lowCount = sizes.filter((s) => {
    const q = sizeStock[s] ?? 0;
    return q > 0 && q <= 5;
  }).length;
  const emptyCount = sizes.filter((s) => (sizeStock[s] ?? 0) === 0).length;

  const applyMap = (nextSizes: string[], nextStock: SizeStockMap) => {
    if (onApply) {
      onApply({ sizes: nextSizes, sizeStock: nextStock });
      return;
    }
    for (const s of allSizes) {
      const wantOn = nextSizes.includes(s);
      const isOn = sizes.includes(s);
      if (wantOn !== isOn) onToggle(s);
      onQty(s, nextStock[s] ?? 0);
    }
  };

  const enableAll = () => {
    const next: SizeStockMap = {};
    for (const s of allSizes) next[s] = sizeStock[s] ?? 0;
    applyMap([...allSizes], next);
  };

  const clearStock = () => {
    const next: SizeStockMap = {};
    for (const s of sizes) next[s] = 0;
    applyMap(sizes, next);
  };

  const fillActive = (qty: number) => {
    const n = Math.max(0, Math.floor(qty) || 0);
    const next: SizeStockMap = { ...sizeStock };
    const active = sizes.length ? sizes : allSizes;
    for (const s of active) next[s] = n;
    applyMap(active, next);
  };

  const distributePool = (pool: number) => {
    const active = sizes.length ? sizes : allSizes;
    if (!active.length) return;
    const totalPool = Math.max(0, Math.floor(pool) || 0);
    const base = Math.floor(totalPool / active.length);
    let rem = totalPool - base * active.length;
    const next: SizeStockMap = { ...sizeStock };
    for (const s of active) {
      next[s] = base + (rem > 0 ? 1 : 0);
      if (rem > 0) rem -= 1;
    }
    applyMap(active, next);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const next: SizeStockMap = {};
    for (const s of allSizes) next[s] = 0;
    for (const s of preset.sizes) next[s] = preset.qty;
    applyMap([...preset.sizes], next);
  };

  const bumpActive = (delta: number) => {
    const next: SizeStockMap = { ...sizeStock };
    for (const s of sizes) {
      next[s] = Math.max(0, (next[s] ?? 0) + delta);
    }
    applyMap(sizes, next);
  };

  return (
    <div className={`size-stock-manager ${compact ? "is-compact" : ""}`}>
      {!compact && (
        <div className="size-stock-manager-head">
          <div>
            <p className="admin-label mb-0">Size inventory</p>
            <p className="font-ui text-xs text-pearl-muted mt-1">
              Select a size, then set pieces with + / −
            </p>
          </div>
          <div className="size-stock-total">
            <span className="size-stock-total-label">Total</span>
            <span className="size-stock-total-value">{total}</span>
          </div>
        </div>
      )}

      <div className="size-stock-tools">
        <div className="size-stock-presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="size-stock-chip-btn"
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
          <button type="button" className="size-stock-chip-btn" onClick={enableAll}>
            All sizes
          </button>
          <button type="button" className="size-stock-chip-btn" onClick={() => bumpActive(5)}>
            +5 each
          </button>
          <button type="button" className="size-stock-chip-btn is-muted" onClick={clearStock}>
            Clear
          </button>
        </div>

        <div className="size-stock-quick-row">
          <label className="size-stock-quick">
            <span>Fill</span>
            <input
              type="number"
              min={0}
              value={fillQty}
              onChange={(e) => setFillQty(Number(e.target.value))}
            />
            <button type="button" onClick={() => fillActive(fillQty)}>
              Apply
            </button>
          </label>
          <label className="size-stock-quick">
            <span>Split</span>
            <input
              type="number"
              min={0}
              value={poolQty}
              onChange={(e) => setPoolQty(Number(e.target.value))}
            />
            <button type="button" onClick={() => distributePool(poolQty)}>
              Even
            </button>
          </label>
        </div>

        {(lowCount > 0 || emptyCount > 0) && (
          <div className="size-stock-alerts">
            {lowCount > 0 && (
              <span className="size-stock-alert is-low">{lowCount} low</span>
            )}
            {emptyCount > 0 && (
              <span className="size-stock-alert is-empty">{emptyCount} empty</span>
            )}
          </div>
        )}
      </div>

      <div className="size-stock-rail" role="list">
        {allSizes.map((s) => {
          const on = sizes.includes(s);
          const qty = sizeStock[s] ?? 0;
          const tone = !on ? "" : qty === 0 ? "is-empty" : qty <= 5 ? "is-low" : "is-ok";

          return (
            <div
              key={s}
              role="listitem"
              className={`size-stock-row ${on ? "is-on" : "is-off"} ${tone}`}
            >
              <button
                type="button"
                className={`size-stock-label-btn ${on ? "is-on" : ""}`}
                onClick={() => onToggle(s)}
                aria-pressed={on}
                aria-label={`Select size ${s}`}
              >
                {s}
              </button>

              <div className="size-stock-stepper">
                <button
                  type="button"
                  className="size-stock-step"
                  disabled={!on || qty <= 0}
                  onClick={() => onQty(s, qty - 1)}
                  aria-label={`Decrease ${s}`}
                >
                  −
                </button>
                <input
                  className="size-stock-qty"
                  type="number"
                  min={0}
                  disabled={!on}
                  value={on ? qty : 0}
                  onChange={(e) => onQty(s, Number(e.target.value))}
                  aria-label={`${s} quantity`}
                />
                <button
                  type="button"
                  className="size-stock-step"
                  disabled={!on}
                  onClick={() => onQty(s, qty + 1)}
                  aria-label={`Increase ${s}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
