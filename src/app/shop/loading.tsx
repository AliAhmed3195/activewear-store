import StoreHeader from "@/components/store/StoreHeaderServer";
import PageHero from "@/components/store/PageHero";
import ProductGridSkeleton from "@/components/store/ProductGridSkeleton";
import { storeName } from "@/lib/utils";

export default function ShopLoading() {
  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <PageHero
          eyebrow={storeName()}
          title="All Products"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        />
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
