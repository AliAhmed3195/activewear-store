const PILLARS = [
  {
    num: "01",
    title: "Curated Silhouettes",
    desc: "Babydolls, bridal sets, soft foundations, and twin robes — chosen for how they feel after midnight.",
  },
  {
    num: "02",
    title: "Worldwide Care",
    desc: "International shipping, private support, and packaging that never announces what is inside.",
  },
  {
    num: "03",
    title: "Maison Restraint",
    desc: "A focused edit — not thousands of SKUs. Every piece earns its place in the Elvene wardrobe.",
  },
];

export default function MaisonPillars() {
  return (
    <section className="pillars-section">
      <div className="pillars-inner">
        <div className="pillars-head">
          <p className="section-eyebrow">The Maison Code</p>
          <h2 className="section-title">Three Pillars of Elvene</h2>
          <div className="section-divider" />
        </div>
        <div className="pillars-grid">
          {PILLARS.map((p) => (
            <div key={p.num} className="pillar-card">
              <span className="pillar-num">{p.num}</span>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
              <span className="pillar-line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
