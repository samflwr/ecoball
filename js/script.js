// Progressive enhancement flag
document.documentElement.classList.remove('no-js');

// Year
const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();

/* Cursor glow layer (soft, premium, non-distracting)
   Stable: uses transform-safe updates via CSS custom props. */

// (function cursorGlow() {
//   const glow = document.createElement('div');
//   glow.className = 'cursor-glow';
//   document.body.appendChild(glow);

//   let mx = 0.5, my = 0.5;
//   let tx = mx, ty = my;
//   let rafId;

//   function onMove(e) {
//     const x = e.clientX / window.innerWidth;
//     const y = e.clientY / window.innerHeight;
//     tx = x; ty = y;
//     if (!rafId) rafId = requestAnimationFrame(update);
//   }

//   function update() {
//     rafId = null;
//     mx += (tx - mx) * 0.12;
//     my += (ty - my) * 0.12;
//     glow.style.setProperty('--mx', `${(mx * 100).toFixed(3)}%`);
//     glow.style.setProperty('--my', `${(my * 100).toFixed(3)}%`);
//     if (Math.abs(mx - tx) > 0.001 || Math.abs(my - ty) > 0.001) {
//       rafId = requestAnimationFrame(update);
//     }
//   }

//   window.addEventListener('mousemove', onMove, { passive: true });

//   // Respect reduced motion
//   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
//     glow.style.display = 'none';
//     window.removeEventListener('mousemove', onMove);
//   }
// })();



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


// ----------------------------------------------------
// Top Bar Interactions (Deep Hydro Premium)
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    
    const topBar = document.getElementById('topBar');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const progressBar = document.getElementById('progressBar');
    let lastScrollY = window.scrollY;

    // 1. Scroll Handler (Glass Effect + Progress + Smart Hide)
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add glass effect if scrolled
        if (currentScrollY > 20) {
            topBar.classList.add('scrolled');
        } else {
            topBar.classList.remove('scrolled');
        }

        // Smart Hide Logic (Optional - remove if you want fixed always)
        if (currentScrollY > lastScrollY && currentScrollY > 400) {
            // Scrolling Down
            topBar.classList.add('hidden');
        } else {
            // Scrolling Up
            topBar.classList.remove('hidden');
        }
        lastScrollY = currentScrollY;

        // Update Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(progressBar) progressBar.style.width = scrolled + "%";
    });

    // 2. Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        
        if (isOpen) {
            mobileMenu.classList.remove('open');
            menuToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
        } else {
            mobileMenu.classList.add('open');
            menuToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scroll
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.m-link, .m-cta').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
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
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const toggleContainer = document.querySelector('.recipient-toggle');
    const views = {
        team: document.getElementById('view-team'),
        individual: document.getElementById('view-individual')
    };
    const activeRecipientDisplay = document.getElementById('active-recipient');
    const memberCards = document.querySelectorAll('.member-card');
    const teamCard = document.querySelector('.team-card');
    let currentMode = 'team'; // 'team' or 'individual'

    // --- Toggle Logic ---
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            
            // Visual Updates
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Move the background pill
            if(target === 'individual') {
                toggleContainer.setAttribute('data-state', 'individual');
                toggleContainer.querySelector('.toggle-bg').style.transform = 'translateX(100%)';
            } else {
                toggleContainer.setAttribute('data-state', 'team');
                toggleContainer.querySelector('.toggle-bg').style.transform = 'translateX(0)';
            }

            // View Switching
            Object.values(views).forEach(v => v.classList.remove('active'));
            views[target].classList.add('active');
            currentMode = target;

            // Reset selection to default if switching back to team
            if (target === 'team') {
                updateRecipient('EcoBall Team', 'team@ecoball.it');
                // clear member selection
                memberCards.forEach(c => c.classList.remove('active'));
            }
        });
    });

    // --- Member Selection Logic ---
    memberCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all
            memberCards.forEach(c => c.classList.remove('active'));
            // Add to clicked
            card.classList.add('active');
            
            const name = card.dataset.name;
            const email = card.dataset.email;
            updateRecipient(name, email);
        });
    });

    // --- Helper: Update Recipient UI ---
    function updateRecipient(name, email) {
        // Update the visual badge in the form
        activeRecipientDisplay.textContent = name;
        activeRecipientDisplay.style.opacity = '0';
        setTimeout(() => {
            activeRecipientDisplay.style.opacity = '1';
        }, 150);

        // Optional: Update a hidden input field if you are actually sending data
        // document.getElementById('recipient_email').value = email;
    }

    // --- Form Submission Animation ---
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerHTML;
        
        // Loading State
        btn.innerHTML = `<span class="loader"></span> Sending...`;
        btn.style.opacity = '0.8';
        
        // Simulate API call
        setTimeout(() => {
            // Success State
            btn.innerHTML = `<span>Sent Successfully!</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
            btn.style.background = '#10b981'; // Green
            form.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.opacity = '1';
            }, 3000);
        }, 1500);
    });
});






















// Hardware Components Interactive Script
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.hw-a-section');
    const stack = document.getElementById('hw-a-stack');
    const items = document.querySelectorAll('.hw-a-item');
    const plates = document.querySelectorAll('.hw-a-plate');
    
    // Data for the specs footer
    const specsData = {
        comms: ['FR4-TG180', 'Tri-Band Array'],
        core: ['Silicon Wafer', 'NUCLEO-H743ZI'],
        sensors: ['Ceramic/HDPE', 'IP68/20ATM']
    };

    // 1. Tab Switching Logic
    items.forEach(item => {
        item.addEventListener('click', () => {
            if(item.classList.contains('active')) return;

            // Update UI active states
            items.forEach(i => i.classList.remove('active'));
            plates.forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            
            const target = item.dataset.target;
            const targetPlate = document.querySelector(`.hw-a-plate[data-layer="${target}"]`);
            if(targetPlate) targetPlate.classList.add('active');

            // Trigger the "Explosion" animation
            adjustStack(target);
            // Update footer data
            updateSpecs(target);
        });
    });

    // Function to control the vertical separation (Z-axis) of plates
    function adjustStack(activeTarget) {
        // Base positions for closed stack
        const baseZ = { sensors: 0, core: 50, comms: 100 };
        
        plates.forEach(plate => {
            const layer = plate.dataset.layer;
            let z = baseZ[layer];
            
            // Logic: If a layer is active, push the layers ABOVE it upwards significantly
            if (activeTarget === 'sensors') {
                 if (layer === 'core') z += 60; // Push core up
                 if (layer === 'comms') z += 120; // Push comms way up
            } else if (activeTarget === 'core') {
                 if (layer === 'comms') z += 80; // Push comms up
            }
            // If comms is active, everything stays near base Z (collapsed look)

            plate.style.transform = `translateZ(${z}px)`;
        });
    }

    // 2. Smooth Parallax Tilt (Mouse Tracking)
    let bounds;
    function rotateStack(e) {
        if(!bounds) bounds = section.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = { x: bounds.width / 2, y: bounds.height / 2 };
        const distance = { x: leftX - center.x, y: topY - center.y };
        
        // Calculate rotation angles (max +/- 10deg for subtle effect)
        // Base rotation is rotateX(55deg) rotateZ(-45deg)
        const xAngle = (distance.y / center.y) * -10; 
        const zAngle = (distance.x / center.x) * 10;

        stack.style.transform = `rotateX(${55 + xAngle}deg) rotateZ(${-45 + zAngle}deg)`;
    }

    section.addEventListener('mousemove', rotateStack);
    section.addEventListener('mouseleave', () => {
        // Reset to isometric view on leave
        stack.style.transform = `rotateX(55deg) rotateZ(-45deg)`;
    });
    window.addEventListener('resize', () => { bounds = null; }); // Reset bounds on resize

    // 3. Update Specs with typing simulation
    function updateSpecs(key) {
        const s1 = document.getElementById('spec-a-1');
        const s2 = document.getElementById('spec-a-2');
        
        // Simple fade swap
        s1.style.opacity = 0; s2.style.opacity = 0;
        setTimeout(() => {
            s1.textContent = specsData[key][0];
            s2.textContent = specsData[key][1];
            s1.style.opacity = 1; s2.style.opacity = 1;
        }, 200);
    }
});






// SCHEME
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Tech Scheme Logic ---
    const buttons = document.querySelectorAll('.ts-item');
    const svgGroups = {
        core: document.getElementById('viz-core'),
        comms: document.getElementById('viz-comms'),
        power: document.getElementById('viz-power')
    };
    const labels = {
        core: document.querySelector('.t-core'),
        comms: document.querySelector('.t-comms'),
        power: document.querySelector('.t-power')
    };

    function setActiveScheme(target) {
        // Reset Buttons
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Reset SVG Groups
        Object.values(svgGroups).forEach(g => {
            if(g) g.classList.remove('active');
        });

        // Reset Labels
        Object.values(labels).forEach(l => {
            if(l) l.parentElement.classList.remove('active-label');
            if(l) l.style.opacity = '0';
            if(l) l.style.transform = 'translateY(10px)';
        });

        // Activate Target
        const activeBtn = document.querySelector(`.ts-item[data-target="${target}"]`);
        if(activeBtn) activeBtn.classList.add('active');

        if(svgGroups[target]) svgGroups[target].classList.add('active');
        
        if(labels[target]) {
            labels[target].style.opacity = '1';
            labels[target].style.transform = 'translateY(0)';
        }
    }

    // Click Handlers
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveScheme(btn.dataset.target);
        });
    });

    // Initialize
    setActiveScheme('core');

    // --- Parallax Tilt Effect ---
    const card = document.querySelector('.ts-card');
    const section = document.querySelector('.tech-scheme-section');

    if(card && section && window.matchMedia("(min-width: 1024px)").matches) {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit tilt to +/- 10deg
            const rotateY = ((x - centerX) / centerX) * 10;
            const rotateX = ((y - centerY) / centerY) * -10;

            card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });

        section.addEventListener('mouseleave', () => {
            card.style.transform = `rotateY(-10deg) rotateX(10deg)`; // Reset to default pose
        });
    }
});







// Workflow Section JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.wf-step');
  const nextBtn = document.getElementById('wf-next');
  const prevBtn = document.getElementById('wf-prev');
  const progFill = document.querySelector('.prog-fill');
  const progLabel = document.querySelector('.prog-label');
  
  if (!steps.length) return; // Exit if workflow section not present

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
    if (progFill) {
      const percent = ((currentStep + 1) / totalSteps) * 100;
      progFill.style.width = `${percent}%`;
    }
    if (progLabel) {
      progLabel.textContent = `Step ${currentStep + 1}/${totalSteps}`;
    }

    // 3. Update Buttons
    if (prevBtn) prevBtn.disabled = currentStep === 0;
    if (nextBtn) nextBtn.disabled = currentStep === totalSteps - 1;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps - 1) {
        currentStep++;
        updateWorkflow();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateWorkflow();
      }
    });
  }

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
    
    const section = document.querySelector('.tml-section');
    const spineDraw = document.getElementById('spine-draw');
    const items = document.querySelectorAll('.tml-item');

    // 1. Reveal Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Highlight marker when card is visible
                if(entry.target.classList.contains('tml-item')) {
                    entry.target.classList.add('active');
                }
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.tml-reveal').forEach(el => observer.observe(el));

    // 2. Scroll Progress for Spine
    window.addEventListener('scroll', () => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress through the section
        // Start drawing when section top hits middle of screen
        const start = windowHeight / 2;
        const end = rect.height; 
        
        let progress = (start - rect.top) / end * 100;
        
        // Clamp between 0 and 100
        progress = Math.max(0, Math.min(progress, 100));
        
        if (spineDraw) {
            spineDraw.style.height = `${progress}%`;
        }
    });
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


























// MISSION







//TECHINICAL SECTION
document.addEventListener('DOMContentLoaded', () => {
    // Universal Tilt Effect for .tech-card
    const cards = document.querySelectorAll('.tech-card[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Max rotation deg
            const max = 5;
            const rotateX = ((y - centerY) / centerY) * -max;
            const rotateY = ((x - centerX) / centerX) * max;

            // Apply style
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
            
            // Update glow position if you have .card-glass or similar
            // card.style.setProperty('--glow-x', `${x}px`);
            // card.style.setProperty('--glow-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        });
    });
});




//MISSION SECTION
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.msn-section');
    const cards = document.querySelectorAll('.msn-card');

    if (section && cards.length > 0) {
        section.addEventListener('mousemove', (e) => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Set CSS variables for the glow position
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });
        });
    }
});









//ARCHITECTURE SECTION SOFTWARE
document.getElementById('debug-toggle')?.addEventListener('click', function() {
    const dot = this.querySelector('.dot');
    const ping = this.querySelector('.ping');
    const label = this.querySelector('.status-label');
    
    // Simple toggle logic
    if (label.innerText === 'Pipeline Operational') {
        label.innerText = 'Debug Mode Active';
        dot.style.background = 'var(--warn)'; // Yellow/Orange
        ping.style.background = 'var(--warn)';
    } else {
        label.innerText = 'Pipeline Operational';
        dot.style.background = '#10b981'; // Green
        ping.style.background = '#10b981';
    }
});


//DEPLOYMENT SECTION
document.addEventListener('DOMContentLoaded', () => {
    const simBtn = document.getElementById('sim-toggle');
    const stateText = simBtn.querySelector('.state-text');
    const section = document.getElementById('deployment');

    if(simBtn && section) {
        simBtn.addEventListener('click', () => {
            // Toggle Active Class
            const isActive = simBtn.classList.toggle('active');
            section.classList.toggle('sim-active');

            // Update Text
            if (isActive) {
                stateText.textContent = "Active";
                stateText.style.color = "var(--brand)";
            } else {
                stateText.textContent = "Standby";
                stateText.style.color = "var(--text)";
            }
        });
    }
});


//TEAMS SECTION
document.addEventListener('DOMContentLoaded', () => {
    
    // 3D Tilt Effect for Team Cards
    const cards = document.querySelectorAll('.tm-card');

    if (cards.length) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate rotation (clamped)
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Sensitivity
                const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
                const rotateY = ((x - centerX) / centerX) * 5; 

                // Apply transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                // Reset
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
            });
        });
    }
});



//IMPACT SECTION
document.addEventListener('DOMContentLoaded', () => {
    // Number Counter Animation
    const counters = document.querySelectorAll('.stat-val');
    const options = { threshold: 0.5 };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                const duration = 2000; // ms
                const start = performance.now();
                
                const update = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quart
                    const ease = 1 - Math.pow(1 - progress, 4);
                    
                    entry.target.innerText = Math.floor(ease * target);
                    
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                
                requestAnimationFrame(update);
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    counters.forEach(counter => observer.observe(counter));
});




//MINIMUM SECTION
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
});



//maintenance
document.addEventListener('DOMContentLoaded', () => {
    // 1. SCROLL OBSERVER
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));

    // 2. MOUSE SPOTLIGHT (Advanced UI)
    const cards = document.querySelectorAll('.mnt-card');
    const grid = document.querySelector('.mnt-grid');

    if(grid) {
        grid.addEventListener('mousemove', (e) => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }
});



//recognition
document.addEventListener('DOMContentLoaded', () => {
    const awdObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.awd-reveal').forEach(el => awdObserver.observe(el));
});



//intitutional recognition
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.ins-anim').forEach(el => observer.observe(el));
});




//future section
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.ft-reveal').forEach(el => observer.observe(el));
});



//challenges section
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mouse Spotlight Logic
    const grid = document.getElementById('cx-grid');
    const cards = document.querySelectorAll('.cx-card');

    if(grid) {
        grid.addEventListener('mousemove', (e) => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // 2. Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.cx-reveal').forEach(el => observer.observe(el));
});




