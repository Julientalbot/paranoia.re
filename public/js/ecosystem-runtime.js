(() => {
  const isEnglish = () => (document.documentElement.lang || '').toLowerCase().startsWith('en');

  const ecosystemRuntime = (() => {
    const themeKey = 'ecosystem-theme';
    const root = document.documentElement;
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

    const storedTheme = () => {
      try {
        const value = window.localStorage.getItem(themeKey);
        return value === 'light' || value === 'dark' ? value : null;
      } catch (_) {
        return null;
      }
    };

    const currentTheme = () => root.dataset.theme || (lightQuery.matches ? 'light' : 'dark');

    const syncThemeButtons = () => {
      const theme = currentTheme();
      const en = isEnglish();
      document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.dataset.themeState = theme;
        button.setAttribute(
          'aria-label',
          theme === 'dark'
            ? en
              ? 'Switch to light mode'
              : 'Passer en mode clair'
            : en
              ? 'Switch to dark mode'
              : 'Passer en mode sombre',
        );
      });
    };

    const setTheme = (theme, persist = true) => {
      root.dataset.theme = theme;
      if (persist) {
        try {
          window.localStorage.setItem(themeKey, theme);
        } catch (_) {
          /* Ignore storage restrictions. */
        }
      }
      syncThemeButtons();
    };

    const setCodePanel = (artifact, id) => {
      artifact.querySelectorAll('[data-code-tab]').forEach((tab) => {
        const isActive = tab.dataset.codeTab === id;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      artifact.querySelectorAll('[data-code-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.codePanel !== id;
      });
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
      const text = panel?.textContent?.trim();
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

    const explicitTheme = storedTheme();
    if (explicitTheme) setTheme(explicitTheme, false);
    else syncThemeButtons();

    lightQuery.addEventListener?.('change', () => {
      if (!storedTheme()) syncThemeButtons();
    });

    return { currentTheme, setTheme, setCodePanel, copyArtifact };
  })();

  window.ecosystemRuntime = ecosystemRuntime;

  window.trackSiteEvent = (name, props = {}) => {
    if (!name) return;
    if (typeof window.va === 'function') window.va('event', name, props);
  };

  document.addEventListener('click', (event) => {
    const themeToggle = event.target instanceof Element ? event.target.closest('[data-theme-toggle]') : null;
    if (themeToggle) {
      const nextTheme = ecosystemRuntime.currentTheme() === 'dark' ? 'light' : 'dark';
      ecosystemRuntime.setTheme(nextTheme);
      return;
    }

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

  window.addEventListener('site:event', (event) => {
    window.trackSiteEvent(event.detail?.name, event.detail?.props || {});
  });
})();