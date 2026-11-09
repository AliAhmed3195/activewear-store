import { redirect } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import AccountAuthForm from "@/components/store/AccountAuthForm";
import { getCustomerSession } from "@/lib/customer-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your VIFACTIVE customer account.",
};

export default async function AccountRegisterPage() {
  const session = await getCustomerSession();
  if (session) redirect("/account");

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main account-auth-page">
        <div className="account-auth-card">
          <p className="peak-section-kicker">Customer account</p>
          <h1 className="peak-section-title">Create Account</h1>
          <p className="peak-section-sub font-ui">
            Save your details for faster checkout and order history.
          </p>
          <AccountAuthForm mode="register" />
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
