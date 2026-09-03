/** Native img avoids next/image hydration alt mismatches with stale client bundles. */
export default function BrandLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-v2.png"
      alt="Elvene Noir"
      width={180}
      height={22}
      className={className}
      decoding="async"
      suppressHydrationWarning
    />
  );
}
