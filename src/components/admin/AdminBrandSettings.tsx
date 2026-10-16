"use client";

import BrandLogo from "@/components/store/BrandLogo";
import { IconCheck, IconUpload } from "@/components/ui/icons";
import { storeName } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";

type Props = {
  initialLogoUrl: string | null;
};

type PreviewSurface = "header" | "footer";

export default function AdminBrandSettings({ initialLogoUrl }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewSurface>("header");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/store-branding/logo", { method: "POST", body });
      const data = (await res.json()) as { logoUrl?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setLogoUrl(data.logoUrl ?? null);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const removeLogo = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/store-branding/logo", { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not remove logo");
        return;
      }
      setLogoUrl(null);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  };

  const name = storeName();
  const hasCustomLogo = Boolean(logoUrl);

  return (
    <section
      className="admin-settings-card luxury-card admin-settings-brand"
      aria-labelledby="admin-brand-title"
    >
      <div className="admin-brand-head">
        <div className="admin-brand-head-copy">
          <p className="admin-settings-card-kicker font-ui">Storefront</p>
          <h2 id="admin-brand-title" className="admin-settings-card-title font-display">
            Brand logo
          </h2>
          <p className="admin-settings-card-desc font-ui admin-brand-desc">
            Updates the header and footer on the live shop. Transparent PNG or SVG reads best on our
            dark navigation.
          </p>
        </div>
        <span
          className={`admin-brand-status font-ui${hasCustomLogo ? " is-custom" : ""}`}
          aria-live="polite"
        >
          <span className="admin-brand-status-dot" aria-hidden="true" />
          {hasCustomLogo ? "Custom image" : "Text wordmark"}
        </span>
      </div>

      <div className="admin-brand-layout">
        <div className="admin-brand-preview-col">
          <div className="admin-brand-preview-toolbar">
            <span className="admin-brand-preview-label font-ui">Live preview</span>
            <div className="admin-brand-preview-tabs" role="tablist" aria-label="Preview surface">
              <button
                type="button"
                role="tab"
                aria-selected={preview === "header"}
                className={`admin-brand-preview-tab font-ui${preview === "header" ? " is-active" : ""}`}
                onClick={() => setPreview("header")}
              >
                Header
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={preview === "footer"}
                className={`admin-brand-preview-tab font-ui${preview === "footer" ? " is-active" : ""}`}
                onClick={() => setPreview("footer")}
              >
                Footer
              </button>
            </div>
          </div>

          <div className={`admin-brand-mock${busy ? " is-busy" : ""}`}>
            {preview === "header" ? (
              <div className="admin-brand-mock-header">
                <div className="admin-brand-mock-header-row">
                  <div className="admin-brand-mock-brand">
                    {logoUrl ? (
                      <img
                        key={logoUrl}
                        src={logoUrl}
                        alt=""
                        className="brand-logo-img store-brand-logo"
                      />
                    ) : (
                      <BrandLogo className="store-brand-logo" />
                    )}
                  </div>
                  <div className="admin-brand-mock-links" aria-hidden="true">
                    <span>Shop</span>
                    <span>New in</span>
                    <span>About</span>
                  </div>
                  <div className="admin-brand-mock-icons" aria-hidden="true">
                    <span />
                    <span />
                  </div>
                </div>
                <div className="admin-brand-mock-strip" aria-hidden="true">
                  <span>Free shipping over threshold</span>
                </div>
              </div>
            ) : (
              <div className="admin-brand-mock-footer">
                <div className="admin-brand-mock-footer-brand">
                  {logoUrl ? (
                    <img
                      key={logoUrl}
                      src={logoUrl}
                      alt=""
                      className="brand-logo-img footer-brand-logo"
                    />
                  ) : (
                    <BrandLogo className="footer-brand-logo" />
                  )}
                </div>
                <div className="admin-brand-mock-footer-grid" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {busy && (
              <div className="admin-brand-mock-busy font-ui" role="status">
                <span className="admin-brand-mock-spinner" aria-hidden="true" />
                Updating…
              </div>
            )}
          </div>
        </div>

        <div className="admin-brand-upload-col">
          {hasCustomLogo && (
            <div className="admin-brand-current">
              <div className="admin-brand-current-thumb">
                <img key={logoUrl} src={logoUrl!} alt="" />
              </div>
              <div className="admin-brand-current-copy font-ui">
                <strong className="font-display">Current file</strong>
                <span>Served from your uploads folder</span>
              </div>
              <button
                type="button"
                className="admin-brand-replace-btn font-ui"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
            </div>
          )}

          <div
            className={`admin-brand-dropzone${dragOver ? " is-dragover" : ""}${busy ? " is-busy" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="admin-brand-file-input"
              onChange={onPick}
              disabled={busy}
              aria-label={`Upload logo for ${name}`}
            />
            <span className="admin-brand-dropzone-icon" aria-hidden="true">
              <IconUpload size={20} />
            </span>
            <div className="admin-brand-dropzone-copy">
              <p className="admin-brand-dropzone-line font-ui">
                <span className="admin-brand-dropzone-title font-display">
                  {hasCustomLogo ? "Drop a new file" : "Upload your logo"}
                </span>
                <span className="admin-brand-dropzone-sep" aria-hidden="true">·</span>
                <span className="admin-brand-dropzone-hint">Drop here or browse</span>
              </p>
              <ul className="admin-brand-formats font-ui" aria-label="Accepted formats">
                <li>PNG</li>
                <li>SVG</li>
                <li>WebP</li>
                <li>JPEG</li>
                <li className="admin-brand-formats-max">≤ 2 MB</li>
              </ul>
            </div>
            <button
              type="button"
              className="admin-brand-upload-btn font-ui"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? "Uploading…" : hasCustomLogo ? "Choose new" : "Choose file"}
            </button>
          </div>

          {error && (
            <p className="admin-brand-error font-ui" role="alert">
              {error}
            </p>
          )}

          <div className="admin-brand-foot">
            {hasCustomLogo ? (
              <button
                type="button"
                className="admin-brand-remove-btn font-ui"
                disabled={busy}
                onClick={removeLogo}
              >
                Remove logo · use wordmark
              </button>
            ) : (
              <p className="admin-brand-foot-note font-ui">
                No file uploaded — customers see the <strong>{name}</strong> wordmark.
              </p>
            )}
            {hasCustomLogo && (
              <span className="admin-brand-saved font-ui">
                <IconCheck size={14} aria-hidden="true" />
                Live on storefront
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
