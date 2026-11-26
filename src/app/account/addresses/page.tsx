import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import AddressesClient from "@/components/store/AddressesClient";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Saved Addresses",
  description: "Manage shipping addresses for faster checkout.",
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?next=/account/addresses");

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main account-page">
        <section className="shop-hero">
          <p className="peak-section-kicker">My Account</p>
          <h1 className="peak-section-title section-title text-pearl">Saved addresses</h1>
          <p className="peak-section-sub font-ui">
            Keep a default shipping address for faster checkout.
          </p>
          <div className="account-actions">
            <Link href="/account" className="peak-text-link">
              Orders →
            </Link>
            <Link href="/account/wishlist" className="peak-text-link">
              Wishlist →
            </Link>
          </div>
        </section>

        <AddressesClient />
      </main>
      <StoreFooter />
    </div>
  );
}
