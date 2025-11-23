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
document.addEventListener('DOMContentLoaded', function() {
  const legendItems = document.querySelectorAll('.legend-item');
  const hardwareCategories = document.querySelectorAll('.hardware-category');
  const componentDots = document.querySelectorAll('.component-dot');
  
  // Legend item click handler
  legendItems.forEach(item => {
    item.addEventListener('click', function() {
      const component = this.dataset.component;
      
      // Update active state
      legendItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding category
      hardwareCategories.forEach(category => {
        if (component === 'all' || category.dataset.category === component) {
          category.classList.add('active');
        } else {
          category.classList.remove('active');
        }
      });
      
      // Highlight corresponding dots
      componentDots.forEach(dot => {
        if (component === 'all' || dot.dataset.component === component) {
          dot.style.opacity = '1';
          dot.style.transform = dot.style.transform.replace(/scale\([^)]*\)/, 'scale(1)');
        } else {
          dot.style.opacity = '0.3';
          dot.style.transform = dot.style.transform.replace(/scale\([^)]*\)/, 'scale(0.8)');
        }
      });
    });
  });
  
  // Component dot click handler
  componentDots.forEach(dot => {
    dot.addEventListener('click', function() {
      const component = this.dataset.component;
      const correspondingLegend = document.querySelector(`.legend-item[data-component="${component}"]`);
      
      if (correspondingLegend) {
        correspondingLegend.click();
      }
    });
  });
  
  // Magnetic effect for component cards
  const magneticCards = document.querySelectorAll('.component-card.magnetic');
  
  magneticCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angleX = (y - centerY) / 10;
      const angleY = (centerX - x) / 10;
      
      this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
});
































// Intersection Observer for reveal animations
document.addEventListener('DOMContentLoaded', function() {
  const teamCategories = document.querySelectorAll('.team-category');
  const teamMembers = document.querySelectorAll('.team-member');
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, observerOptions);
  
  // Observe categories
  teamCategories.forEach(category => {
    revealObserver.observe(category);
  });
  
  // Observe team members with staggered delay
  teamMembers.forEach((member, index) => {
    revealObserver.observe(member);
  });
  
  // Magnetic hover effect for team categories
  teamCategories.forEach(category => {
    category.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angleX = (y - centerY) / 25;
      const angleY = (centerX - x) / 25;
      
      this.style.transform = `translateY(-6px) perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
    
    category.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(-6px) perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
  
  // Ripple effect for member avatars
  teamMembers.forEach(member => {
    const avatar = member.querySelector('.member-avatar');
    
    member.addEventListener('mouseenter', function() {
      avatar.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    member.addEventListener('mouseleave', function() {
      avatar.style.transform = 'scale(1) rotate(0)';
    });
  });
});
















// Workflow Section JavaScript
class WorkflowManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.isAnimating = false;
        this.animationDuration = 800;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.startDataFlowAnimation();
    }

    bindEvents() {
        // Step click events
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', (e) => {
                if (this.isAnimating) return;
                
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber !== this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Step indicator click events
        document.querySelectorAll('.step-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                if (this.isAnimating) return;
                
                const stepNumber = parseInt(indicator.dataset.step);
                if (stepNumber !== this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Navigation buttons
        document.querySelector('.prev-btn').addEventListener('click', () => {
            if (!this.isAnimating && this.currentStep > 1) {
                this.previousStep();
            }
        });

        document.querySelector('.next-btn').addEventListener('click', () => {
            if (!this.isAnimating && this.currentStep < this.totalSteps) {
                this.nextStep();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;

            switch(e.key) {
                case 'ArrowLeft':
                    if (this.currentStep > 1) {
                        this.previousStep();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentStep < this.totalSteps) {
                        this.nextStep();
                        e.preventDefault();
                    }
                    break;
                case 'Home':
                    this.goToStep(1);
                    e.preventDefault();
                    break;
                case 'End':
                    this.goToStep(this.totalSteps);
                    e.preventDefault();
                    break;
            }
        });

        // Touch/swipe support for mobile
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;

        const workflowContainer = document.querySelector('.workflow-container');

        workflowContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        workflowContainer.addEventListener('touchend', (e) => {
            if (this.isAnimating) return;

            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;

            if (touchStartX - touchEndX > swipeThreshold) {
                // Swipe left - next step
                if (this.currentStep < this.totalSteps) {
                    this.nextStep();
                }
            } else if (touchEndX - touchStartX > swipeThreshold) {
                // Swipe right - previous step
                if (this.currentStep > 1) {
                    this.previousStep();
                }
            }
        }, { passive: true });
    }

    goToStep(stepNumber) {
        if (this.isAnimating || stepNumber < 1 || stepNumber > this.totalSteps) {
            return;
        }

        this.isAnimating = true;
        const direction = stepNumber > this.currentStep ? 'next' : 'prev';

        // Update current step
        this.currentStep = stepNumber;

        // Animate transition
        this.animateStepTransition(direction).then(() => {
            this.updateDisplay();
            this.isAnimating = false;
        });
    }

    nextStep() {
        this.goToStep(this.currentStep + 1);
    }

    previousStep() {
        this.goToStep(this.currentStep - 1);
    }

    async animateStepTransition(direction) {
        return new Promise((resolve) => {
            const timeline = document.querySelector('.timeline-progress');
            const glow = document.querySelector('.timeline-glow');
            const progressPercentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;

            // Animate timeline progress
            timeline.style.transition = `height ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            glow.style.transition = `height ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            
            timeline.style.height = `${progressPercentage}%`;
            glow.style.height = `${progressPercentage}%`;

            // Add step transition animations
            this.animateStepElements(direction);

            setTimeout(resolve, this.animationDuration);
        });
    }

    animateStepElements(direction) {
        const steps = document.querySelectorAll('.step');
        const currentStepElement = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        
        // Reset all steps
        steps.forEach(step => {
            step.classList.remove('active');
            step.style.opacity = '0.4';
            step.style.transform = 'translateX(0)';
        });

        // Animate current step
        if (currentStepElement) {
            currentStepElement.classList.add('active');
            currentStepElement.style.opacity = '1';
            
            // Add entrance animation based on direction
            if (direction === 'next') {
                currentStepElement.style.transform = 'translateX(8px)';
                setTimeout(() => {
                    currentStepElement.style.transition = 'transform 0.4s var(--ease)';
                    currentStepElement.style.transform = 'translateX(0)';
                }, 50);
            } else if (direction === 'prev') {
                currentStepElement.style.transform = 'translateX(-8px)';
                setTimeout(() => {
                    currentStepElement.style.transition = 'transform 0.4s var(--ease)';
                    currentStepElement.style.transform = 'translateX(0)';
                }, 50);
            }
        }

        // Animate adjacent steps
        const prevStep = document.querySelector(`.step[data-step="${this.currentStep - 1}"]`);
        const nextStep = document.querySelector(`.step[data-step="${this.currentStep + 1}"]`);

        if (prevStep) {
            prevStep.style.opacity = '0.7';
        }
        if (nextStep) {
            nextStep.style.opacity = '0.7';
        }
    }

    updateDisplay() {
        // Update step details content based on current step
        this.updateStepDetails();
        
        // Update navigation buttons
        this.updateNavigation();
        
        // Update step indicators
        this.updateStepIndicators();
        
        // Update progress bar
        this.updateProgressBar();
    }

    updateStepDetails() {
        const stepDetails = {
            1: {
                title: "Device Activation",
                details: [
                    {
                        icon: '<path d="M12 6V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Energy Management",
                        value: "Smart power scheduling based on battery levels"
                    },
                    {
                        icon: '<path d="M12 8V12L16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Mission Parameters",
                        value: "Configurable sampling intervals and priorities"
                    },
                    {
                        icon: '<path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "System Check",
                        value: "Comprehensive hardware diagnostics"
                    }
                ],
                progress: 14,
                time: "~45 seconds"
            },
            2: {
                title: "Position & Sensor Acquisition",
                details: [
                    {
                        icon: '<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5"/>',
                        label: "GPS Positioning",
                        value: "High-accuracy location tracking with multi-constellation support"
                    },
                    {
                        icon: '<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Sensor Calibration",
                        value: "Automatic calibration and temperature compensation"
                    },
                    {
                        icon: '<path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Data Collection",
                        value: "Multi-parameter water quality sampling"
                    }
                ],
                progress: 28,
                time: "~30 seconds"
            },
            3: {
                title: "Data Processing",
                details: [
                    {
                        icon: '<rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Signal Processing",
                        value: "Real-time filtering and noise reduction"
                    },
                    {
                        icon: '<path d="M8 8H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Data Compression",
                        value: "Efficient compression algorithms for transmission"
                    },
                    {
                        icon: '<path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Quality Validation",
                        value: "Automatic data integrity checks"
                    }
                ],
                progress: 42,
                time: "~20 seconds"
            },
            4: {
                title: "Secure Transmission",
                details: [
                    {
                        icon: '<path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Network Selection",
                        value: "Automatic NB-IoT/LTE-M network optimization"
                    },
                    {
                        icon: '<path d="M12 16V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Data Encryption",
                        value: "End-to-end encryption for secure transmission"
                    },
                    {
                        icon: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Transmission Protocol",
                        value: "Optimized for low-power, high-reliability transfer"
                    }
                ],
                progress: 56,
                time: "~15 seconds"
            },
            5: {
                title: "Cloud Integration",
                details: [
                    {
                        icon: '<path d="M19 9L20.25 6.25L23 5L20.25 3.75L19 1L17.75 3.75L15 5L17.75 6.25L19 9Z" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Data Ingestion",
                        value: "Real-time data pipeline processing"
                    },
                    {
                        icon: '<path d="M19 15L17.75 17.75L15 19L17.75 20.25L19 23L20.25 20.25L23 19L20.25 17.75L19 15Z" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Heatmap Generation",
                        value: "Dynamic environmental visualization"
                    },
                    {
                        icon: '<path d="M11 12C11 9.23858 13.2386 7 16 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Quality Computation",
                        value: "Real-time water quality index calculation"
                    }
                ],
                progress: 70,
                time: "~5 seconds"
            },
            6: {
                title: "Analytics & Insights",
                details: [
                    {
                        icon: '<path d="M12 8V12L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Trend Analysis",
                        value: "Pattern recognition and anomaly detection"
                    },
                    {
                        icon: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Hotspot Detection",
                        value: "Automatic pollution source identification"
                    },
                    {
                        icon: '<path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Alert System",
                        value: "Real-time notifications for critical events"
                    }
                ],
                progress: 84,
                time: "~2 seconds"
            },
            7: {
                title: "Human Oversight",
                details: [
                    {
                        icon: '<circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Maintenance Coordination",
                        value: "Automated scheduling and resource allocation"
                    },
                    {
                        icon: '<path d="M6 18C6 15.7909 7.79086 14 10 14H14C16.2091 14 18 15.7909 18 18V20H6V18Z" stroke="currentColor" stroke-width="1.5"/>',
                        label: "Mission Optimization",
                        value: "AI-driven deployment strategy refinement"
                    },
                    {
                        icon: '<path d="M12 16V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                        label: "Performance Review",
                        value: "Continuous improvement and system tuning"
                    }
                ],
                progress: 100,
                time: "Continuous"
            }
        };

        const currentStepData = stepDetails[this.currentStep];
        if (!currentStepData) return;

        // Update step counter
        document.querySelector('.current-step').textContent = this.currentStep;
        document.querySelector('.step-title').textContent = currentStepData.title;

        // Update details content
        const detailsContent = document.querySelector('.details-content');
        detailsContent.innerHTML = currentStepData.details.map(detail => `
            <div class="detail-item">
                <div class="detail-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                        ${detail.icon}
                    </svg>
                </div>
                <div class="detail-text">
                    <span class="detail-label">${detail.label}</span>
                    <span class="detail-value">${detail.value}</span>
                </div>
            </div>
        `).join('');

        // Update progress
        document.querySelector('.progress-fill').style.width = `${currentStepData.progress}%`;
        document.querySelector('.progress-time').textContent = currentStepData.time;
    }

    updateNavigation() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        // Update previous button
        if (this.currentStep === 1) {
            prevBtn.disabled = true;
            prevBtn.classList.remove('pulse');
        } else {
            prevBtn.disabled = false;
            if (this.currentStep === 2) {
                prevBtn.classList.add('pulse');
            } else {
                prevBtn.classList.remove('pulse');
            }
        }

        // Update next button
        if (this.currentStep === this.totalSteps) {
            nextBtn.disabled = true;
            nextBtn.classList.remove('pulse');
        } else {
            nextBtn.disabled = false;
            if (this.currentStep === this.totalSteps - 1) {
                nextBtn.classList.add('pulse');
            } else {
                nextBtn.classList.remove('pulse');
            }
        }

        // Update button text for last step
        if (this.currentStep === this.totalSteps) {
            nextBtn.innerHTML = `Complete <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        } else {
            nextBtn.innerHTML = `Next <svg viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
    }

    updateStepIndicators() {
        const indicators = document.querySelectorAll('.step-indicator');
        
        indicators.forEach(indicator => {
            const stepNumber = parseInt(indicator.dataset.step);
            
            if (stepNumber === this.currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
            
            // Add visual feedback for completed steps
            if (stepNumber < this.currentStep) {
                indicator.style.background = 'var(--brand)';
                indicator.style.opacity = '0.7';
            } else if (stepNumber === this.currentStep) {
                indicator.style.background = 'var(--brand)';
                indicator.style.opacity = '1';
            } else {
                indicator.style.background = 'color-mix(in srgb, var(--stroke) 40%, transparent)';
                indicator.style.opacity = '1';
            }
        });
    }

    updateProgressBar() {
        // Progress bar is updated in animateStepTransition
        // This method is kept for future enhancements
    }

    startDataFlowAnimation() {
        // Data flow animation is handled by CSS
        // This method is kept for future JavaScript-controlled animations
    }

    // Utility method for auto-advancing (optional feature)
    startAutoAdvance(interval = 5000) {
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentStep < this.totalSteps) {
                this.nextStep();
            } else {
                this.stopAutoAdvance();
            }
        }, interval);
    }

    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }

    // Method to handle responsive behavior
    handleResize() {
        // Add any responsive behavior adjustments here
        if (window.innerWidth < 768) {
            // Mobile-specific adjustments
            document.querySelector('.workflow-container').style.gap = 'var(--space-5)';
        } else {
            // Desktop adjustments
            document.querySelector('.workflow-container').style.gap = 'var(--space-7)';
        }
    }
}

// Initialize the workflow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const workflowManager = new WorkflowManager();

    // Add resize handler
    window.addEventListener('resize', () => {
        workflowManager.handleResize();
    });

    // Optional: Auto-advance feature (comment out if not needed)
    // workflowManager.startAutoAdvance(4000);

    // Expose workflow manager to global scope for debugging
    window.workflowManager = workflowManager;
});

// Additional utility functions for enhanced interactions
function enhanceWorkflowInteractions() {
    // Add hover effects for steps
    const steps = document.querySelectorAll('.step');
    
    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active') && !workflowManager.isAnimating) {
                this.style.transform = 'translateX(4px)';
                this.style.transition = 'transform 0.3s var(--ease)';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active') && !workflowManager.isAnimating) {
                this.style.transform = 'translateX(0)';
            }
        });
    });

    // Add magnetic effect to navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.style.setProperty('--mouse-x', `${x}px`);
                this.style.setProperty('--mouse-y', `${y}px`);
            });
        }
    });
}

// Initialize enhanced interactions
document.addEventListener('DOMContentLoaded', enhanceWorkflowInteractions);