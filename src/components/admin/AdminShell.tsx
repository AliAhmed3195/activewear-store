"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

import { storeName } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin/dashboard" className="block mb-8">
          <span className="font-display text-pearl text-lg">{storeName()}</span>
          <span className="badge-micro block mt-1">Admin</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "admin-nav-link",
                pathname.startsWith(item.href) && "active"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[var(--divider)] space-y-2">
          <Link href="/" className="admin-nav-link">
            View Store
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="admin-nav-link w-full text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <div className="admin-content w-full">
        <nav className="flex gap-2 mb-6 overflow-x-auto lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "admin-nav-link whitespace-nowrap",
                pathname.startsWith(item.href) && "active"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
