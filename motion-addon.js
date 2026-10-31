/* Nana Portfolio — original Motion gallery. Loads only existing MP4s. */
(function () {
  'use strict';
  const MOTION = [
    { title: 'Animation 01', file: 'AB57AC59-AEA5-4DC9-8FB5-69E49036D06F.mp4' },
    { title: 'Dream 1', file: 'Dream 1.mp4' },
    { title: 'Dream 2', file: 'Dream 2.mp4' },
    { title: 'Dream 5', file: 'Dream 5.mp4' },
    { title: 'Dream 4', file: 'Dream 4.mp4' },
    { title: 'Animation 06', file: 'v1anim.mp4' },
    { title: 'Animation 07', file: 'F10FF10A-6F3F-45C6-9A38-7CA6B4BD1DA0.mp4' },
    { title: 'Animation 08', file: 'F10FF10A-6F3F-45C6-9A38-7CA6B4BD1DA0(1).mp4' },
    { title: 'Cœur nomade', file: 'coeur_nomade_animation.mp4' },
    { title: 'Bird', file: 'bird_animation.mp4' }
  ];
  const videoURL = file => 'assets/motion/' + encodeURIComponent(file);
  const byId = id => document.getElementById(id);

  // Overrides only the original 'Motion coming soon' window.
  window.openMotion = function openMotionGallery() {
    window.openWindow('Motion — Animation', `
      <div class="eyebrow">Portfolio / Motion</div>
      <h2>Motion</h2>
      <p class="section-lead">2D animations, moving images and animated loops.</p>
      <section id="motion-viewer" class="motion-viewer" hidden aria-label="Animation player">
        <button class="soft-btn" type="button" data-motion-back>← All animations</button>
        <h3 id="motion-viewer-title"></h3>
        <video id="motion-video-player" controls playsinline preload="metadata" aria-label="Selected animation"></video>
      </section>
      <div id="motion-gallery" aria-live="polite"><p class="section-lead">Loading animations…</p></div>
    `, 'motion');
    populateMotionGallery();
  };

  async function populateMotionGallery() {
    const target = byId('motion-gallery');
    if (!target) return;
    // GitHub Pages supports HEAD. This prevents broken cards before a video upload.
    const present = await Promise.all(MOTION.map(async (item, index) => {
      try {
        const response = await fetch(videoURL(item.file), { method: 'HEAD' });
        return response.ok ? { ...item, index } : null;
      } catch (_) { return null; }
    }));
    if (!target.isConnected) return; // The window may have been closed while loading.
    const available = present.filter(Boolean);
    if (!available.length) {
      target.innerHTML = `<div class="empty-state"><span class="empty-icon">▷</span>
        <h3>Animation gallery coming soon</h3>
        <p>The original animation collection will appear here once the files are published.</p></div>`;
      return;
    }
    target.innerHTML = `
      <div class="library-toolbar"><strong class="motion-count">${available.length} animation${available.length > 1 ? 's' : ''}</strong>
        <span class="count">Select a piece to watch</span></div>
      <div class="motion-gallery-grid">
      ${available.map(item => `
        <button type="button" class="motion-gallery-card" data-motion-index="${item.index}" aria-label="Watch ${item.title}">
          <span class="motion-gallery-poster">
            <video src="${videoURL(item.file)}#t=0.1" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>
            <span class="motion-gallery-play" aria-hidden="true">▶</span>
          </span>
          <span class="motion-gallery-title">${item.title}</span>
          <span class="motion-gallery-meta">Animation</span>
        </button>
      `).join('')}</div>`;
  }

  document.addEventListener('click', event => {
    const card = event.target.closest('[data-motion-index]');
    if (card) {
      const item = MOTION[Number(card.dataset.motionIndex)];
      const player = byId('motion-video-player');
      const viewer = byId('motion-viewer');
      if (!item || !player || !viewer) return;
      viewer.hidden = false;
      byId('motion-viewer-title').textContent = item.title;
      player.pause();
      player.src = videoURL(item.file);
      player.load();
      viewer.scrollIntoView({ block: 'start', behavior: 'smooth' });
      player.play().catch(() => {}); // iPad may need a second tap on native controls.
      return;
    }
    if (event.target.closest('[data-motion-back]')) {
      const player = byId('motion-video-player');
      if (player) { player.pause(); player.removeAttribute('src'); player.load(); }
      const viewer = byId('motion-viewer');
      if (viewer) viewer.hidden = true;
      byId('motion-gallery')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });

  // Preserve the existing Finder and dock; update only Finder's Motion subtitle.
  const oldFinder = window.openFinder;
  if (typeof oldFinder === 'function') {
    window.openFinder = function () {
      oldFinder();
      const card = document.querySelector('.project-card[data-open="motion"] small');
      if (card) card.textContent = 'Original 2D animations & loops';
    };
  }
})();
