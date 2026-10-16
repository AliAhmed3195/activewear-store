import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import { IconArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main error-page">
        <p className="error-page-code" aria-hidden="true">404</p>
        <p className="section-eyebrow mt-4">Page Not Found</p>
        <h1 className="font-display text-4xl md:text-5xl text-pearl mt-3">Lost in the Dark</h1>
        <p className="font-ui text-base text-pearl-muted mt-4 max-w-md leading-relaxed">
          The piece you are looking for has slipped away. Let us guide you back to the collection.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/" className="btn-copper">
            Return Home
          </Link>
          <Link href="/shop" className="btn-outline">
            Browse the Shop
            <IconArrowRight size={14} />
          </Link>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
