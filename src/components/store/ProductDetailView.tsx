"use client";

import { useState } from "react";
import ProductMediaStage from "@/components/store/ProductMediaStage";
import VariantProductActions, { ProductMeta } from "@/components/store/VariantProductActions";
import { IconGlobe, IconLock, IconGem, IconHeadset } from "@/components/ui/icons";
import type { Product } from "@/types";

const ASSURANCES = [
  { icon: IconLock, text: "Cash on Delivery", sub: "Pay on arrival" },
  { icon: IconGem, text: "Quality Checked", sub: "Performance fabrics" },
  { icon: IconHeadset, text: "Easy Returns", sub: "Hassle-free support" },
  { icon: IconGlobe, text: "Fast Dispatch", sub: "Nationwide shipping" },
];

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    shipping: false,
  });

  if (!variant) {
    return <p className="text-pearl-muted">Product unavailable.</p>;
  }

  const toggle = (key: string) =>
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="pdp-layout">
      <section className="pdp-media" aria-label="Product images">
        <ProductMediaStage product={product} variant={variant} />
      </section>

      <aside className="pdp-info">
        <div className="pdp-meta-row">
          <span className="pdp-gender">{product.gender.replace("_", " ")}</span>
          {product.category && <span className="pdp-cat">{product.category.name}</span>}
        </div>

        <ProductMeta product={product} />

        <VariantProductActions
          product={product}
          variant={variant}
          onVariantChange={setVariant}
        />

        <div className="pdp-trust">
          {ASSURANCES.map((a) => (
            <div key={a.text} className="pdp-trust-item">
              <a.icon size={18} />
              <div>
                <strong>{a.text}</strong>
                <span>{a.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pdp-accordions">
          <div className={`pdp-acc ${openAccordions.details ? "is-open" : ""}`}>
            <button type="button" className="pdp-acc-btn" onClick={() => toggle("details")}>
              <span>Product details</span>
              <span aria-hidden="true">{openAccordions.details ? "−" : "+"}</span>
            </button>
            {openAccordions.details && (
              <div className="pdp-acc-body">
                <p>{product.description}</p>
                {product.material && (
                  <p>
                    <strong>Material:</strong> {product.material}
                  </p>
                )}
                <ul>
                  <li>Performance fit for gym, run, and everyday</li>
                  <li>Breathable construction for long sessions</li>
                  <li>Designed for comfort without losing shape</li>
                </ul>
              </div>
            )}
          </div>

          <div className={`pdp-acc ${openAccordions.shipping ? "is-open" : ""}`}>
            <button type="button" className="pdp-acc-btn" onClick={() => toggle("shipping")}>
              <span>Shipping & returns</span>
              <span aria-hidden="true">{openAccordions.shipping ? "−" : "+"}</span>
            </button>
            {openAccordions.shipping && (
              <div className="pdp-acc-body">
                <p>Nationwide delivery across Pakistan. International checkout available at cart.</p>
                <p>COD available for Pakistan orders. Card payments via Stripe worldwide.</p>
                <p>Easy returns on eligible unused items — contact support for help.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
