const backToTop = document.querySelector('#back-to-top');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame;

function updateBackToTop() {
  backToTop.hidden = window.scrollY < 380;
}

function stopScroll() {
  cancelAnimationFrame(scrollFrame);
}

backToTop.addEventListener('click', () => {
  stopScroll();
  document.querySelector('#home h1').focus({preventScroll: true});
  if (reducedMotion.matches) {
    window.scrollTo({top: 0, behavior: 'instant'});
    return;
  }

  const startY = window.scrollY;
  const duration = Math.min(1150, 750 + startY / 12);
  const startedAt = performance.now();
  function moveUp(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);
    window.scrollTo({top: Math.round(startY * (1 - eased)), behavior: 'instant'});
    if (progress < 1) scrollFrame = requestAnimationFrame(moveUp);
  }
  scrollFrame = requestAnimationFrame(moveUp);
});

window.addEventListener('wheel', stopScroll, {passive: true});
window.addEventListener('touchstart', stopScroll, {passive: true});
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) stopScroll();
});
window.addEventListener('scroll', updateBackToTop, {passive: true});
window.addEventListener('pageshow', updateBackToTop);
updateBackToTop();

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    const groupOffsets = new Map();
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      if (target.matches('.service, .project')) {
        const group = target.parentElement;
        const offset = groupOffsets.get(group) ?? 0;
        target.style.setProperty('--entry-delay', Math.min(offset, 5) * 150 + 'ms');
        groupOffsets.set(group, offset + 1);
      }
      target.classList.add('enter-view');
      observer.unobserve(target);
    }
  }, {threshold: 0.12});

  document.querySelectorAll('main .section-title, .service, .project').forEach(element => {
    observer.observe(element);
  });
}
