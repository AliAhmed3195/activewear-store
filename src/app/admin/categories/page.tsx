"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { slugify } from "@/lib/utils";

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setPosition(categories.length);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setPosition(cat.position);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name,
      slug: slug || slugify(name),
      description: description || undefined,
      position: Number(position),
    };
    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to save");
      return;
    }
    resetForm();
    load();
  };

  const remove = async (cat: CategoryRow) => {
    if (!confirm(`Delete category “${cat.name}”?`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(typeof data.error === "string" ? data.error : "Delete failed");
      return;
    }
    if (editingId === cat.id) resetForm();
    load();
  };

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Categories</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Create, edit, reorder, and delete collections
      </p>

      <form onSubmit={handleSubmit} className="luxury-card p-6 mt-8 admin-form-grid">
        <div className="md:col-span-2">
          <p className="font-ui text-xs text-blush tracking-widest capitalize mb-2">
            {editingId ? "Edit category" : "Add category"}
          </p>
        </div>
        <label>
          <span className="admin-label">Name</span>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingId) setSlug(slugify(e.target.value));
            }}
            required
          />
        </label>
        <label>
          <span className="admin-label">Slug</span>
          <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        <label className="md:col-span-2">
          <span className="admin-label">Description</span>
          <input className="admin-input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          <span className="admin-label">Position</span>
          <input
            className="admin-input"
            type="number"
            min={0}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button type="submit" className="btn-copper" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update Category" : "Add Category"}
          </button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={resetForm}>
              Cancel edit
            </button>
          )}
          {error && <p className="font-ui text-xs text-red-400">{error}</p>}
        </div>
      </form>

      <div className="luxury-card mt-8 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.position}</td>
                <td className="font-display">{cat.name}</td>
                <td className="text-pearl-muted">{cat.slug}</td>
                <td>{cat._count?.products ?? 0}</td>
                <td className="whitespace-nowrap">
                  <button
                    type="button"
                    className="font-ui text-xs text-blush mr-3"
                    onClick={() => startEdit(cat)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="font-ui text-xs text-red-400"
                    onClick={() => remove(cat)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-pearl-muted py-8">
                  No categories yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
