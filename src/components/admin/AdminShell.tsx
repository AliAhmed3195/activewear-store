"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn, storeName } from "@/lib/utils";

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
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Admin";
  const userEmail = session?.user?.email ?? "";
  const role = (session?.user as { role?: string } | undefined)?.role ?? "ADMIN";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin/dashboard" className="admin-brand block mb-8">
          <span className="font-display text-pearl text-lg">{storeName()}</span>
          <span className="admin-brand-sub">Operations</span>
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

      <div className="admin-content w-full min-w-0">
        <header className="admin-topbar">
          <div className="admin-topbar-user">
            <div className="admin-avatar" aria-hidden="true">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="admin-topbar-name truncate">{userName}</p>
              <p className="admin-topbar-meta truncate">
                {role}
                {userEmail ? ` · ${userEmail}` : ""}
                {" · "}
                {new Date().toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <nav className="admin-mobile-nav lg:hidden">
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
        </header>
        {children}
      </div>
    </div>
  );
}
