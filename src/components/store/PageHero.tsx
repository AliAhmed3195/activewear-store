import Link from "next/link";
import type { ReactNode } from "react";

export type PageHeroBreadcrumb = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string | null;
  breadcrumbs?: PageHeroBreadcrumb[];
  children?: ReactNode;
  className?: string;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={["page-hero", className].filter(Boolean).join(" ")} aria-labelledby="page-hero-title">
      <div className="page-hero-glow" aria-hidden="true" />
      <div className="page-hero-panel">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-hero-breadcrumb font-ui" aria-label="Breadcrumb">
            <ol>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={`${item.label}-${index}`}>
                    {item.href && !isLast ? (
                      <Link href={item.href}>{item.label}</Link>
                    ) : (
                      <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <p className="section-eyebrow page-hero-eyebrow">{eyebrow}</p>
        <h1 id="page-hero-title" className="section-title page-hero-title mt-2">{title}</h1>
        <div className="section-divider page-hero-rule" aria-hidden="true" />

        {description ? (
          <p className="section-desc page-hero-desc max-w-2xl mx-auto">{description}</p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
