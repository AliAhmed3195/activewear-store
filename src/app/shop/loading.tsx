import StoreHeader from "@/components/store/StoreHeader";
import ProductGridSkeleton from "@/components/store/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Elvene Noir</p>
          <h1 className="section-title mt-2">The Collection</h1>
          <div className="section-divider" />
        </section>
        <div className="shop-layout">
          <div className="shop-sidebar space-y-6">
            <div className="skeleton skeleton-line" style={{ width: "60%", height: 12 }} />
            <div className="skeleton skeleton-line" style={{ width: "90%" }} />
            <div className="skeleton skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton skeleton-line" style={{ width: "85%" }} />
          </div>
          <div>
            <ProductGridSkeleton count={9} />
          </div>
        </div>
      </main>
    </div>
  );
}
