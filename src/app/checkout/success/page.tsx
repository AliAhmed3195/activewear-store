import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ClearCartOnSuccess from "@/components/store/ClearCartOnSuccess";
import { IconGem } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Order Confirmed",
};

interface SuccessPageProps {
  searchParams: Promise<{ total?: string; order?: string; method?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const totalCents = params.total ? Number(params.total) : 0;
  const orderNumber = params.order?.trim();
  const method = params.method ?? "COD";

  const order = orderNumber
    ? await prisma.order.findFirst({
        where: { orderNumber },
        include: { items: true },
      })
    : null;

  const displayTotal = order?.totalCents ?? totalCents;
  const isCod = (order?.paymentMethod ?? method) === "COD";

  return (
    <div className="store-page">
      <StoreHeader />
      <ClearCartOnSuccess />
      <main className="store-main checkout-success">
        <div className="luxury-card p-8 md:p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-full border border-blush/30 flex items-center justify-center text-blush mb-5">
            <IconGem size={24} />
          </div>
          <span className="badge-micro">{isCod ? "COD Order Received" : "Payment Confirmed"}</span>
          <h1 className="font-display text-3xl md:text-4xl text-pearl mt-3">Thank You</h1>
          <p className="font-ui text-sm text-pearl-muted mt-4 leading-relaxed">
            {isCod
              ? "Your cash-on-delivery order is confirmed. Our team will call or WhatsApp you to verify before dispatch. Packaging is always discreet."
              : "Your payment was successful. We will notify you when your order ships — always in discreet packaging."}
          </p>
          {order?.orderNumber && (
            <p className="font-ui text-sm text-pearl mt-4">
              Order number{" "}
              <span className="text-copper tracking-wide">{order.orderNumber}</span>
            </p>
          )}
          {displayTotal > 0 && (
            <p className="font-display text-2xl text-copper mt-4">{formatPrice(displayTotal)}</p>
          )}
          <div className="copper-line w-full my-6" />
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/track" className="btn-copper inline-flex">
              Track Order
            </Link>
            <Link href="/shop" className="btn-outline inline-flex">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
