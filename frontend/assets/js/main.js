/**
 * Apviron — Main JavaScript
 * Handles scroll animations, counters, testimonials, FAQ, back-to-top, and general UX.
 */
(function () {
  'use strict';

  // ==================== Scroll Reveal ====================
  function initScrollReveal() {
    var revealElements = document.querySelectorAll('.reveal, .stagger-children, .fade-in-left, .fade-in-right, .scale-in');

    if (!revealElements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ==================== Count-Up Animation ====================
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(element) {
    var target = parseInt(element.getAttribute('data-count'), 10);
    var suffix = element.textContent.replace(/[0-9]/g, ''); // e.g., "+" or "%"
    var duration = 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      var current = Math.floor(eased * target);
      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // ==================== Testimonial Slider ====================
  function initTestimonials() {
    var track = document.getElementById('testimonialTrack');
    var prevBtn = document.getElementById('prevTestimonial');
    var nextBtn = document.getElementById('nextTestimonial');

    if (!track || !prevBtn || !nextBtn) return;

    var cards = track.querySelectorAll('.testimonial-card');
    var current = 0;
    var total = cards.length;
    var autoInterval;

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
    }

    prevBtn.addEventListener('click', function () {
      goTo(current - 1);
      resetAuto();
    });

    nextBtn.addEventListener('click', function () {
      goTo(current + 1);
      resetAuto();
    });

    function autoSlide() {
      autoInterval = setInterval(function () {
        goTo(current + 1);
      }, 5000);
    }

    function resetAuto() {
      clearInterval(autoInterval);
      autoSlide();
    }

    autoSlide();
  }

  // ==================== FAQ Accordion ====================
  function initFAQ() {
    var questions = document.querySelectorAll('.faq__question');
    if (!questions.length) return;

    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.faq__item');
        var isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq__item').forEach(function (faqItem) {
          faqItem.classList.remove('active');
        });

        // Open clicked if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // ==================== Back to Top ====================
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== Smooth Scroll for Anchor Links ====================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ==================== Newsletter Form ====================
  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('Thank you for subscribing!', 'success');
        input.value = '';
      }
    });
  }

  // ==================== Toast Notification ====================
  window.showToast = function (message, type) {
    type = type || 'info';

    // Remove existing toast
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(function () {
      toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 4000);
  };

  // ==================== Initialize Everything ====================
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initCounters();
    initTestimonials();
    initFAQ();
    initBackToTop();
    initSmoothScroll();
    initNewsletter();
  });
})();
