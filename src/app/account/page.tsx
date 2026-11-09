import Link from "next/link";
import { redirect } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import AccountLogoutButton from "@/components/store/AccountLogoutButton";
import type { Metadata } from "next";
import type { StoreCurrency } from "@/types";

export const metadata: Metadata = {
  title: "My Account",
  description: "View your VIFACTIVE account and recent orders.",
};

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");

  const orders = await prisma.order.findMany({
    where: { email: session.email },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { items: true },
  });

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main account-page">
        <section className="shop-hero">
          <p className="peak-section-kicker">My Account</p>
          <h1 className="peak-section-title section-title text-pearl">Hello, {session.name}</h1>
          <p className="peak-section-sub font-ui">{session.email}</p>
          <div className="account-actions">
            <Link href="/track" className="peak-text-link">
              Order tracking →
            </Link>
            <Link href="/shop" className="peak-text-link">
              Continue shopping →
            </Link>
            <AccountLogoutButton />
          </div>
        </section>

        <section className="account-orders">
          <h2 className="peak-section-title" style={{ fontSize: "1.35rem" }}>
            Order details
          </h2>
          {orders.length === 0 ? (
            <p className="peak-section-sub font-ui">No orders yet. Your purchases will show here.</p>
          ) : (
            <ul className="account-order-list">
              {orders.map((order) => (
                <li key={order.id} className="account-order-card">
                  <div className="account-order-top">
                    <strong>{order.orderNumber}</strong>
                    <span>{order.status}</span>
                  </div>
                  <p className="font-ui text-sm text-pearl-muted">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {formatPrice(order.totalCents, order.currency as StoreCurrency)}
                  </p>
                  <ul className="account-order-items">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.productName} · Size {item.size} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/track?order=${order.orderNumber}`} className="peak-text-link">
                    Track order →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
