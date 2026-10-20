'use strict';

// El visor estático comparte la navegación y el comportamiento visual del sitio.
(() => {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('site-menu-button');
  const mobile = document.getElementById('site-mobile-nav');
  if (!header || !toggle || !mobile) return;

  const setOpen = (open) => {
    mobile.hidden = !open;
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  const updateScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  toggle.addEventListener('click', () => setOpen(mobile.hidden));
  mobile.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobile.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && !mobile.hidden) setOpen(false);
  });
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
})();
