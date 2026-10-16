import Link from "next/link";

const GROUPS = [
  {
    title: "Catalog",
    description: "Manage products, stock, and collections from the sidebar.",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/inventory", label: "Inventory" },
      { href: "/admin/categories", label: "Categories" },
    ],
  },
  {
    title: "Orders & buyers",
    description: "Update fulfillment status, track COD, and review customer history.",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/track", label: "Order tracking" },
    ],
  },
];

export default function AdminSettingsShortcuts() {
  return (
    <div className="admin-settings-shortcuts">
      {GROUPS.map((group) => (
        <div key={group.title} className="admin-settings-card luxury-card">
          <p className="admin-settings-card-kicker font-ui">{group.title}</p>
          <h2 className="admin-settings-card-title font-display">Quick links</h2>
          <p className="admin-settings-card-desc font-ui">{group.description}</p>
          <div className="admin-settings-card-actions">
            {group.links.map((link) => (
              <Link key={link.href} href={link.href} className="admin-chip-link font-ui">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
