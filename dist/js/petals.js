(() => {
  const host = document.querySelector('#petals');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let burstTimer;
  const random = (a, b) => a + Math.random() * (b - a);
  function build() {
    host.replaceChildren();
    if (reduced.matches) return;
    const count = innerWidth < 768 ? 12 : 28;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span'); p.className = 'petal';
      const values = {x: `${random(0, 100)}%`, size: `${random(9, 20)}px`, opacity: random(.3, .8), blur: `${random(0, 1)}px`, wind: `${random(-100, 130)}px`, duration: `${random(10, 21)}s`, delay: `${random(-22, 0)}s`};
      Object.entries(values).forEach(([k, v]) => p.style.setProperty(`--${k}`, v)); host.append(p);
    }
  }
  function clearBurst() { clearTimeout(burstTimer); host.querySelectorAll('.spark').forEach(p => p.remove()); }
  window.Petals = { reset: clearBurst, burst() {
    clearBurst(); if (reduced.matches) return;
    for (let i = 0; i < (innerWidth < 768 ? 15 : 30); i++) {
      const p = document.createElement('span'); p.className = 'spark'; p.style.setProperty('--x', `${random(5, 95)}%`); p.style.animationDelay = `${random(0, .4)}s`; p.style.background = i % 3 ? '#d4af37' : '#b76e79'; host.append(p);
    }
    burstTimer = setTimeout(clearBurst, 3500);
  }};
  let resizeTimer; addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 200); });
  reduced.addEventListener('change', build);
  document.addEventListener('visibilitychange', () => host.classList.toggle('paused', document.hidden)); build();
})();
