import { useState } from 'react';

export default function Topbar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="topbar">
      <span className="topbar__left">FREE DELIVERY ON ORDERS ABOVE ₹999</span>
      <div className="topbar__right">
        <a href="#">DOWNLOAD APP</a>
        <span className="sep">|</span>
        <a href="#">TRACK ORDER</a>
        <span className="sep">|</span>
        <a href="#">HELP</a>
        <button className="topbar__close" onClick={() => setVisible(false)} aria-label="Close">✕</button>
      </div>
    </div>
  );
}
