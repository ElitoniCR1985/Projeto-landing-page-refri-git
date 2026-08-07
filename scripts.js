// Carrossel com botões, teclado e drag/swipe
(() => {
  const slider = document.querySelector('.carousel');
  const slidesContainer = slider.querySelector('.slides');
  const slides = Array.from(slidesContainer.children);
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const indicators = slider.querySelector('.indicators');

  let currentIndex = 0;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animating = false;
  let isDragging = false;

  // build indicators
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => goTo(i));
    indicators.appendChild(btn);
  });

  const indicatorButtons = Array.from(indicators.children);

  function updateUI() {
    const width = slider.querySelector('.viewport').clientWidth;
    slidesContainer.style.transform = `translateX(${-currentIndex * width}px)`;
    indicatorButtons.forEach((b, i) => b.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false'));
    // announce change for screen readers minimally
    slider.setAttribute('aria-label', `Slide ${currentIndex+1} de ${slides.length}`);
  }

  function clamp(index) {
    // circular
    if (index < 0) return slides.length - 1;
    if (index >= slides.length) return 0;
    return index;
  }

  function goTo(index) {
    currentIndex = clamp(index);
    updateUI();
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // Resize observer to keep transform correct on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    // throttle updates
    resizeTimeout = setTimeout(updateUI, 80);
  });

  // Pointer (mouse/touch) drag support
  slidesContainer.addEventListener('pointerdown', pointerDown);
  slidesContainer.addEventListener('pointerup', pointerUp);
  slidesContainer.addEventListener('pointercancel', pointerUp);
  slidesContainer.addEventListener('pointermove', pointerMove);
  slidesContainer.addEventListener('dragstart', (e) => e.preventDefault());

  function pointerDown(e) {
    // only left button or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    slider.classList.add('is-dragging');
    startX = e.clientX;
    const width = slider.querySelector('.viewport').clientWidth;
    prevTranslate = -currentIndex * width;
    currentTranslate = prevTranslate;
    slidesContainer.setPointerCapture(e.pointerId);
  }

  function pointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const width = slider.querySelector('.viewport').clientWidth;
    currentTranslate = prevTranslate + dx;
    slidesContainer.style.transition = 'none';
    slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
  }

  function pointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove('is-dragging');
    const dx = e.clientX - startX;
    const width = slider.querySelector('.viewport').clientWidth;
    const threshold = width * 0.18; // 18% swipe to change
    slidesContainer.style.transition = ''; // restore transition
    if (dx > threshold) {
      // swipe right -> previous
      goTo(currentIndex - 1);
    } else if (dx < -threshold) {
      // swipe left -> next
      goTo(currentIndex + 1);
    } else {
      // stay
      updateUI();
    }
    try { slidesContainer.releasePointerCapture(e.pointerId); } catch (_) {}
  }

  // Prevent text selection on double-click drag
  slidesContainer.addEventListener('pointerleave', () => {
    if (isDragging) updateUI();
    isDragging = false;
    slider.classList.remove('is-dragging');
  });

  // initialize
  // ensure images not draggable
  slider.querySelectorAll('img').forEach(img => img.setAttribute('draggable','false'));
  updateUI();
})();


