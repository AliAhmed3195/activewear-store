import type { Metadata } from "next";
import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import CustomOrderForm from "@/components/store/CustomOrderForm";
import { FABRIC_OPTIONS, FABRIC_QUALITY_POINTS } from "@/lib/fabric-catalog";
import { storeName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Custom & Team Orders",
  description:
    "Request custom VIFACTIVE kits — names, numbers, logos, and bulk sizing. Quote within 24–48 hours.",
};

export default function CustomPage() {
  const name = storeName();

  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="custom-page">
        <section className="custom-hero">
          <p className="peak-section-kicker">Teams · Clubs · Corporate</p>
          <h1 className="peak-section-title section-title text-pearl">
            Custom merch & team kits
          </h1>
          <p className="peak-section-sub font-ui">
            Need {name} pieces with names, numbers, or your logo? Send a quote request — we
            confirm fabric, print, pricing, and timeline before production.
          </p>
          <ul className="custom-hero-points">
            <li>Full sublimation ready fabrics</li>
            <li>Names · numbers · logo print</li>
            <li>Bulk sizes + optional custom measurements</li>
            <li>Min 6 pieces · reply in 24–48 hrs</li>
          </ul>
        </section>

        <div className="custom-layout">
          <div className="custom-panel">
            <h2 className="custom-panel-title">Request a quote</h2>
            <CustomOrderForm />
          </div>

          <aside className="custom-aside">
            <div className="custom-aside-card">
              <h3>Fabric program</h3>
              <p>Quality knits from our supplier sheet — pick one in the form.</p>
              <ul className="custom-fabric-list">
                {FABRIC_OPTIONS.map((f) => (
                  <li key={f.id}>
                    <strong>{f.name}</strong>
                    <span>
                      {f.gsm} · {f.feel}
                    </span>
                    <em>from PKR {f.ratePkr.toLocaleString("en-PK")}</em>
                  </li>
                ))}
              </ul>
            </div>
            <div className="custom-aside-card">
              <h3>Quality promise</h3>
              <ul>
                {FABRIC_QUALITY_POINTS.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link href="/shop" className="peak-text-link">
                Browse ready-made →
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
