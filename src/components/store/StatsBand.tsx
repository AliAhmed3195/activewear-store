const STATS = [
  { value: "8", label: "New Arrivals" },
  { value: "6", label: "Collections" },
  { value: "150+", label: "Cities We Reach" },
  { value: "100%", label: "Discreet Packaging" },
];

export default function StatsBand() {
  return (
    <section className="stats-band">
      <div className="stats-grid">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
