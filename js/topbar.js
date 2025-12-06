(function() {
  const root = document.getElementById('ecoball-topbar-x7f3');
  const toggle = document.getElementById('ecoball-topbar-x7f3-toggle');
  const overlay = document.getElementById('ecoball-topbar-x7f3-mobile-menu');
  let lastScroll = 0;

  // 1. Scroll Handling
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    // Glass effect
    if (currentScroll > 20) root.classList.add('scrolled');
    else root.classList.remove('scrolled');

    // Hide/Show on scroll
    if (currentScroll > lastScroll && currentScroll > 100 && !root.classList.contains('menu-open')) {
      root.classList.add('hidden');
    } else {
      root.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // 2. Menu Toggle
  toggle.addEventListener('click', () => {
    const isOpen = root.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', isOpen);
    overlay.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // 3. Close on Link Click
  const mobileLinks = document.querySelectorAll('.ecoball-topbar-x7f3-mobile-link, .ecoball-topbar-x7f3-mobile-cta');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      root.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
})();
