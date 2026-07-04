/**
 * Site runtime — theme toggle, CodeArtifact tabs/copy.
 * Synced to julientalbot.com/public/js/ecosystem-runtime.mjs (type=module).
 */
import {
  applyCodeTabState,
  normalizeCopyText,
} from './ecosystem-motion.mjs';

const script = document.currentScript;
const cleanupKey = 'julientalbot-sw-cleanup-v1';

if (script?.dataset.swCleanup !== undefined) {
  try {
    if (window.localStorage.getItem(cleanupKey) !== 'done') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
      window.localStorage.setItem(cleanupKey, 'done');
    }
  } catch (_) {
    /* Ignore storage restrictions. */
  }
}

const isEnglish = () => (document.documentElement.lang || '').toLowerCase().startsWith('en');

const ecosystemRuntime = (() => {
  const themeKey = 'ecosystem-theme';
  const root = document.documentElement;

  const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const syncThemeButtons = () => {
    const theme = currentTheme();
    document.querySelectorAll('.xo-theme-toggle').forEach((button) => {
      button.dataset.themeState = theme;
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  };

  const setTheme = (theme, persist = true) => {
    const next = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = next;
    if (persist) {
      try {
        window.localStorage.setItem(themeKey, next);
      } catch (_) {
        /* Ignore storage restrictions. */
      }
    }
    syncThemeButtons();
  };

  const setCodePanel = (artifact, id) => {
    applyCodeTabState(artifact, id);
  };

  const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  };

  const copyArtifact = async (button) => {
    const artifact = button.closest('[data-code-artifact]');
    if (!artifact) return;
    const panel = artifact.querySelector('[data-code-panel]:not([hidden])');
    const text = normalizeCopyText(panel?.textContent);
    if (!text) return;

    await copyText(text);
    button.dataset.copyState = 'copied';
    const label = button.querySelector('.xo-copy-label');
    const en = isEnglish();
    const copyDefault = en ? 'Copy' : 'Copier';
    const copiedDefault = en ? 'Copied' : 'Copié';
    if (label) {
      button.dataset.copyLabel ||= label.textContent?.trim() || copyDefault;
      label.textContent = button.dataset.copyDone || copiedDefault;
    }
    window.setTimeout(() => {
      delete button.dataset.copyState;
      if (label) label.textContent = button.dataset.copyLabel || copyDefault;
    }, 1800);
  };

  document.querySelectorAll('[data-code-artifact]').forEach((artifact) => {
    const active = artifact.querySelector('[data-code-tab][aria-selected="true"]')
      || artifact.querySelector('[data-code-tab]');
    if (active instanceof HTMLElement && active.dataset.codeTab) {
      setCodePanel(artifact, active.dataset.codeTab);
    }
  });

  syncThemeButtons();

  document.querySelectorAll('.xo-theme-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  return { currentTheme, setTheme, setCodePanel, copyArtifact };
})();

window.ecosystemRuntime = ecosystemRuntime;

window.trackSiteEvent = (name, props = {}) => {
  if (!name) return;
  if (typeof window.va === 'function') window.va('event', name, props);
  if (typeof window.plausible === 'function') window.plausible(name, { props });
  if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, props);
};

document.addEventListener('click', (event) => {
  const codeTab = event.target instanceof Element ? event.target.closest('[data-code-tab]') : null;
  if (codeTab) {
    const artifact = codeTab.closest('[data-code-artifact]');
    if (artifact && codeTab.dataset.codeTab) ecosystemRuntime.setCodePanel(artifact, codeTab.dataset.codeTab);
    return;
  }

  const copyButton = event.target instanceof Element ? event.target.closest('[data-copy-current]') : null;
  if (copyButton) {
    ecosystemRuntime.copyArtifact(copyButton);
    return;
  }

  const target = event.target instanceof Element ? event.target.closest('[data-event]') : null;
  if (!target) return;
  window.trackSiteEvent(target.dataset.event, {
    href: target.getAttribute('href') || undefined,
    label: target.textContent?.trim() || undefined,
  });
});

document.addEventListener('keydown', (event) => {
  const codeTab = event.target instanceof Element ? event.target.closest('[data-code-tab]') : null;
  if (!codeTab) return;
  const artifact = codeTab.closest('[data-code-artifact]');
  if (!artifact) return;
  const tabs = Array.from(artifact.querySelectorAll('[data-code-tab]'));
  const index = tabs.indexOf(codeTab);
  if (index < 0) return;

  let next = null;
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
  if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  if (next === null) return;

  event.preventDefault();
  const nextTab = tabs[next];
  if (!(nextTab instanceof HTMLElement) || !nextTab.dataset.codeTab) return;
  nextTab.focus();
  ecosystemRuntime.setCodePanel(artifact, nextTab.dataset.codeTab);
});

window.addEventListener('site:event', (event) => {
  window.trackSiteEvent(event.detail?.name, event.detail?.props || {});
});
