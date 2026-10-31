/** SYORA — square checkbox row (optionally with a colour swatch) used by the collection filters. */
export default function Check({ label, checked, onChange, swatch }) {
  return (
    <label className="fd-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="fd-check__box" aria-hidden="true" />
      {swatch && <span className="fd-check__swatch" style={{ background: swatch }} aria-hidden="true" />}
      <span className="fd-check__label">{label}</span>
    </label>
  );
}
