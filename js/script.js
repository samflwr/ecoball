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
class ScrollIndicator { //OLD ONE?? MAYBE
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
document.addEventListener('DOMContentLoaded', () => {
  const topBar = document.querySelector('.top-bar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const progressBar = document.querySelector('.scroll-progress-bar');
  let lastScroll = 0;

  // 1. Scroll Handling
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    // Progress Bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if(progressBar) progressBar.style.width = scrolled + "%";

    // Glass Effect Trigger
    if (currentScroll > 50) {
      topBar.classList.add('scrolled');
    } else {
      topBar.classList.remove('scrolled');
    }

    // Hide/Show on Scroll (Smart Nav)
    if (currentScroll > lastScroll && currentScroll > 200 && !mobileMenu.classList.contains('open')) {
      topBar.classList.add('hidden');
    } else {
      topBar.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  });

  // 2. Mobile Menu Toggle
  if(menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
      
      // Animate Hamburger
      const spans = menuToggle.querySelectorAll('span');
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.transform = 'none';
      }
    });
  }
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












// Contact Form Interactions
document.addEventListener('DOMContentLoaded', function() {
  // Toggle between whole team and specific member
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const contactOptions = document.querySelectorAll('.contact-option');
  
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.dataset.target;
      
      // Update active toggle button
      toggleBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding contact option
      contactOptions.forEach(option => {
        option.classList.remove('active');
        if (option.id === target) {
          option.classList.add('active');
        }
      });
      
      // Update recipient display
      if (target === 'whole-team') {
        updateRecipientDisplay('team@ecoball.it', 'Team');
      }
    });
  });
  
  // Member selection
  const memberCards = document.querySelectorAll('.member-contact-card');
  memberCards.forEach(card => {
    card.addEventListener('click', function() {
      const email = this.dataset.email;
      const name = this.querySelector('h5').textContent;
      
      // Update selected state
      memberCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      
      // Update recipient display
      updateRecipientDisplay(email, name);
    });
  });
  
  function updateRecipientDisplay(email, name) {
    const display = document.getElementById('recipient-display');
    const type = document.querySelector('.recipient-type');
    
    display.textContent = email;
    type.textContent = name === 'Team' ? 'Team' : 'Individual';
  }
  
  // Form submission
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm.querySelector('.submit-btn');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show loading state
    submitBtn.classList.add('loading');
    
    // Simulate form submission
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success');
      
      // Reset form after success
      setTimeout(() => {
        contactForm.reset();
        submitBtn.classList.remove('success');
        
        // Show success message (you can replace this with a proper notification)
        alert('Message sent successfully! We\'ll get back to you soon.');
      }, 2000);
    }, 2000);
  });
});






















// Hardware Components Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  
  // Data for the Detail Panel
  const hardwareData = {
    sensors: {
      title: "Multiparametric Array",
      desc: "Industrial-grade sensor suite housed in a custom anti-fouling HDPE enclosure. Capable of real-time detection of chemical anomalies.",
      specs: [
        { label: "Accuracy", val: "±0.01 pH" },
        { label: "Range", val: "Full Spectrum" },
        { label: "Rating", val: "IP68 / 10ATM" }
      ],
      id: "ID: SENS-MOD-V4 // ONLINE"
    },
    core: {
      title: "Core Intelligence",
      desc: "Powered by STM32 Nucleo architecture. Handles data aggregation, encryption, and autonomous pathfinding decisions on the edge.",
      specs: [
        { label: "MCU", val: "STM32 Nucleo" },
        { label: "Clock", val: "480 MHz" },
        { label: "Storage", val: "4GB Flash" }
      ],
      id: "ID: CPU-CORE-X1 // ACTIVE"
    },
    power: {
      title: "Power & Comms",
      desc: "Self-sustaining energy system with high-efficiency solar tracking and multi-band NB-IoT connectivity for global reach.",
      specs: [
        { label: "Solar", val: "10W Monocrystal" },
        { label: "Battery", val: "20Wh Li-ion" },
        { label: "Network", val: "NB-IoT / LTE-M" }
      ],
      id: "ID: PWR-GRID-S2 // CHARGING"
    }
  };

  const tabs = document.querySelectorAll('.hw-tab');
  const layers = document.querySelectorAll('.layer');
  const contentArea = document.getElementById('hw-content-area');
  
  // Function to render content with a "typing" effect simulation
  function updatePanel(key) {
    const data = hardwareData[key];
    const html = `
      <h3 class="panel-title fade-in">${data.title}</h3>
      <p class="panel-desc fade-in">${data.desc}</p>
      <div class="panel-specs">
        ${data.specs.map(s => `
          <div class="spec-row fade-in">
            <span>${s.label}</span>
            <span class="mono">${s.val}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    // Update footer ID
    const footerId = document.querySelector('.panel-footer .mono-xs');
    if(footerId) footerId.textContent = data.id;

    contentArea.innerHTML = html;
  }

  // Event Listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Remove Active from all tabs & layers
      tabs.forEach(t => t.classList.remove('active'));
      layers.forEach(l => l.classList.remove('active'));

      // 2. Add Active to clicked
      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      
      // 3. Highlight specific layer (visualizer)
      const targetLayer = document.querySelector(`.layer[data-layer="${target}"]`);
      if(targetLayer) targetLayer.classList.add('active');

      // 4. Update Data
      updatePanel(target);
    });
  });

  // Init
  updatePanel('sensors');
});













// Workflow Section JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.wf-step');
  const nextBtn = document.getElementById('wf-next');
  const prevBtn = document.getElementById('wf-prev');
  const progFill = document.querySelector('.prog-fill');
  const progLabel = document.querySelector('.prog-label');
  
  let currentStep = 0; // 0-index based
  const totalSteps = steps.length;

  function updateWorkflow() {
    // 1. Update Steps Visuals
    steps.forEach((step, index) => {
      if (index === currentStep) {
        step.classList.add('active');
        // Scroll into view if needed (optional)
        // step.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        step.classList.remove('active');
      }
    });

    // 2. Update Progress Bar
    const percent = ((currentStep + 1) / totalSteps) * 100;
    progFill.style.width = `${percent}%`;
    progLabel.textContent = `Step ${currentStep + 1}/${totalSteps}`;

    // 3. Update Buttons
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === totalSteps - 1;
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      updateWorkflow();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateWorkflow();
    }
  });

  // Optional: Click on step directly
  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      currentStep = index;
      updateWorkflow();
    });
  });

  // Initialize
  updateWorkflow();
});





































































































































// Premium Project-Timeline JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.timeline-container');
  const spine = document.querySelector('.spine-progress');
  const nodes = document.querySelectorAll('.tl-node');

  if(container && spine) {
    window.addEventListener('scroll', () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress (0 to 1) based on scroll position
      let progress = (windowHeight / 2 - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      
      spine.style.height = `${progress * 100}%`;

      // Activate nodes as line passes them
      nodes.forEach(node => {
        const nodeTop = node.getBoundingClientRect().top;
        if(nodeTop < windowHeight * 0.7) {
          node.classList.add('active-node');
        } else {
          node.classList.remove('active-node');
        }
      });
    });
  }
});





































//SCROLL INDICATOR SCROLL LINE 
const scrollTrigger = document.querySelector('.scroll-trigger');

if(scrollTrigger) {
  document.addEventListener('mousemove', (e) => {
    const rect = scrollTrigger.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if mouse is close (within 100px)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(x - centerX, y - centerY);
    
    if (dist < 150) {
      const pullX = (x - centerX) * 0.2; // 20% strength
      const pullY = (y - centerY) * 0.2;
      scrollTrigger.style.transform = `translate(${pullX}px, ${pullY}px)`;
    } else {
      scrollTrigger.style.transform = `translate(0, 0)`;
    }
  });
  
  // Scroll on click
  scrollTrigger.addEventListener('click', () => {
    const nextSection = document.getElementById('mission'); // or whatever your next ID is
    if(nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
  });
}