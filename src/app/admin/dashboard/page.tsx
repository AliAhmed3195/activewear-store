import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [
    productCount,
    activeCount,
    draftCount,
    orderCount,
    pendingCount,
    revenue,
    lowStock,
    categoryCount,
    customerAgg,
    recentOrders,
    codCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { totalCents: true },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 }, product: { status: "ACTIVE" } },
      orderBy: { stock: "asc" },
      take: 8,
      select: {
        id: true,
        stock: true,
        colorName: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.category.count(),
    prisma.order.groupBy({
      by: ["email"],
      _count: { email: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.count({ where: { paymentMethod: "COD" } }),
  ]);

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Dashboard</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Welcome back, {session.user.name} — manage the full store from here
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link href="/admin/products" className="luxury-card p-5 hover:border-copper/40 transition-colors">
          <p className="admin-label">Products</p>
          <p className="font-display text-3xl text-pearl mt-2">{productCount}</p>
          <p className="font-ui text-xs text-pearl-muted mt-1">
            {activeCount} active · {draftCount} draft
          </p>
        </Link>
        <Link href="/admin/orders" className="luxury-card p-5 hover:border-copper/40 transition-colors">
          <p className="admin-label">Orders</p>
          <p className="font-display text-3xl text-pearl mt-2">{orderCount}</p>
          <p className="font-ui text-xs text-pearl-muted mt-1">{pendingCount} pending</p>
        </Link>
        <div className="luxury-card p-5">
          <p className="admin-label">Revenue</p>
          <p className="font-display text-3xl text-copper mt-2">
            {formatPrice(revenue._sum.totalCents ?? 0)}
          </p>
          <p className="font-ui text-xs text-pearl-muted mt-1">{codCount} COD orders</p>
        </div>
        <Link href="/admin/customers" className="luxury-card p-5 hover:border-copper/40 transition-colors">
          <p className="admin-label">Customers</p>
          <p className="font-display text-3xl text-pearl mt-2">{customerAgg.length}</p>
          <p className="font-ui text-xs text-pearl-muted mt-1">{categoryCount} categories</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-pearl">Recent Orders</h2>
            <Link href="/admin/orders" className="font-ui text-xs text-blush tracking-widest capitalize">
              View All
            </Link>
          </div>
          <div className="luxury-card overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.name}</td>
                    <td className="text-copper">{formatPrice(order.totalCents, order.currency)}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-pearl-muted py-8">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-pearl">Low Stock</h2>
            <Link href="/admin/inventory" className="font-ui text-xs text-blush tracking-widest capitalize">
              Inventory
            </Link>
          </div>
          <div className="luxury-card overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span className="font-display">{v.product.name}</span>
                      <span className="block text-xs text-pearl-muted">
                        {v.colorName} · {v.product.slug}
                      </span>
                    </td>
                    <td className={v.stock === 0 ? "text-red-400" : "text-copper"}>{v.stock}</td>
                    <td>
                      <Link href={`/admin/products/${v.product.id}/edit`} className="font-ui text-xs text-blush">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-pearl-muted py-8">
                      All active products have healthy stock
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn-copper">
          Add Product
        </Link>
        <Link href="/admin/categories" className="btn-outline">
          Categories
        </Link>
        <Link href="/admin/settings" className="btn-outline">
          Settings
        </Link>
      </div>
    </AdminShell>
  );
}
