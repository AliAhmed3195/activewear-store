import Link from "next/link";
import { redirect } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import AccountAuthForm from "@/components/store/AccountAuthForm";
import { getCustomerSession } from "@/lib/customer-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your VIFACTIVE account.",
};

export default async function AccountLoginPage() {
  const session = await getCustomerSession();
  if (session) redirect("/account");

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main account-auth-page">
        <div className="account-auth-card">
          <p className="peak-section-kicker">Customer account</p>
          <h1 className="peak-section-title">Sign In</h1>
          <p className="peak-section-sub font-ui">
            Access order details and track your purchases.
          </p>
          <AccountAuthForm mode="login" />
          <p className="font-ui text-sm text-pearl-muted mt-4">
            Guest checkout still works — or{" "}
            <Link href="/track" className="peak-text-link">
              track an order
            </Link>
            .
          </p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
