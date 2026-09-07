import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import Sparkline from "@/components/admin/Sparkline";
import DashboardOrdersTable from "@/components/admin/DashboardOrdersTable";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const todayStart = startOfDay(new Date());
  const weekStart = daysAgo(6);

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
    unpaidCod,
    cancelledRecent,
    weekOrders,
    todayOrders,
    paidOrderCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: [...PAID_STATUSES] } },
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
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.count({
      where: { paymentMethod: "COD", status: "PENDING" },
    }),
    prisma.order.count({
      where: {
        status: { in: ["CANCELLED", "REFUNDED"] },
        createdAt: { gte: daysAgo(7) },
      },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: weekStart },
        status: { not: "CANCELLED" },
      },
      select: { totalCents: true, status: true, createdAt: true, paymentMethod: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: { not: "CANCELLED" },
      },
      select: { totalCents: true, status: true },
    }),
    prisma.order.count({ where: { status: { in: [...PAID_STATUSES] } } }),
  ]);

  const salesToday = todayOrders
    .filter((o) => (PAID_STATUSES as readonly string[]).includes(o.status))
    .reduce((s, o) => s + o.totalCents, 0);
  const ordersToday = todayOrders.length;

  const salesWeek = weekOrders
    .filter((o) => (PAID_STATUSES as readonly string[]).includes(o.status))
    .reduce((s, o) => s + o.totalCents, 0);
  const ordersWeek = weekOrders.length;

  const totalRevenue = revenue._sum.totalCents ?? 0;
  const aov = paidOrderCount > 0 ? Math.round(totalRevenue / paidOrderCount) : 0;
  const conversionRate =
    orderCount > 0 ? Math.round((paidOrderCount / orderCount) * 100) : 0;

  const dayKeys: string[] = [];
  const salesByDay: number[] = [];
  const ordersByDay: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    dayKeys.push(key);
    const dayOrders = weekOrders.filter(
      (o) => o.createdAt.toISOString().slice(0, 10) === key
    );
    ordersByDay.push(dayOrders.length);
    salesByDay.push(
      dayOrders
        .filter((o) => (PAID_STATUSES as readonly string[]).includes(o.status))
        .reduce((s, o) => s + o.totalCents, 0)
    );
  }

  const alerts: { tone: "warn" | "danger" | "info"; text: string; href: string }[] = [];
  if (lowStock.length > 0) {
    alerts.push({
      tone: "warn",
      text: `${lowStock.length} variant${lowStock.length === 1 ? "" : "s"} low on stock`,
      href: "/admin/inventory",
    });
  }
  if (unpaidCod > 0) {
    alerts.push({
      tone: "info",
      text: `${unpaidCod} unpaid COD order${unpaidCod === 1 ? "" : "s"} pending`,
      href: "/admin/orders",
    });
  }
  if (cancelledRecent > 0) {
    alerts.push({
      tone: "danger",
      text: `${cancelledRecent} cancelled/refunded in last 7 days`,
      href: "/admin/orders",
    });
  }
  if (pendingCount > 0) {
    alerts.push({
      tone: "info",
      text: `${pendingCount} order${pendingCount === 1 ? "" : "s"} awaiting action`,
      href: "/admin/orders",
    });
  }

  const activity = recentOrders.slice(0, 10).map((o) => ({
    id: o.id,
    title: `Order ${o.orderNumber}`,
    detail: `${o.name} · ${o.paymentMethod} · ${formatPrice(o.totalCents, o.currency)}`,
    status: o.status,
    when: o.createdAt,
  }));

  return (
    <AdminShell>
      <div className="dash-head">
        <div>
          <h1 className="font-display text-2xl text-pearl">Dashboard</h1>
          <p className="font-ui text-sm text-pearl-muted mt-1">
            Welcome back, {session.user.name ?? "Admin"} — store pulse at a glance
          </p>
        </div>
        <div className="dash-quick">
          <Link href="/admin/products/new" className="btn-copper dash-quick-btn">
            New product
          </Link>
          <Link href="/admin/orders" className="btn-outline dash-quick-btn">
            Pending orders
          </Link>
          <Link href="/admin/inventory" className="btn-outline dash-quick-btn">
            Low stock
          </Link>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="dash-alerts">
          {alerts.map((a) => (
            <Link key={a.text} href={a.href} className={`dash-alert is-${a.tone}`}>
              {a.text}
            </Link>
          ))}
        </div>
      )}

      <div className="dash-kpi-grid">
        <div className="dash-kpi">
          <p className="admin-label">Sales today</p>
          <p className="dash-kpi-value text-copper">{formatPrice(salesToday)}</p>
          <p className="dash-kpi-sub">{ordersToday} orders today</p>
        </div>
        <div className="dash-kpi">
          <p className="admin-label">Sales (7 days)</p>
          <p className="dash-kpi-value">{formatPrice(salesWeek)}</p>
          <p className="dash-kpi-sub">{ordersWeek} orders this week</p>
        </div>
        <div className="dash-kpi">
          <p className="admin-label">AOV</p>
          <p className="dash-kpi-value">{formatPrice(aov)}</p>
          <p className="dash-kpi-sub">Avg order value (paid)</p>
        </div>
        <div className="dash-kpi">
          <p className="admin-label">Paid rate</p>
          <p className="dash-kpi-value">{conversionRate}%</p>
          <p className="dash-kpi-sub">
            {paidOrderCount}/{orderCount} non-cancelled paid
          </p>
        </div>
      </div>

      <div className="dash-kpi-grid dash-kpi-grid-secondary">
        <Link href="/admin/products" className="dash-kpi is-link">
          <p className="admin-label">Products</p>
          <p className="dash-kpi-value">{productCount}</p>
          <p className="dash-kpi-sub">
            {activeCount} active · {draftCount} draft
          </p>
        </Link>
        <Link href="/admin/orders" className="dash-kpi is-link">
          <p className="admin-label">Orders</p>
          <p className="dash-kpi-value">{orderCount}</p>
          <p className="dash-kpi-sub">{pendingCount} pending</p>
        </Link>
        <div className="dash-kpi">
          <p className="admin-label">Lifetime revenue</p>
          <p className="dash-kpi-value text-copper">{formatPrice(totalRevenue)}</p>
          <p className="dash-kpi-sub">{categoryCount} categories</p>
        </div>
        <Link href="/admin/customers" className="dash-kpi is-link">
          <p className="admin-label">Customers</p>
          <p className="dash-kpi-value">{customerAgg.length}</p>
          <p className="dash-kpi-sub">Unique checkout emails</p>
        </Link>
      </div>

      <div className="dash-charts">
        <div className="dash-chart-card">
          <div className="dash-chart-head">
            <div>
              <p className="admin-label">7-day sales</p>
              <p className="dash-chart-title">{formatPrice(salesWeek)}</p>
            </div>
            <Sparkline values={salesByDay} />
          </div>
          <div className="dash-chart-days">
            {dayKeys.map((k) => (
              <span key={k}>
                {new Date(k + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}
              </span>
            ))}
          </div>
        </div>
        <div className="dash-chart-card">
          <div className="dash-chart-head">
            <div>
              <p className="admin-label">7-day orders</p>
              <p className="dash-chart-title">{ordersWeek}</p>
            </div>
            <Sparkline values={ordersByDay} stroke="#a3e635" />
          </div>
          <div className="dash-chart-days">
            {dayKeys.map((k) => (
              <span key={k}>
                {new Date(k + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-panels">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Recent orders</h2>
            <Link href="/admin/orders">View all</Link>
          </div>
          <DashboardOrdersTable
            orders={recentOrders.slice(0, 10).map((order) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              name: order.name,
              paymentMethod: order.paymentMethod,
              totalCents: order.totalCents,
              currency: order.currency,
              status: order.status,
            }))}
          />
        </section>

        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Activity</h2>
            <span className="dash-panel-meta">Last 10</span>
          </div>
          <ul className="dash-activity">
            {activity.map((a) => (
              <li key={a.id}>
                <div className="min-w-0">
                  <p className="dash-activity-title">{a.title}</p>
                  <p className="dash-activity-detail truncate">{a.detail}</p>
                </div>
                <div className="dash-activity-right">
                  <StatusBadge status={a.status} />
                  <time dateTime={a.when.toISOString()}>
                    {a.when.toLocaleString("en", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </li>
            ))}
            {activity.length === 0 && (
              <li className="text-pearl-muted text-sm py-6 justify-center">No recent activity</li>
            )}
          </ul>
        </section>
      </div>

      <div className="dash-panels mt-4">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Low stock</h2>
            <Link href="/admin/inventory">Inventory</Link>
          </div>
          <div className="dash-table-wrap">
            <table className="admin-table dash-table">
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
                      <span className="font-medium">{v.product.name}</span>
                      <span className="block text-[11px] text-pearl-muted">
                        {v.colorName}
                      </span>
                    </td>
                    <td className={v.stock === 0 ? "text-red-400" : "text-copper"}>{v.stock}</td>
                    <td>
                      <Link
                        href={`/admin/products/${v.product.id}/edit`}
                        className="font-ui text-xs text-copper"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-pearl-muted py-8">
                      Stock looks healthy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dash-panel dash-help">
          <div className="dash-panel-head">
            <h2>Quick links</h2>
          </div>
          <div className="dash-links">
            <Link href="/admin/products">Manage products</Link>
            <Link href="/admin/categories">Categories ({categoryCount})</Link>
            <Link href="/admin/reviews">Reviews</Link>
            <Link href="/admin/settings">Store settings</Link>
            <Link href="/" target="_blank">
              Open storefront ↗
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
