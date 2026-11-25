import Link from "next/link";
import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import { FABRIC_OPTIONS, FABRIC_QUALITY_POINTS } from "@/lib/fabric-catalog";
import { storeName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fabric Technology",
  description:
    "Verified VIFACTIVE fabric program — GSM weights, feel, and sublimation-ready knits for sportswear and team kits.",
};

export default function FabricPage() {
  const name = storeName();

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main fabric-page">
        <section className="fabric-hero">
          <p className="peak-section-kicker">{name} · Fabric technology</p>
          <h1 className="peak-section-title section-title text-pearl">
            Performance knits, verified GSM
          </h1>
          <p className="peak-section-sub font-ui">
            Close-up fabric program for sportswear and custom teamwear — GSM, feel, and product
            use from our supplier catalog. No invented tech claims.
          </p>
          <div className="fabric-hero-actions">
            <Link href="/shop" className="btn-pill btn-pill-dark">
              Shop sportswear
            </Link>
            <Link href="/custom" className="btn-pill btn-pill-outline">
              Custom teamwear
            </Link>
          </div>
        </section>

        <section className="fabric-points" aria-label="Quality points">
          <ul>
            {FABRIC_QUALITY_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="fabric-grid" aria-label="Fabric catalog">
          {FABRIC_OPTIONS.map((f) => (
            <article key={f.id} id={f.id} className="fabric-card">
              <div className="fabric-card-top">
                <h2>{f.name}</h2>
                <span className="fabric-gsm">{f.gsm}</span>
              </div>
              <p className="fabric-feel">{f.feel}</p>
              <p className="fabric-use">
                Built for {f.productType.toLowerCase()}. Starting from PKR{" "}
                {f.ratePkr.toLocaleString("en-PK")} (fabric program rate).
              </p>
              <ul>
                {f.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="fabric-card-actions">
                <Link href="/shop" className="peak-text-link">
                  Shop matching products →
                </Link>
                <Link href="/custom" className="peak-text-link">
                  Use in team kit →
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="fabric-cta-band">
          <h2>Need names, numbers, or logos?</h2>
          <p className="font-ui">
            Tricot and Lycra Mesh options are available on custom teamwear quotes.
          </p>
          <Link href="/custom" className="btn-pill btn-pill-dark">
            Start a quote
          </Link>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
