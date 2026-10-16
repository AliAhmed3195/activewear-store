import AdminProviders from "@/components/admin/AdminProviders";
import AdminThemeScript from "@/components/admin/AdminThemeScript";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-route" suppressHydrationWarning>
      <AdminThemeScript />
      <AdminProviders>{children}</AdminProviders>
    </div>
  );
}
