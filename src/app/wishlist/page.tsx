import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import PageHero from "@/components/store/PageHero";
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
        <PageHero
          eyebrow="Saved for later"
          title="Wishlist"
          description="Pieces you save stay on this device, even after a refresh."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        />
        <div className="container-luxury pb-16">
          <WishlistView />
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
