import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import TrackOrderClient from "@/components/store/TrackOrderClient";

export default function TrackOrderPage() {
  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <TrackOrderClient />
      <StoreFooter />
    </div>
  );
}
