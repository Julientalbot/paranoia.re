(() => {
  try {
    const theme = window.localStorage.getItem('ecosystem-theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  } catch (_) {
    /* Ignore storage restrictions. */
  }
})();