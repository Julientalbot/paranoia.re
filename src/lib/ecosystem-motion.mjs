/**
 * Pure motion/state helpers — testable without DOM.
 * Imported by living-artefacts <script> ilots and ecosystem-runtime.mjs.
 */

/** Parse "400M+", "200,000", "7" into count-up parts; null if not numeric. */
export function parseStatValue(raw) {
  const m = String(raw).match(/^(\D*)([\d.,]+)(\D*)$/);
  if (!m) return null;
  return {
    prefix: m[1],
    num: parseFloat(m[2].replace(/,/g, '')),
    suffix: m[3],
    raw: String(raw),
  };
}

/** x.ai count-up only runs on bare numbers (no leading text like "Depuis 2020"). */
export function isCountUpEligible(parsed) {
  return Boolean(parsed && !parsed.prefix.trim());
}

/** Ease-out cubic count-up frame at t ∈ [0, 1]. */
export function interpolateCountUp(parsed, t) {
  const clamped = Math.min(1, Math.max(0, t));
  const isInt = Number.isInteger(parsed.num);
  const cur = parsed.num * (1 - Math.pow(1 - clamped, 3));
  const body = isInt ? Math.round(cur).toString() : cur.toFixed(1);
  return parsed.prefix + body + parsed.suffix;
}

/** HeroHeadline rotate cycle — advance index modulo length. */
export function nextRotateIndex(current, length) {
  if (!Number.isFinite(current) || !Number.isFinite(length) || length < 2) return 0;
  return (current + 1) % length;
}

/** CodeArtifact tab panel state for a given active id. */
export function codeTabState(tabIds, activeId) {
  return tabIds.map((id) => ({
    id,
    isActive: id === activeId,
    tabindex: id === activeId ? '0' : '-1',
    hidden: id !== activeId,
  }));
}

/** Apply codeTabState to a [data-code-artifact] root element. */
export function applyCodeTabState(artifact, activeId) {
  if (!artifact) return;
  const tabs = [...artifact.querySelectorAll('[data-code-tab]')];
  const tabIds = tabs.map((t) => t.dataset.codeTab).filter(Boolean);
  const state = codeTabState(tabIds, activeId);
  for (const s of state) {
    const tab = artifact.querySelector(`[data-code-tab="${s.id}"]`);
    const panel = artifact.querySelector(`[data-code-panel="${s.id}"]`);
    if (tab) {
      tab.classList.toggle('is-active', s.isActive);
      tab.setAttribute('aria-selected', String(s.isActive));
      tab.setAttribute('tabindex', s.tabindex);
    }
    if (panel) panel.hidden = s.hidden;
  }
}

/** Normalize clipboard payload from a code panel text node. */
export function normalizeCopyText(text) {
  return String(text ?? '').trim();
}

/** CodeArtifact glow class map (stacked + xai layout). */
export function codeArtifactGlowClass(glow) {
  if (glow === 'blue') return 'xo-code-artifact--glow-blue';
  if (glow === 'orange') return 'xo-code-artifact--glow-orange';
  if (glow) return 'xo-code-artifact--glow';
  return '';
}

/** AgentTraceDemo — delay before next step (ms). */
export function traceStepDelay(step) {
  if (!step || typeof step !== 'object') return 500;
  if (step.kind === 'task') return 650;
  if (step.prompt === '◆' || step.prompt === '✓') return 800;
  return 500;
}

/** AgentTraceDemo — what to do when stepIndex reaches steps.length. */
export function traceEndAction(stepIndex, stepsLength, loopEnabled) {
  if (stepIndex < stepsLength) return { type: 'continue' };
  if (!loopEnabled) return { type: 'hold' };
  return { type: 'loop', holdMs: 3000, restartDelayMs: 300 };
}

/** AgentTraceDemo — progress label after revealing a step. */
export function traceProgressLabel(step) {
  if (step?.progress === undefined) return null;
  return `${step.progress}%`;
}

/** ChatBubbleDemo reveal timings (ms) — must match CSS fade duration. */
export const CHAT_DEMO_TIMING = {
  STEP: 850,
  HOLD: 2600,
  FADE: 400,
  PAUSE: 500,
};

/** WaveformDemo bar profile at index i (deterministic, build-stable). */
export function waveformBarAt(i, bars) {
  const wave = 0.4 + 0.6 * Math.abs(Math.sin((i / bars) * Math.PI * 3.2));
  const hue = Math.round(218 + (i / bars) * 118);
  const dur = (0.7 + ((i * 37) % 13) / 18).toFixed(2);
  const delay = (((i * 53) % 100) / 100).toFixed(2);
  return { h: Math.round(wave * 100), hue, dur, delay };
}

/** HeroHeadline — apply rotate tick to word elements. */
export function applyHlRotateTick(words, currentIndex) {
  if (!words?.length || words.length < 2) return 0;
  words[currentIndex]?.classList.remove('is-active');
  const next = nextRotateIndex(currentIndex, words.length);
  words[next]?.classList.add('is-active');
  return next;
}