"use client";

import { useCallback, useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/countries";

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY = {
  label: "Home",
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "PK",
  isDefault: false,
};

export default function AddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/addresses");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setAddresses(data.addresses ?? []);
    } catch {
      setError("Could not load addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({
      label: a.label,
      name: a.name,
      phone: a.phone ?? "",
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? "",
      city: a.city,
      state: a.state ?? "",
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : "/api/account/addresses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  if (loading) {
    return <p className="peak-section-sub font-ui">Loading addresses…</p>;
  }

  return (
    <div className="addresses-layout">
      <ul className="address-list">
        {addresses.length === 0 && (
          <li className="peak-section-sub font-ui">No saved addresses yet.</li>
        )}
        {addresses.map((a) => (
          <li key={a.id} className="address-card">
            <div className="address-card-top">
              <strong>
                {a.label}
                {a.isDefault ? " · Default" : ""}
              </strong>
              <div className="address-card-actions">
                <button type="button" className="peak-text-link" onClick={() => startEdit(a)}>
                  Edit
                </button>
                <button type="button" className="peak-text-link" onClick={() => remove(a.id)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="font-ui text-sm">
              {a.name}
              {a.phone ? ` · ${a.phone}` : ""}
              <br />
              {a.addressLine1}
              {a.addressLine2 ? `, ${a.addressLine2}` : ""}
              <br />
              {a.city}
              {a.state ? `, ${a.state}` : ""} {a.postalCode}
              <br />
              {a.country}
            </p>
          </li>
        ))}
      </ul>

      <form className="address-form" onSubmit={save}>
        <h3 className="peak-section-title" style={{ fontSize: "1.15rem" }}>
          {editingId ? "Edit address" : "Add address"}
        </h3>
        {error && <p className="form-error">{error}</p>}
        <label>
          <span>Label</span>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Full name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Phone</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          <span>Address line 1</span>
          <input
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Address line 2</span>
          <input
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
          />
        </label>
        <label>
          <span>City</span>
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </label>
        <label>
          <span>State / Province</span>
          <input
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
        </label>
        <label>
          <span>Postal code</span>
          <input
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Country</span>
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="address-default-check">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          <span>Set as default</span>
        </label>
        <div className="address-form-actions">
          <button type="submit" className="btn-pill btn-pill-dark" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update address" : "Save address"}
          </button>
          {editingId && (
            <button type="button" className="btn-pill btn-pill-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
