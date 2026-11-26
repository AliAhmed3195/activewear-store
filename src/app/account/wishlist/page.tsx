import Link from "next/link";
import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import WishlistClient from "@/components/store/WishlistClient";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved VIFACTIVE pieces — jump back in and add to bag.",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const settings = await getSiteSettings();

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main account-page">
        <section className="shop-hero">
          <p className="peak-section-kicker">Saved</p>
          <h1 className="peak-section-title section-title text-pearl">Wishlist</h1>
          <p className="peak-section-sub font-ui">
            Pieces you saved for later. Sign in is optional — wishlist stays on this device.
          </p>
          <div className="account-actions">
            <Link href="/account" className="peak-text-link">
              My account →
            </Link>
            <Link href="/shop" className="peak-text-link">
              Continue shopping →
            </Link>
          </div>
        </section>

        <WishlistClient showRatings={settings.showRatingsOnCards} />
      </main>
      <StoreFooter />
    </div>
  );
}
