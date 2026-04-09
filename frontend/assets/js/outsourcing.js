/**
 * Apviron — Resource Outsourcing Slider
 * Minimalist slider logic for the outsourcing module.
 */
(function () {
  'use strict';

  function initOutsourcingSlider() {
    const slider = document.getElementById('outsourcingSlider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.outsourcing-slide');
    if (slides.length <= 1) return; // No need for nav if only 1 slide

    // Create nav controls if they don't exist
    let navWrap = document.querySelector('.outsourcing__slider-nav');
    if (!navWrap) {
      navWrap = document.createElement('div');
      navWrap.className = 'outsourcing__slider-nav';
      slider.appendChild(navWrap);
    }

    let current = 0;
    const total = slides.length;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        slides[current].classList.remove('active');
        current = i;
        slides[current].classList.add('active');
        updateDots();
      });
      navWrap.appendChild(dot);
    });

    function updateDots() {
      navWrap.querySelectorAll('.slider__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initOutsourcingSlider);
})();
