import CheckoutClient from "@/components/store/CheckoutClient";
import StoreHeader from "@/components/store/StoreHeaderServer";

export default function CheckoutPage() {
  return (
    <div className="store-page store-page-ambient checkout-page">
      <StoreHeader />
      <CheckoutClient />
    </div>
  );
}
