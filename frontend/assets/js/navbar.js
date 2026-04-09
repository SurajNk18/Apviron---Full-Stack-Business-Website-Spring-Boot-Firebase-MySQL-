/**
 * Apviron — Navbar Controller
 * Handles sticky navbar, mobile menu, dropdown sub-menus, and active link highlighting.
 */
(function () {
  'use strict';

  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navMenu    = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  // ── Sticky Navbar on Scroll ──────────────────────────────────────────────
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── Mobile Menu Toggle ───────────────────────────────────────────────────
  function openMenu() {
    navMenu    && navMenu.classList.add('open');
    hamburger  && hamburger.classList.add('open');
    navOverlay && navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu    && navMenu.classList.remove('open');
    hamburger  && hamburger.classList.remove('open');
    navOverlay && navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Also close all dropdowns
    document.querySelectorAll('.navbar__dropdown-parent.open')
      .forEach(el => el.classList.remove('open'));
  }

  hamburger  && hamburger.addEventListener('click', () => {
    navMenu && navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  navOverlay && navOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

  // Close mobile menu on regular link click
  document.querySelectorAll('.navbar__link:not(.navbar__dropdown-toggle):not(.navbar__cta)')
    .forEach(link => link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMenu();
    }));

  // ── Dropdown – Desktop Hover (debounced) / Mobile Tap ───────────────────
  document.querySelectorAll('.navbar__dropdown-parent').forEach(parent => {
    const toggle   = parent.querySelector('.navbar__dropdown-toggle');
    const dropdown = parent.querySelector('.navbar__dropdown');
    let leaveTimer = null;

    function openDropdown() {
      clearTimeout(leaveTimer);
      // Close sibling dropdowns
      document.querySelectorAll('.navbar__dropdown-parent.open').forEach(el => {
        if (el !== parent) el.classList.remove('open');
      });
      parent.classList.add('open');
    }

    function scheduleClose() {
      // Small delay so cursor can travel from trigger into the dropdown panel
      // without the menu collapsing (prevents flicker)
      leaveTimer = setTimeout(() => {
        parent.classList.remove('open');
      }, 100);
    }

    // Desktop: hover with debounce on both the parent and the dropdown panel
    if (window.innerWidth > 768) {
      parent.addEventListener('mouseenter', openDropdown);
      parent.addEventListener('mouseleave', scheduleClose);

      if (dropdown) {
        dropdown.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
        dropdown.addEventListener('mouseleave', scheduleClose);
      }
    }

    // Re-bind on resize (handles switching from mobile to desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        parent.addEventListener('mouseenter', openDropdown);
        parent.addEventListener('mouseleave', scheduleClose);
        if (dropdown) {
          dropdown.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
          dropdown.addEventListener('mouseleave', scheduleClose);
        }
      }
    });

    // Mobile: tap toggle
    toggle && toggle.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const isOpen = parent.classList.contains('open');
        // Close siblings
        document.querySelectorAll('.navbar__dropdown-parent.open')
          .forEach(el => el.classList.remove('open'));
        if (!isOpen) parent.classList.add('open');
      }
    });
  });

  // Close all dropdowns when clicking outside (desktop)
  document.addEventListener('click', e => {
    if (window.innerWidth > 768 && !e.target.closest('.navbar__dropdown-parent')) {
      document.querySelectorAll('.navbar__dropdown-parent.open')
        .forEach(el => el.classList.remove('open'));
    }
  });

  // Close dropdown sub-items on mobile after navigation
  document.querySelectorAll('.navbar__dropdown a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMenu();
    });
  });

  // ── Active Link Highlighting ─────────────────────────────────────────────
  function setActiveLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__link, .navbar__dropdown-toggle').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && (href === page || href.startsWith(page + '#'))) {
        link.classList.add('active');
      }
    });
    // Also highlight parent toggle if a sub-link's page matches
    document.querySelectorAll('.navbar__dropdown a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === page || href.startsWith(page + '#')) {
        const parentEl = link.closest('.navbar__dropdown-parent');
        if (parentEl) {
          const toggleEl = parentEl.querySelector('.navbar__dropdown-toggle');
          if (toggleEl) toggleEl.classList.add('active');
        }
      }
    });
  }
  setActiveLink();

})();
