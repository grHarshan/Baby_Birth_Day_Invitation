"use client";

import { useEffect, useState } from "react";

export default function GrowthRail() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="growth-rail" aria-hidden="true">
      <div className="growth-rail-track">
        <div className="growth-rail-fill" style={{ height: `${progress}%` }} />
        <div className="growth-rail-marker" style={{ top: `${progress}%` }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <circle cx="12" cy="12" r="10" fill="var(--paper)" stroke="var(--honey)" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" fill="var(--sage-deep)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
