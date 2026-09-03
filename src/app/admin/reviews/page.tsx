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
        Manage customer reviews shown on the storefront
      </p>

      <div className="admin-table-wrap mt-8">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Product</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.authorName}</td>
                <td>{r.rating}/5</td>
                <td className="max-w-xs truncate">{r.body}</td>
                <td>{r.product?.name ?? "—"}</td>
                <td>
                  <span className={r.approved ? "text-copper" : "text-pearl-muted"}>
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-ui text-xs text-pearl-muted mt-4">
        Add reviews via API or seed. Full review editor coming in admin Phase 2.
      </p>
    </AdminShell>
  );
}
