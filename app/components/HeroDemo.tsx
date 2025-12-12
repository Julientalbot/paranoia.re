"use client";

import { useEffect, useMemo, useState } from "react";

type HeroDemoProps = {
  before: string;
  after: string;
};

export default function HeroDemo({ before, after }: HeroDemoProps) {
  const [showSanitized, setShowSanitized] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const TOGGLE_MS = 4000;
    const interval = setInterval(() => setShowSanitized((prev) => !prev), TOGGLE_MS);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="hero-card">
      <div className="badge">Avant / après</div>
      <div className="card accent">
        <div className="tag">{showSanitized ? "Version envoyée à ChatGPT" : "Version brute"}</div>
        <div className="demo-text" aria-live="polite">
          <p className={`demo-copy ${showSanitized ? "visible" : "hidden"}`}>{after}</p>
          <p className={`demo-copy ${showSanitized ? "hidden" : "visible"}`}>{before}</p>
        </div>
        <div className="chips" aria-hidden="true">
          <span className="chip">{showSanitized ? "[Prénom]" : "Jean"}</span>
          <span className="chip">{showSanitized ? "[Nom]" : "Dupont"}</span>
          <span className="chip">{showSanitized ? "[Email]" : "jean.dupont@acme.com"}</span>
          <span className="chip">{showSanitized ? "[SIRET]" : "123 456 789 00012"}</span>
        </div>
      </div>
      <div className="demo-controls">
        <button className="btn secondary" type="button" onClick={() => setShowSanitized((prev) => !prev)}>
          {showSanitized ? "Voir la version brute" : "Voir la version envoyée"}
        </button>
        <div className="demo-progress" aria-label="Progression avant bascule">
          <div className="demo-progress__bar" key={String(showSanitized)} />
        </div>
        <span className="muted mini">Seule la version masquée est envoyée à ChatGPT.</span>
      </div>
      <div className="list" style={{ marginTop: 12 }}>
        <div className="pill">Détection PII</div>
        <div className="pill">Anonymisation ciblée</div>
        <div className="pill">Cohérence sémantique préservée</div>
      </div>
    </div>
  );
}

