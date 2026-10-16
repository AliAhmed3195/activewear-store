import AdminReviewsTable from "@/components/admin/AdminReviewsTable";
import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllReviewsAdmin } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const reviews = await getAllReviewsAdmin();

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Reviews</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Approve or remove reviews shown on the storefront
      </p>

      <AdminReviewsTable
        reviews={reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          approved: r.approved,
          product: r.product,
        }))}
      />
    </AdminShell>
  );
}
