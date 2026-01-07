"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

type HeroDemoProps = {
  before: string;
  after: string;
};

// Characters used for matrix effect
const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテト0123456789@#$%&*";

export default function HeroDemo({ before, after }: HeroDemoProps) {
  const [showSanitized, setShowSanitized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayText, setDisplayText] = useState(before);
  const [scrambleIndices, setScrambleIndices] = useState<Set<number>>(new Set());

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  // Find indices where text differs (sensitive data locations)
  const sensitiveIndices = useMemo(() => {
    const indices = new Set<number>();
    const targetText = after;
    let beforeIdx = 0;
    let afterIdx = 0;

    while (afterIdx < targetText.length) {
      if (targetText[afterIdx] === '[') {
        // Found a masked segment
        const endBracket = targetText.indexOf(']', afterIdx);
        if (endBracket !== -1) {
          // Mark all indices in the original that correspond to this masked segment
          const maskedLength = endBracket - afterIdx + 1;
          // Find the original text length by looking for the next matching position
          let origLength = 0;
          const nextAfterChar = targetText[endBracket + 1];
          if (nextAfterChar) {
            const searchStart = beforeIdx;
            const nextPos = before.indexOf(nextAfterChar, searchStart);
            if (nextPos !== -1) {
              origLength = nextPos - beforeIdx;
            }
          } else {
            origLength = before.length - beforeIdx;
          }

          for (let i = 0; i < Math.max(origLength, maskedLength); i++) {
            indices.add(beforeIdx + i);
          }
          beforeIdx += origLength;
          afterIdx = endBracket + 1;
        } else {
          afterIdx++;
          beforeIdx++;
        }
      } else {
        afterIdx++;
        beforeIdx++;
      }
    }
    return indices;
  }, [before, after]);

  const detectedItems = [
    { label: "Prénom", original: "Jean", masked: "[Prénom]", type: "name" },
    { label: "Nom", original: "Dupont", masked: "[Nom]", type: "name" },
    { label: "Email", original: "jean.dupont@acme.com", masked: "[Email]", type: "email" },
    { label: "SIRET", original: "123 456 789 00012", masked: "[SIRET]", type: "id" }
  ];

  // Matrix scramble effect for transitioning text
  const scrambleText = useCallback((
    fromText: string,
    toText: string,
    onComplete: () => void
  ) => {
    if (prefersReducedMotion) {
      setDisplayText(toText);
      onComplete();
      return;
    }

    const duration = 800;
    const steps = 15;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Create scrambled text
      let result = "";
      const targetLength = Math.round(fromText.length + (toText.length - fromText.length) * progress);

      for (let i = 0; i < targetLength; i++) {
        const fromChar = fromText[i] || "";
        const toChar = toText[Math.min(i, toText.length - 1)] || "";

        // Determine if this position should be scrambled
        const isChangingPosition = fromChar !== toChar || i >= fromText.length;
        const shouldScramble = isChangingPosition && progress < 0.8 && Math.random() > progress;

        if (shouldScramble) {
          result += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          setScrambleIndices(prev => new Set([...prev, i]));
        } else {
          result += progress > 0.5 ? toChar : fromChar;
          setScrambleIndices(prev => {
            const next = new Set(prev);
            next.delete(i);
            return next;
          });
        }
      }

      setDisplayText(result);

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayText(toText);
        setScrambleIndices(new Set());
        onComplete();
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Handle toggle with transition effect
  const handleToggle = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    const fromText = showSanitized ? after : before;
    const toText = showSanitized ? before : after;

    scrambleText(fromText, toText, () => {
      setShowSanitized(prev => !prev);
      setIsTransitioning(false);
    });
  }, [showSanitized, isTransitioning, before, after, scrambleText]);

  // Auto-toggle interval
  useEffect(() => {
    if (prefersReducedMotion) return;
    const TOGGLE_MS = 5000;
    const interval = setInterval(handleToggle, TOGGLE_MS);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, handleToggle]);

  // Render text with highlighting for sensitive portions
  const renderText = () => {
    return displayText.split("").map((char, idx) => {
      const isScrambling = scrambleIndices.has(idx);
      const isBracket = char === "[" || char === "]";
      const isInsideBracket = showSanitized && /\[.*\]/.test(displayText.substring(0, idx + 1)) && !/\]/.test(displayText.substring(displayText.lastIndexOf("[", idx), idx));

      let className = "char";
      if (isScrambling) className += " scrambling";
      if (isBracket || (showSanitized && displayText[idx] === "[")) className += " bracket";

      return (
        <span key={idx} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className={`hero-card ${isTransitioning ? "scanning" : ""}`}>
      {/* Scanning beam effect */}
      <div className="scan-line" aria-hidden="true" />

      {/* Status indicator */}
      <div className="status-row">
        <div className={`status-indicator ${showSanitized ? "protected" : "exposed"}`}>
          <span className="status-dot" />
          <span className="status-text">{showSanitized ? "PROTÉGÉ" : "EXPOSÉ"}</span>
        </div>
        <div className="terminal-label">
          <span className="terminal-path">~/paranoia</span>
          <span className="terminal-cursor">▊</span>
        </div>
      </div>

      {/* Main demo card */}
      <div className={`card accent ${isTransitioning ? "processing" : ""}`}>
        <div className="tag-row">
          <span className="tag">{showSanitized ? "→ Envoyé à ChatGPT" : "Prompt brut"}</span>
          {isTransitioning && <span className="processing-badge">Analyse en cours...</span>}
        </div>

        <div className="demo-text" aria-live="polite">
          <pre className="demo-code">{renderText()}</pre>
        </div>

        {/* PII chips */}
        <div className="chips" aria-hidden="true">
          {detectedItems.map((item, index) => (
            <span
              key={item.label}
              className={`chip ${showSanitized ? "masked" : "exposed"} ${isTransitioning ? "pulsing" : ""}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="chip-icon">
                {item.type === "email" ? "✉" : item.type === "id" ? "#" : "👤"}
              </span>
              <span className="chip-value">{showSanitized ? item.masked : item.original}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="demo-controls">
        <button
          className={`btn secondary ${isTransitioning ? "disabled" : ""}`}
          type="button"
          onClick={handleToggle}
          disabled={isTransitioning}
        >
          <span className="btn-icon">{showSanitized ? "👁" : "🛡"}</span>
          {showSanitized ? "Voir l'original" : "Voir la version protégée"}
        </button>

        <div className="demo-progress" aria-label="Progression avant bascule">
          <div className="demo-progress__bar" key={String(showSanitized)} />
        </div>

        <span className="muted mini">
          <span className="shield-icon">🔒</span>
          Seule la version masquée est envoyée au LLM.
        </span>
      </div>

      {/* Metrics */}
      <div className="demo-metrics">
        <div className="metric">
          <div className="metric-value">
            <span className="metric-number">98</span>
            <span className="metric-unit">%</span>
          </div>
          <div className="metric-label">Sens préservé</div>
        </div>
        <div className="metric">
          <div className="metric-value">
            <span className="metric-number">4</span>
          </div>
          <div className="metric-label">PII détectées</div>
        </div>
        <div className="metric">
          <div className="metric-value">
            <span className="metric-prefix">&lt;</span>
            <span className="metric-number">50</span>
            <span className="metric-unit">ms</span>
          </div>
          <div className="metric-label">Latence</div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="list">
        <div className="pill">
          <span className="pill-dot" />
          Détection PII
        </div>
        <div className="pill">
          <span className="pill-dot" />
          Anonymisation
        </div>
        <div className="pill">
          <span className="pill-dot" />
          Cohérence sémantique
        </div>
      </div>
    </div>
  );
}
