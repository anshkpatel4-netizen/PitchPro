(() => {
  const selector = '.feature,.program-card,.drill-card,.training-card,.pathway-card,.step-card,.tip-card,.mindset-card,.about-card,.value-card,.philosophy-card,.stat-box,.timeline-step,.final-section,.hero-card,.skill-card,.drill,.hero-box';
  const elements = [...document.querySelectorAll(selector)];
  elements.forEach((element) => {
    element.classList.add('pp-reveal');
    if (element.closest('.hero')) element.classList.add('pp-scroll-reveal');
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  elements.forEach((element) => observer.observe(element));
})();
