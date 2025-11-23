// Progressive enhancement flag
document.documentElement.classList.remove('no-js');

// Year
const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();

/* Cursor glow layer (soft, premium, non-distracting)
   Stable: uses transform-safe updates via CSS custom props. */
(function cursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mx = 0.5, my = 0.5;
  let tx = mx, ty = my;
  let rafId;

  function onMove(e) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    tx = x; ty = y;
    if (!rafId) rafId = requestAnimationFrame(update);
  }

  function update() {
    rafId = null;
    mx += (tx - mx) * 0.12;
    my += (ty - my) * 0.12;
    glow.style.setProperty('--mx', `${(mx * 100).toFixed(3)}%`);
    glow.style.setProperty('--my', `${(my * 100).toFixed(3)}%`);
    if (Math.abs(mx - tx) > 0.001 || Math.abs(my - ty) > 0.001) {
      rafId = requestAnimationFrame(update);
    }
  }

  window.addEventListener('mousemove', onMove, { passive: true });

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    glow.style.display = 'none';
    window.removeEventListener('mousemove', onMove);
  }
})();



/* Intersection-based reveal animations (staggered, premium cadence) */
(function reveals() {
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const parent = e.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [e.target];
        siblings.forEach((el, i) => {
          if (!el.classList.contains('show')) {
            el.style.transitionDelay = `${i * 40}ms`;
          }
        });
        e.target.classList.add('show');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  revealEls.forEach(el => io.observe(el));
})();

/* Magnetic hover micro-interaction with proximity light (stable, no flicker)
   Only transforms are animated; no box-shadow animation to avoid jank. */
(function magnetic() {
  const magnets = document.querySelectorAll('.magnetic');
  const strength = 10;
  function lerp(a, b, n) { return (1 - n) * a + n * b; }
  magnets.forEach(el => {
    let x = 0, y = 0, tx = 0, ty = 0, raf;
    const rect = () => el.getBoundingClientRect();
    const onMove = (e) => {
      const r = rect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      tx = (mx / (r.width / 2)) * strength;
      ty = (my / (r.height / 2)) * strength;
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(update); };
    function update() {
      raf = null;
      x = lerp(x, tx, 0.18);
      y = lerp(y, ty, 0.18);
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      if (Math.abs(x - tx) > 0.1 || Math.abs(y - ty) > 0.1) raf = requestAnimationFrame(update);
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    magnets.forEach(el => {
      el.style.transform = 'none';
      el.onmousemove = null;
      el.onmouseleave = null;
    });
  }
})();

/* Gentle smooth scrolling (inertial) for anchor links */
(function smoothAnchors() {
  function smoothScrollTo(targetY, duration = 700) {
    const startY = window.scrollY || window.pageYOffset;
    const diff = targetY - startY;
    let start;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const y = startY + diff * easeOutCubic(p);
      window.scrollTo(0, y);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.scrollY - 20;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          window.scrollTo(0, y);
        } else {
          smoothScrollTo(y, 750);
        }
        history.pushState(null, '', '#' + id);
      }
    });
  });
})();

/* Mobile tap feedback: micro-scale and light pulse (transform-only) */
(function tapFeedback() {
  const tappables = document.querySelectorAll('.btn, .chip, .tile, .card, .pillar, .step');
  tappables.forEach(el => {
    el.addEventListener('touchstart', (ev) => {
      const touch = ev.touches[0];
      if (el.matches('.btn[data-ripple="true"]')) {
        const rect = el.getBoundingClientRect();
        const rx = ((touch.clientX - rect.left) / rect.width) * 100;
        const ry = ((touch.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--rx', `${rx}%`);
        el.style.setProperty('--ry', `${ry}%`);
        el.style.setProperty('--ro', '0.35');
        clearTimeout(el._rt);
        el._rt = setTimeout(() => el.style.setProperty('--ro', '0'), 260);
      }
      el.style.transform = 'scale(0.985)';
      clearTimeout(el._tapT);
      el._tapT = setTimeout(() => {
        el.style.transform = '';
      }, 180);
    }, { passive: true });
  });
})();

/* Button ripple on mouse (desktop) */
(function buttonRippleDesktop() {
  document.querySelectorAll('.btn[data-ripple="true"]').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      const rect = btn.getBoundingClientRect();
      const rx = ((e.clientX - rect.left) / rect.width) * 100;
      const ry = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--rx', `${rx}%`);
      btn.style.setProperty('--ry', `${ry}%`);
      btn.style.setProperty('--ro', '0.35');
      clearTimeout(btn._rt);
      btn._rt = setTimeout(() => btn.style.setProperty('--ro', '0'), 280);
    });
  });
})();

/* Team members: add data-tag gracefully if missing (optional specialties) */
(function teamTags() {
  document.querySelectorAll('.team-group .member').forEach(m => {
    if (!m.getAttribute('data-tag')) {
      const role = m.querySelector('span:last-child')?.textContent?.trim() || 'Team';
      m.setAttribute('data-tag', role);
    }
  });
})();

/* Light parallax on hero orbital and sphere (transform only, throttled) */
(function parallax() {
  const orbital = document.querySelector('.orbital');
  const sphere = document.querySelector('.sphere');
  if (!orbital && !sphere) return;

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (orbital) orbital.style.transform = `translate3d(0, ${y * -0.03}px, 0)`;
      if (sphere) sphere.style.transform = `translate3d(0, ${Math.sin(y * 0.002) * -4}px, 0)`;
      ticking = false;
    });
    ticking = true;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
class ScrollIndicator {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupIntersectionObserver();
  }

  bindEvents() {
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleClick(e) {
    e.preventDefault();
    
    // Add click feedback
    this.element.classList.add('clicked');
    setTimeout(() => {
      this.element.classList.remove('clicked');
    }, 800);

    // Scroll to next section
    this.scrollToNextSection();
  }

  handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick(e);
    }
  }

  scrollToNextSection() {
    const nextSection = this.getNextSection();
    if (nextSection) {
      // Show progress animation
      this.element.classList.add('scrolling');
      
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });

      // Hide progress after scroll
      setTimeout(() => {
        this.element.classList.remove('scrolling');
      }, 1500);
    }
  }

  getNextSection() {
    const sections = document.querySelectorAll('section, .section');
    const currentScroll = window.scrollY + 100; // Offset
    
    for (let section of sections) {
      if (section.offsetTop > currentScroll) {
        return section;
      }
    }
    return null;
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.element.classList.add('visible');
          this.element.classList.remove('hidden');
        } else {
          this.element.classList.remove('visible');
          this.element.classList.add('hidden');
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.element);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    new ScrollIndicator(scrollIndicator);
  }
});

// Add this script for enhanced stat interactions
document.addEventListener('DOMContentLoaded', function() {
  const stats = document.querySelectorAll('.stat');
  
  // Mouse move glow effect
  stats.forEach(stat => {
    stat.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      this.style.setProperty('--mouse-x', `${x}%`);
      this.style.setProperty('--mouse-y', `${y}%`);
    });
  });
  
  // Optional: Animated counter
  const animatedStats = document.querySelectorAll('.stat .k[data-count]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            clearInterval(timer);
            current = target;
          }
          element.textContent = Math.floor(current) + '/7';
        }, 16);
        
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.5 });
  
  animatedStats.forEach(stat => observer.observe(stat));
});







// Topbar with mobile menu
class TopBar {
  constructor() {
    this.topBar = document.getElementById('topBar');
    this.menuToggle = document.getElementById('menuToggle');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.progress = this.topBar?.querySelector('.top-bar__progress');
    this.lastScrollY = window.scrollY;
    this.scrollDirection = 0;
    this.isMenuOpen = false;
    
    this.init();
  }

  init() {
    if (!this.topBar) return;

    // Event listeners
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.menuToggle?.addEventListener('click', this.toggleMenu.bind(this));
    
    // Close menu when clicking on links
    this.mobileMenu?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mobile-link') || e.target.classList.contains('mobile-cta')) {
        this.closeMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.topBar.contains(e.target)) {
        this.closeMenu();
      }
    });

    this.updateProgress();
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - this.lastScrollY;

    // Update scroll direction
    if (Math.abs(scrollDelta) > 5) {
      this.scrollDirection = scrollDelta > 0 ? 1 : -1;
    }

    // Show/hide topbar based on scroll direction (only if menu is closed)
    if (!this.isMenuOpen) {
      if (this.scrollDirection > 0 && currentScrollY > 100) {
        this.topBar.classList.add('hidden');
      } else {
        this.topBar.classList.remove('hidden');
      }
    }

    // Add scrolled class for background intensity
    if (currentScrollY > 50) {
      this.topBar.classList.add('scrolled');
    } else {
      this.topBar.classList.remove('scrolled');
    }

    this.lastScrollY = currentScrollY;
    this.updateProgress();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuToggle.classList.toggle('active', this.isMenuOpen);
    this.mobileMenu.classList.toggle('active', this.isMenuOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.menuToggle.classList.remove('active');
    this.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  updateProgress() {
    if (!this.progress) return;

    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
    
    this.progress.style.width = `${scrollPercent}%`;
  }
}

// Initialize topbar
document.addEventListener('DOMContentLoaded', () => {
  new TopBar();
});










// Enhanced spec animations
class SpecAnimations {
  constructor() {
    this.specs = document.querySelectorAll('.spec');
    this.init();
  }

  init() {
    // Add staggered animation
    this.specs.forEach((spec, index) => {
      spec.style.setProperty('--delay', `${index * 100}ms`);
      spec.style.animationDelay = `calc(var(--delay) + ${Math.random() * 200}ms)`;
    });

    // Add magnetic effect on hover
    this.specs.forEach(spec => {
      spec.addEventListener('mousemove', this.handleMouseMove.bind(this));
      spec.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    });
  }

  handleMouseMove(e) {
    const spec = e.currentTarget;
    const rect = spec.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const angleX = (y - centerY) / 10;
    const angleY = (centerX - x) / 10;
    
    spec.style.transform = `translateY(-4px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
  }

  handleMouseLeave(e) {
    const spec = e.currentTarget;
    spec.style.transform = 'translateY(-4px) rotateX(0deg) rotateY(0deg)';
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new SpecAnimations();
});











// Update copyright year
document.addEventListener('DOMContentLoaded', function() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

