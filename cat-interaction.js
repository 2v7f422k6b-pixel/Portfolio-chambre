(() => {
  const scene = document.getElementById('play-scene');
  const response = document.getElementById('cat-response');
  if (!scene || !response) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let hideTimer, sleepTimer, stroke, earFrame;
  let lastStroke = -Infinity;

  function pet(cat) {
    clearTimeout(hideTimer);
    response.classList.remove('is-purring');
    void response.getBoundingClientRect();
    response.classList.add('is-purring');
    hideTimer = setTimeout(() => response.classList.remove('is-purring'), 2200);
    if (!cat.closest('#room-v2-ambient')) return;
    window.NanaProgress?.visit('objet/chat');
    clearTimeout(sleepTimer);
    cat.setAttribute('data-niki-awake', '');
    sleepTimer = setTimeout(() => cat.removeAttribute('data-niki-awake'), 1400);
  }

  scene.addEventListener('pointerdown', event => {
    const cat = event.target.closest('#room-v2-ambient [data-cat-pet]');
    if (!cat || !event.isPrimary || event.button !== 0) return;
    stroke = {cat, id:event.pointerId, x:event.clientX, y:event.clientY, petted:false};
    event.target.setPointerCapture(event.pointerId);
  });
  scene.addEventListener('pointermove', event => {
    if (!stroke || stroke.id !== event.pointerId || stroke.petted) return;
    if (Math.hypot(event.clientX - stroke.x, event.clientY - stroke.y) < 5) return;
    stroke.petted = true;
    pet(stroke.cat);
  });
  scene.addEventListener('pointerup', event => {
    if (!stroke || event.pointerId !== stroke.id) return;
    lastStroke = stroke.petted ? performance.now() : -Infinity;
    stroke = null;
  });
  scene.addEventListener('pointercancel', () => { stroke = null; });
  scene.addEventListener('click', event => {
    const cat = event.target.closest('[data-cat-pet]');
    if (!cat || (event.detail && performance.now() - lastStroke < 500)) return;
    pet(cat);
  });

  scene.addEventListener('nana-noiraudes-emerge', () => {
    const face = scene.querySelector('.niki-face');
    if (!face || reduced.matches) return;
    cancelAnimationFrame(earFrame);
    const start = performance.now();
    function twitch(now) {
      const t = Math.min(1, (now - start) / 650);
      const pose = Math.round(6 * Math.sin(Math.PI * t) ** 2);
      face.setAttribute('viewBox', (156 * pose) + ' 310 156 142');
      if (t < 1) earFrame = requestAnimationFrame(twitch);
    }
    earFrame = requestAnimationFrame(twitch);
  });
  window.addEventListener('pagehide', () => {
    clearTimeout(hideTimer);
    clearTimeout(sleepTimer);
    cancelAnimationFrame(earFrame);
    response.classList.remove('is-purring');
    scene.querySelector('[data-niki-awake]')?.removeAttribute('data-niki-awake');
    scene.querySelector('.niki-face')?.setAttribute('viewBox','0 310 156 142');
    stroke = null;
  });
})();
