const benefits = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    title: 'FAST DELIVERY',
    desc: 'Quick & safe delivery',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/>
      </svg>
    ),
    title: 'EASY RETURNS',
    desc: 'Within 15 days',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'QUALITY ASSURED',
    desc: 'Premium craftsmanship',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'SECURE PAYMENT',
    desc: '100% secure checkout',
  },
];

export default function TrustBar() {
  return (
    <section className="trust-bar">
      {benefits.map((b, i) => (
        <div key={b.title} className="trust-item">
          <div className="trust-icon">{b.icon}</div>
          <div className="trust-text">
            <strong>{b.title}</strong>
            <span>{b.desc}</span>
          </div>
          {i < benefits.length - 1 && <div className="trust-sep" />}
        </div>
      ))}
    </section>
  );
}
