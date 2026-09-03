import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const currency = (process.env.NEXT_PUBLIC_CURRENCY ?? "usd").toUpperCase();
  const shippingCents = Number(process.env.SHIPPING_FLAT_RATE_CENTS ?? "999");
  const freeOver = Number(process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? "7500");
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.ORDER_NOTIFY_WHATSAPP || "—";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.RESEND_FROM || "—";
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  const rows = [
    { label: "Currency", value: currency },
    {
      label: "Standard shipping",
      value: formatPrice(shippingCents, currency),
    },
    {
      label: "Free shipping over",
      value: formatPrice(freeOver, currency),
    },
    { label: "WhatsApp / notify", value: whatsapp },
    { label: "Support email", value: supportEmail },
    { label: "Email (Resend)", value: resendConfigured ? "Configured" : "Not set" },
    { label: "Stripe cards", value: stripeConfigured ? "Configured" : "Not set (COD still works)" },
    { label: "Signed in as", value: `${session.user.name} · ${session.user.email}` },
  ];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Settings</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Store configuration from environment — edit values in <code>.env.local</code> then restart
        the server
      </p>

      <div className="luxury-card mt-8 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="font-ui text-pearl-muted">{r.label}</td>
                <td className="font-display text-pearl">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="luxury-card p-5">
          <h2 className="font-display text-lg text-pearl">Catalog</h2>
          <p className="font-ui text-sm text-pearl-muted mt-2">
            Manage products, stock, and collections from the sidebar.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/admin/products" className="btn-outline text-[10px] py-2 px-3">
              Products
            </Link>
            <Link href="/admin/inventory" className="btn-outline text-[10px] py-2 px-3">
              Inventory
            </Link>
            <Link href="/admin/categories" className="btn-outline text-[10px] py-2 px-3">
              Categories
            </Link>
          </div>
        </div>
        <div className="luxury-card p-5">
          <h2 className="font-display text-lg text-pearl">Orders &amp; buyers</h2>
          <p className="font-ui text-sm text-pearl-muted mt-2">
            Update fulfillment status, track COD, and review customer history.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/admin/orders" className="btn-outline text-[10px] py-2 px-3">
              Orders
            </Link>
            <Link href="/admin/customers" className="btn-outline text-[10px] py-2 px-3">
              Customers
            </Link>
            <Link href="/track" className="btn-outline text-[10px] py-2 px-3">
              Order tracking
            </Link>
          </div>
        </div>
      </div>

      <div className="luxury-card p-5 mt-6">
        <h2 className="font-display text-lg text-pearl">Admin login</h2>
        <p className="font-ui text-sm text-pearl-muted mt-2">
          Credentials are set via <code>SEED_ADMIN_EMAIL</code> / <code>SEED_ADMIN_PASSWORD</code> in
          env (seeded on <code>prisma db seed</code>). Default seed:{" "}
          <code>admin@elvenenoir.com</code>
        </p>
      </div>
    </AdminShell>
  );
}
