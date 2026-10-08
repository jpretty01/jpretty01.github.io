(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeLabel = document.querySelector('.theme-label');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('primary-nav');
  const narrowScreen = window.matchMedia('(max-width: 760px)');

  /** @param {'dark' | 'light'} theme */
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const next = theme === 'dark' ? 'light' : 'dark';
    themeButton?.setAttribute('aria-label', `Switch to ${next} appearance`);
    if (themeLabel) themeLabel.textContent = next === 'light' ? 'Light' : 'Dark';
    themeColor?.setAttribute('content', theme === 'dark' ? '#0b1320' : '#e5ebf2');
  }
  try {
    const saved = localStorage.getItem('jp-appearance');
    applyTheme(saved === 'light' ? 'light' : 'dark');
  } catch {
    applyTheme('dark');
  }
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
      try { localStorage.setItem('jp-appearance', theme); } catch { /* Appearance works when browser storage is unavailable. */ }
    });
  }
  if (!menuButton || !menu) return;
  root.classList.add('navigation-ready');
  menuButton.hidden = false;

  /** @param {boolean} open */
  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
    menu.hidden = narrowScreen.matches && !open;
  }
  setMenu(false);
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a') && narrowScreen.matches) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (event.target instanceof Node && !menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  narrowScreen.addEventListener('change', () => setMenu(false));
})();
