"use client";

import { useState } from "react";
import { adminFetchJson } from "@/lib/admin-fetch";

export type AdminReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  approved: boolean;
  product: { name: string; slug: string } | null;
};

export default function AdminReviewsTable({ reviews: initial }: { reviews: AdminReviewRow[] }) {
  const [reviews, setReviews] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setApproved = async (id: string, approved: boolean) => {
    setError(null);
    setBusyId(id);
    try {
      const updated = await adminFetchJson<AdminReviewRow>(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update review");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, author: string) => {
    if (!confirm(`Delete review from "${author}"?`)) return;
    setError(null);
    setBusyId(id);
    try {
      await adminFetchJson(`/api/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete review");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-8 space-y-3">
      {error && (
        <p className="admin-brand-error font-ui" role="alert">
          {error}
        </p>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Product</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.authorName}</td>
                <td>{r.rating}/5</td>
                <td className="max-w-xs">
                  {r.title && <span className="block font-display text-xs text-pearl">{r.title}</span>}
                  <span className="block truncate text-pearl-muted">{r.body}</span>
                </td>
                <td>{r.product?.name ?? "—"}</td>
                <td>
                  <span className={r.approved ? "text-copper" : "text-pearl-muted"}>
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  {r.approved ? (
                    <button
                      type="button"
                      className="font-ui text-xs text-pearl-muted mr-3"
                      disabled={busyId === r.id}
                      onClick={() => setApproved(r.id, false)}
                    >
                      Unapprove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="font-ui text-xs text-copper mr-3"
                      disabled={busyId === r.id}
                      onClick={() => setApproved(r.id, true)}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    type="button"
                    className="font-ui text-xs text-red-400"
                    disabled={busyId === r.id}
                    onClick={() => remove(r.id, r.authorName)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-pearl-muted py-8">
                  No reviews yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="font-ui text-xs text-pearl-muted">
        Approved reviews update product ratings on the storefront immediately.
      </p>
    </div>
  );
}
