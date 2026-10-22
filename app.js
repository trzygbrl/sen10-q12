/**
 * TRIZY'S PORTFOLIO - MAIN JAVASCRIPT (app.js)
 * Features:
 *  1. Theme Engine (Light Mode <-> "Cherry Blossom at Night" Dark Mode)
 *     - localStorage persistence
 *     - window.matchMedia('(prefers-color-scheme: dark)') detection & listener
 *     - Cute icon & aria updates
 *  2. Subtitle Typing & Deleting Animation
 *     - Cycles through: "AUF Undergraduate", "Tech & Data Science Enthusiast", "Musician & Creator"
 *  3. Interactive Canvas Confetti & Cherry Blossom Sparkle Effect
 *     - Lightweight, zero-dependency particle engine (petals, stars, hearts, sparkle dots)
 *  4. UI Enhancements:
 *     - Smooth scroll tracking & active navigation links
 *     - Mobile menu toggle
 *     - Back to top button
 *     - Navbar elevation on scroll
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. THEME ENGINE: LIGHT & CHERRY BLOSSOM AT NIGHT
  // ---------------------------------------------------------------------------
  const THEME_STORAGE_KEY = 'trizy_portfolio_theme';
  const themeToggleBtn = document.getElementById('themeToggle')
  const thumbIcon = document.getElementById('thumbIcon');
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  /**
   * Determine the initial theme based on:
   * 1. Saved localStorage preference
   * 2. OS preference (prefers-color-scheme: dark)
   * 3. Fallback to 'light'
   */
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Apply a theme to the document and update UI indicators
   * @param {'light'|'dark'} theme
   */
  function applyTheme(theme) {
    if (theme === 'dark') {
      bodyElement.setAttribute('data-theme', 'dark');
      htmlElement.setAttribute('data-theme', 'dark');
      bodyElement.classList.add('dark-theme');
      if (thumbIcon) thumbIcon.textContent = '🌙';
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to Cherry Blossom Light Mode');
        themeToggleBtn.setAttribute('title', 'Switch to Cherry Blossom Light Mode');
      }
    } else {
      bodyElement.removeAttribute('data-theme');
      htmlElement.removeAttribute('data-theme');
      bodyElement.classList.remove('dark-theme');
      if (thumbIcon) thumbIcon.textContent = '🌸';
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to Cherry Blossom at Night Dark Mode');
        themeToggleBtn.setAttribute('title', 'Switch to Cherry Blossom at Night Dark Mode');
      }
    }
  }

  /**
   * Toggle between light and dark theme
   */
  function toggleTheme() {
    const currentTheme = bodyElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

    // Trigger gentle celebratory sparkles when switching themes
    triggerThemeChangeParticles(nextTheme);
  }

  // Initialize theme on load
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Bind toggle event
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Listen to OS system color scheme changes if user hasn't stored a manual preference
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const hasSavedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!hasSavedTheme) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }


  // ---------------------------------------------------------------------------
  // 2. TYPING EFFECT (SUBTITLES)
  // ---------------------------------------------------------------------------
  const typingTextElement = document.getElementById('typingText');
  const subtitles = [
    'AUF Undergraduate',
    'Tech & Data Science Enthusiast',
    'Musician & Creator'
  ];

  let currentPhraseIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {
    if (!typingTextElement) return;

    const currentPhrase = subtitles[currentPhraseIndex];

    if (isDeleting) {
      // Removing characters
      typingTextElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      typingSpeed = 50; // faster deletion
    } else {
      // Adding characters
      typingTextElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      typingSpeed = 110; // natural typing cadence
    }

    // Finished typing full word
    if (!isDeleting && currentCharIndex === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 1800; // pause at the end of word
    } else if (isDeleting && currentCharIndex === 0) {
      // Finished deleting, move to next subtitle
      isDeleting = false;
      currentPhraseIndex = (currentPhraseIndex + 1) % subtitles.length;
      typingSpeed = 400; // brief pause before next word
    }

    setTimeout(typeEffect, typingSpeed);
  }

  // Start typing loop
  setTimeout(typeEffect, 600);


  // ---------------------------------------------------------------------------
  // 3. LIGHTWEIGHT CANVAS CONFETTI & SPARKLE ENGINE
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('sparkleCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animationFrameId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Color palettes for particles based on theme
  const particlePalettes = {
    light: [
      '#FF8DA1', '#FFB6C1', '#FFC0CB', '#FF6584', '#FFE4E9', '#FFD1DC', '#FFB7B2'
    ],
    dark: [
      '#FF7EB3', '#FF65A3', '#B845ED', '#FF80BF', '#FFA8CD', '#E0A9FF', '#FFFFFF'
    ]
  };

  /**
   * Particle class representing petals, sparkles, stars, and confetti
   */
  class Particle {
    constructor(x, y, options = {}) {
      this.x = x;
      this.y = y;

      const angle = options.angle ?? (Math.random() * Math.PI * 2);
      const velocity = options.velocity ?? (Math.random() * 8 + 3);

      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - (options.upwardBias ?? 3);

      this.gravity = options.gravity ?? 0.16;
      this.drag = 0.985;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;

      this.opacity = 1;
      this.fadeSpeed = Math.random() * 0.012 + 0.008;

      this.size = Math.random() * 10 + 6;
      this.shape = options.shape ?? ['petal', 'star', 'circle', 'heart'][Math.floor(Math.random() * 4)];

      const isDark = bodyElement.getAttribute('data-theme') === 'dark';
      const palette = isDark ? particlePalettes.dark : particlePalettes.light;
      this.color = options.color ?? palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.fadeSpeed;
    }

    draw(context) {
      if (this.opacity <= 0) return;

      context.save();
      context.translate(this.x, this.y);
      context.rotate((this.rotation * Math.PI) / 180);
      context.globalAlpha = Math.max(0, this.opacity);
      context.fillStyle = this.color;

      if (this.shape === 'petal') {
        // Draw cherry blossom petal shape
        context.beginPath();
        context.moveTo(0, -this.size);
        context.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.8, this.size * 0.8, 0, this.size);
        context.bezierCurveTo(-this.size * 0.8, this.size * 0.8, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
        context.closePath();
        context.fill();
      } else if (this.shape === 'star') {
        // Draw 4-point sparkle star
        context.beginPath();
        const s = this.size;
        context.moveTo(0, -s);
        context.quadraticCurveTo(0, 0, s, 0);
        context.quadraticCurveTo(0, 0, 0, s);
        context.quadraticCurveTo(0, 0, -s, 0);
        context.quadraticCurveTo(0, 0, 0, -s);
        context.closePath();
        context.fill();
      } else if (this.shape === 'heart') {
        // Draw mini heart
        const h = this.size * 0.7;
        context.beginPath();
        context.moveTo(0, -h * 0.3);
        context.bezierCurveTo(-h * 0.6, -h, -h * 1.2, -h * 0.2, 0, h);
        context.bezierCurveTo(h * 1.2, -h * 0.2, h * 0.6, -h, 0, -h * 0.3);
        context.closePath();
        context.fill();
      } else {
        // Circular soft confetti
        context.beginPath();
        context.arc(0, 0, this.size * 0.45, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    }
  }

  function animateParticles() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);

      if (p.opacity <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(animateParticles);
    } else {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Spawn a burst of confetti and sparkles
   * @param {number} originX
   * @param {number} originY
   * @param {number} count
   */
  function spawnSparkleBurst(originX, originY, count = 48) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(originX, originY, {
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5,
        velocity: Math.random() * 9 + 4,
        upwardBias: Math.random() * 5 + 3,
        gravity: 0.18
      }));
    }

    if (!animationFrameId) {
      animateParticles();
    }
  }

  /**
   * Subtle cascade when theme changes
   */
  function triggerThemeChangeParticles(theme) {
    const startX = window.innerWidth * 0.85;
    const startY = 50;

    for (let i = 0; i < 22; i++) {
      particles.push(new Particle(startX + (Math.random() - 0.5) * 60, startY + (Math.random() - 0.5) * 20, {
        angle: Math.random() * Math.PI,
        velocity: Math.random() * 4 + 2,
        upwardBias: 0.5,
        shape: theme === 'dark' ? 'star' : 'petal'
      }));
    }

    if (!animationFrameId) {
      animateParticles();
    }
  }

  // Hero Sparkle Button Interaction
  const sparkleBtn = document.getElementById('sparkleBtn');
  const sparkleCounter = document.getElementById('sparkleCounter');
  let sparkleClicks = 0;

  if (sparkleBtn) {
    sparkleBtn.addEventListener('click', function () {
      sparkleClicks++;

      // Compute button center position for the burst
      const rect = sparkleBtn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      spawnSparkleBurst(originX, originY, 52);

      // Cute button bounce effect
      sparkleBtn.style.transform = 'scale(0.94)';
      setTimeout(() => {
        sparkleBtn.style.transform = '';
      }, 150);

      // Update counter badge
      if (sparkleCounter) {
        sparkleCounter.textContent = sparkleClicks > 1 ? `+${sparkleClicks} ✨` : '✨';
        sparkleCounter.style.transform = 'scale(1.3)';
        setTimeout(() => {
          sparkleCounter.style.transform = 'scale(1)';
        }, 200);
      }
    });
  }


  // ---------------------------------------------------------------------------
  // 4. NAVIGATION & SCROLL INTERACTIONS
  // ---------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTop');

  // Sticky navbar shadow elevation on scroll
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Active Section Link Highlighting
    let currentSectionId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinkItems.forEach((link) => {
      link.classList.remove('active');
      if (currentSectionId && link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('nav-open');
    });

    // Close menu when clicking any nav link
    navLinkItems.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Back to top button
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

})();
