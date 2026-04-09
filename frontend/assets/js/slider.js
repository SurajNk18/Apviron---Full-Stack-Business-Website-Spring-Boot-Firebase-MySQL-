/**
 * Apviron — Hero Slider
 * Full-screen banner image slider with auto-slide, prev/next arrows,
 * dot navigation, and pause-on-hover.
 */
(function () {
  'use strict';

  function initHeroSlider() {
    const slider    = document.getElementById('heroSlider');
    if (!slider) return;

    const slides    = slider.querySelectorAll('.hero-slide');
    const prevBtn   = document.getElementById('sliderPrev');
    const nextBtn   = document.getElementById('sliderNext');
    const dotsWrap  = document.getElementById('sliderDots');

    if (!slides.length) return;

    let current  = 0;
    let total    = slides.length;
    let autoTimer;
    const AUTO_DELAY = 5000;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap && dotsWrap.appendChild(dot);
    });

    function updateDots() {
      dotsWrap && dotsWrap.querySelectorAll('.slider__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      slides[current].classList.remove('active');
      current = (index + total) % total;
      slides[current].classList.add('active');
      updateDots();
    }

    function goNext() { goTo(current + 1); }
    function goPrev() { goTo(current - 1); }

    function startAuto() {
      autoTimer = setInterval(goNext, AUTO_DELAY);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    prevBtn && prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

    // Keyboard support
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { goPrev(); resetAuto(); }
      if (e.key === 'ArrowRight') { goNext(); resetAuto(); }
    });

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    slider.addEventListener('mouseleave', startAuto);

    // Touch/swipe
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 50) {
        diff < 0 ? goNext() : goPrev();
        resetAuto();
      }
    }, { passive: true });

    // Activate first slide
    slides[0].classList.add('active');
    startAuto();
  }

  document.addEventListener('DOMContentLoaded', initHeroSlider);
})();
