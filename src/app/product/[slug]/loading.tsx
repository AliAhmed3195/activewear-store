import StoreHeader from "@/components/store/StoreHeader";

export default function ProductLoading() {
  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <div className="skeleton skeleton-line" style={{ width: 220, height: 12 }} />
        <div className="product-detail-grid">
          <div className="skeleton" style={{ aspectRatio: "4 / 5", width: "100%" }} />
          <div className="space-y-4">
            <div className="skeleton skeleton-line" style={{ width: "30%" }} />
            <div className="skeleton skeleton-line" style={{ width: "80%", height: 28 }} />
            <div className="skeleton skeleton-line" style={{ width: "50%" }} />
            <div className="skeleton skeleton-line" style={{ width: "100%", height: 44, marginTop: 24 }} />
            <div className="skeleton skeleton-line" style={{ width: "100%", height: 44 }} />
          </div>
        </div>
      </main>
    </div>
  );
}
