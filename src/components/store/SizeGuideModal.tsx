"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SHIRT_SIZE_CHART,
  SIZE_GUIDE_NOTES,
  TROUSER_SIZE_CHART,
} from "@/lib/size-charts";
import { cn } from "@/lib/utils";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "shirt" | "trouser";
}

export default function SizeGuideModal({
  open,
  onClose,
  defaultTab = "shirt",
}: SizeGuideModalProps) {
  const [tab, setTab] = useState<"shirt" | "trouser">(defaultTab);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="size-guide-overlay" role="dialog" aria-modal="true" aria-label="Size guide">
      <button type="button" className="size-guide-backdrop" aria-label="Close" onClick={onClose} />
      <div className="size-guide-panel size-guide-panel-pro">
        <div className="size-guide-head">
          <div>
            <p className="peak-section-kicker">Fit guide</p>
            <h2>Size chart</h2>
            <p className="size-guide-lead">
              Measure yourself and match the chart — most VIFACTIVE pieces are true to size.
            </p>
          </div>
          <button type="button" className="size-guide-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="size-guide-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "shirt"}
            className={cn(tab === "shirt" && "is-active")}
            onClick={() => setTab("shirt")}
          >
            Shirts / Tops
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "trouser"}
            className={cn(tab === "trouser" && "is-active")}
            onClick={() => setTab("trouser")}
          >
            Trousers / Bottoms
          </button>
        </div>

        {tab === "shirt" ? (
          <div className="size-guide-block" role="tabpanel">
            <h3>Shirts & tops (inches)</h3>
            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Length</th>
                    <th>Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {SHIRT_SIZE_CHART.map((r) => (
                    <tr key={r.size}>
                      <td>{r.size}</td>
                      <td>{r.chest}</td>
                      <td>{r.length}</td>
                      <td>{r.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="size-guide-block" role="tabpanel">
            <h3>Trousers & bottoms (inches)</h3>
            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Waist</th>
                    <th>Hip</th>
                    <th>Inseam</th>
                    <th>Length</th>
                  </tr>
                </thead>
                <tbody>
                  {TROUSER_SIZE_CHART.map((r) => (
                    <tr key={r.size}>
                      <td>{r.size}</td>
                      <td>{r.waist}</td>
                      <td>{r.hip}</td>
                      <td>{r.inseam}</td>
                      <td>{r.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ul className="size-guide-notes">
          {SIZE_GUIDE_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <Link href="/custom" className="btn-copper size-guide-cta" onClick={onClose}>
          Custom / team order
        </Link>
      </div>
    </div>
  );
}
