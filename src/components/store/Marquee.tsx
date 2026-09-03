const WORDS = [
  "Elvene Noir",
  "Ships Worldwide",
  "Discreet International Delivery",
  "Bridal Atelier",
  "Lace · Satin · Silk",
  "Private Packaging",
];

export default function Marquee() {
  const items = [...WORDS, ...WORDS];
  return (
    <div className="marquee marquee-fade" aria-hidden="true">
      <div className="marquee-track">
        {items.map((w, i) => (
          <span key={i} className="marquee-item">
            {w}
            <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
