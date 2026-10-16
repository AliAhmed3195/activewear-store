import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import WishlistView from "@/components/store/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved activewear pieces you want to come back to.",
};

export default function WishlistPage() {
  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Saved for later</p>
          <h1 className="section-title mt-2">Wishlist</h1>
          <div className="section-divider" />
          <p className="section-desc max-w-xl mx-auto">
            Pieces you save stay on this device, even after a refresh.
          </p>
        </section>
        <div className="container-luxury pb-16">
          <WishlistView />
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
