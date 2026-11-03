/* Nana Portfolio — Motion Reels: swipe-to-next, muted autoplay, 9:16 player. */
(() => {
  'use strict';

  // Keep filenames identical to the files in assets/motion/ on GitHub.
  const MOTION = [
    { title: 'Animation 01', file: 'AB57AC59-AEA5-4DC9-8FB5-69E49036D06F.mov' },
    { title: 'Dream 1', file: 'dream-1_FYODQUKb.mp4' },
    { title: 'Dream 2', file: 'Dream 2.mov' },
    { title: 'Dream 5', file: 'Dream 5.mov' },
    { title: 'Dream 4', file: 'Dream 4.mp4' },
    { title: 'Animation 06', file: 'v1anim.mov' },
    { title: 'Animation 07', file: 'F10FF10A-6F3F-45C6-9A38-7CA6B4BD1DA0.mp4' },
    { title: 'Animation 08', file: 'F10FF10A-6F3F-45C6-9A38-7CA6B4BD1DA0(1).mov' },
    { title: 'Cœur nomade', file: 'coeur_nomade_animation.mov' },
    { title: 'Bird', file: 'bird_animation.mov' }
  ];

  const $ = selector => document.querySelector(selector);
  const RENAME_STORAGE_KEY = 'nana-motion-video-titles-v1';
  function loadSavedTitles() {
    try {
      const saved = JSON.parse(localStorage.getItem(RENAME_STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) { return {}; }
  }
  const savedTitles = loadSavedTitles();
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
  let renameIndex = -1;
  let renameReturnFocus = null;
  const videoURL = file => 'assets/motion/' + encodeURIComponent(file);
  let available = [];
  let requestedFile = null;
  window.openMotionAt = function(file){ requestedFile = String(file||''); window.openMotion(); };
  let selected = 0;
  let soundOn = false;
  let requestId = 0;
  let gestureStart = null;
  let lastWheelAt = 0;
  let lastSwipeAt = 0;

  const isOpen = () => Boolean($('#motion-reels')?.isConnected && !$('#window-shade')?.hidden);
  const player = () => $('#motion-reels-video');

  function renderVideoList() {
    const host = $('#motion-reels-list');
    if (!host) return;
    host.innerHTML = available.map((item, i) => `
      <div class="motion-reels-list-row">
        <button type="button" class="motion-reels-choice${i === selected ? ' active' : ''}" data-motion-select="${i}" aria-current="${i === selected}">
          <span class="motion-reels-item-number">${String(i+1).padStart(2,'0')}</span>
          <span class="motion-reels-item-title">${escapeHTML(item.title)}</span>
          <span aria-hidden="true">▶</span>
        </button>
        <button type="button" class="motion-reels-rename-item" data-motion-rename="${i}" aria-label="Rename" title="Rename">✎</button>
      </div>
    `).join('');
  }

  function openRenameDialog(index, trigger) {
    if (!isOpen() || !available[index]) return;
    const overlay = $('#motion-rename-overlay');
    const input = $('#motion-rename-input');
    if (!overlay || !input) return;
    renameIndex = index;
    renameReturnFocus = trigger || document.activeElement;
    input.value = available[index].title;
    input.setCustomValidity('');
    overlay.hidden = false;
    player()?.pause();
    requestAnimationFrame(() => { input.focus({preventScroll:true}); input.select(); });
  }

  function closeRenameDialog() {
    const overlay = $('#motion-rename-overlay');
    if (overlay) overlay.hidden = true;
    renameIndex = -1;
    const focus = renameReturnFocus;
    renameReturnFocus = null;
    if (focus?.isConnected) focus.focus({preventScroll:true});
  }

  function saveRenamedVideo(event) {
    event.preventDefault();
    if (renameIndex < 0 || !available[renameIndex]) return;
    const input = $('#motion-rename-input');
    if (!input) return;
    const title = input.value.replace(/\s+/g,' ').trim();
    if (!title) {
      input.setCustomValidity('Please enter a title');
      input.reportValidity();
      return;
    }
    const item = available[renameIndex];
    item.title = title;
    savedTitles[item.file] = title;
    try { localStorage.setItem(RENAME_STORAGE_KEY, JSON.stringify(savedTitles)); } catch (_) {}
    const renameButtonIndex = renameReturnFocus?.dataset.motionRename;
    renderVideoList();
    if (renameButtonIndex !== undefined) {
      renameReturnFocus = $('#motion-reels-list [data-motion-rename="' + renameButtonIndex + '"]');
    }
    $('#motion-reels-title').textContent = available[selected].title;
    closeRenameDialog();
  }

  function pauseVideo() {
    const video = player();
    if (video) video.pause();
  }

  // A separate video is NOT loaded for every thumbnail: only one plays at a time.
  function selectVideo(index, shouldPlay = true) {
    if (!isOpen() || !available.length) return;
    selected = (index + available.length) % available.length;
    const item = available[selected];
    const video = player();
    const screen = $('#motion-reels-screen');
    if (!video || !screen) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
    screen.classList.remove('is-landscape');
    $('#motion-reels-title').textContent = item.title;
    $('#motion-reels-counter').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(available.length).padStart(2, '0')}`;
    $('#motion-reels-error').hidden = true;
    $('#motion-reels-progress').value = 0;
    $('#motion-reels-time').textContent = '0:00';
    $('#motion-reels-duration').textContent = '0:00';
    video.src = videoURL(item.file);
    video.muted = !soundOn;
    video.loop = true;
    video.playsInline = true;
    video.load();
    updateSoundButton();
    updatePlayButton();
    $('#motion-reels-drawer').hidden = true;
    document.querySelectorAll('#motion-reels-list [data-motion-select]').forEach(button => {
      const active = Number(button.dataset.motionSelect) === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'true' : 'false');
    });
    if (shouldPlay) {
      const playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(() => { updatePlayButton(); });
      }
    }
  }

  function navigate(delta) { if (available.length > 1) selectVideo(selected + delta); }

  function updatePlayButton() {
    const video = player();
    const button = $('#motion-reels-play');
    if (!video || !button) return;
    const paused = video.paused;
    button.textContent = paused ? '▶' : 'Ⅱ';
    button.setAttribute('aria-label', paused ? 'Lire la vidéo' : 'Mettre en pause');
    $('#motion-reels-screen')?.classList.toggle('is-paused', paused);
  }

  function updateSoundButton() {
    const button = $('#motion-reels-sound');
    if (!button) return;
    button.textContent = soundOn ? '♪' : '♫';
    button.setAttribute('aria-label', soundOn ? 'Couper le son' : 'Activer le son');
    button.setAttribute('aria-pressed', String(soundOn));
  }

  function togglePlay() {
    const video = player();
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    updatePlayButton();
  }

  function toggleSound() {
    soundOn = !soundOn;
    const video = player();
    if (video) {
      video.muted = !soundOn;
      if (soundOn && video.paused) video.play().catch(() => {});
    }
    updateSoundButton();
  }

  async function goFullscreen() {
    const screen = $('#motion-reels-screen');
    const video = player();
    if (!screen || !video) return;
    try {
      if (document.fullscreenElement) return await document.exitFullscreen();
      if (typeof screen.requestFullscreen === 'function') return await screen.requestFullscreen();
      // iPadOS/Safari fallback to the system's native video fullscreen player.
      if (typeof video.webkitEnterFullscreen === 'function') video.webkitEnterFullscreen();
    } catch (error) {
      // Some browsers require their native fullscreen controls; no navigation change.
    }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // Restore autoplay on next/previous even if the user has paused the current Reel.
  window.openMotion = function openMotionReels() {
    if (typeof window.openWindow !== 'function') return;
    pauseVideo();
    window.openWindow('Animations', `
      <div id="motion-reels" class="motion-reels">
        <header class="motion-reels-header">
          <div><strong>Animations</strong></div>
          <div class="motion-reels-header-right"><span id="motion-reels-counter" aria-live="polite">— / —</span>
            <button type="button" id="motion-reels-library-button" class="motion-reels-outline" aria-label="Voir toutes les animations" aria-expanded="false">☷ &nbsp; All videos</button>
          </div>
        </header>
        <div id="motion-reels-stage" class="motion-reels-stage" aria-label="Lecteur vertical. Balayer vers le haut ou le bas pour naviguer.">
          <div class="motion-reels-background" aria-hidden="true"></div>
          <span class="motion-reels-swipe-hint" aria-hidden="true">↑ &nbsp; SWIPE &nbsp; ↓</span>
          <div id="motion-reels-screen" class="motion-reels-screen is-paused">
            <video id="motion-reels-video" muted autoplay playsinline webkit-playsinline loop preload="auto" aria-label="Animation sélectionnée"></video>
            <div id="motion-reels-error" class="motion-reels-error" role="status" hidden>Ce fichier ne peut pas être lu sur cet appareil. Tu peux passer à la vidéo suivante.</div>
            <button type="button" class="motion-reels-center-play" id="motion-reels-center-play" aria-label="Lire ou mettre en pause">▶</button>
          </div>
          <div class="motion-reels-actions" aria-label="Actions vidéo">
            <button id="motion-reels-prev" type="button" aria-label="Animation précédente" title="Previous">↑</button>
            <button id="motion-reels-next" type="button" aria-label="Animation suivante" title="Next">↓</button>
            <span class="motion-reels-action-separator" aria-hidden="true"></span>
            <button id="motion-reels-play" type="button" aria-label="Mettre en pause">Ⅱ</button>
            <button id="motion-reels-sound" type="button" aria-label="Activer le son" aria-pressed="false">♫</button>
            <button id="motion-reels-fullscreen" type="button" aria-label="Plein écran">⛶</button>
          </div>
          <div id="motion-reels-loading" class="motion-reels-loading" role="status">Loading animations…</div>
        </div>
        <footer class="motion-reels-footer">
          <div class="motion-reels-label"><span class="motion-reels-deco" aria-hidden="true">♥</span><div><strong id="motion-reels-title">Original animations</strong></div><button type="button" id="motion-reels-rename-current" class="motion-reels-rename-current" aria-label="Rename" title="Rename">✎</button></div>
          <div class="motion-reels-seek"><span id="motion-reels-time">0:00</span><input type="range" id="motion-reels-progress" min="0" max="1000" value="0" step="1" aria-label="Position de lecture"><span id="motion-reels-duration">0:00</span></div>
        </footer>
        <aside id="motion-reels-drawer" class="motion-reels-drawer" hidden aria-label="Toutes les animations">
          <div class="motion-reels-drawer-top"><strong>All animations</strong><button id="motion-reels-library-close" type="button" aria-label="Fermer la liste">×</button></div>
          <div id="motion-reels-list" class="motion-reels-list"></div>
        </aside>
        <div id="motion-rename-overlay" class="motion-rename-overlay" hidden>
          <section class="motion-rename-dialog" role="dialog" aria-modal="true" aria-labelledby="motion-rename-heading">
            <div class="motion-rename-dialog-top">
              <h3 id="motion-rename-heading">Rename video</h3>
              <button type="button" id="motion-rename-close" aria-label="Close" title="Close">×</button>
            </div>
            <form id="motion-rename-form">
              <label for="motion-rename-input">Video title</label>
              <input type="text" id="motion-rename-input" name="title" maxlength="80" autocomplete="off" required>
              <p class="motion-rename-note">Saved in this browser.</p>
              <div class="motion-rename-actions">
                <button type="button" id="motion-rename-cancel">Cancel</button>
                <button type="submit" class="motion-rename-save">Save</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    `, 'motion');
    // Restrict taller window layout to Motion. The selector uses :has and cannot
    // alter other Finder / Tamagotchi / contact windows.
    loadAvailableVideos();
  };

  async function loadAvailableVideos() {
    const token = ++requestId;
    const results = await Promise.all(MOTION.map(async (item, originalIndex) => {
      try {
        const result = await fetch(videoURL(item.file), {method: 'HEAD'});
        return result.ok ? {...item, originalIndex} : null;
      } catch (error) { return null; }
    }));
    if (token !== requestId || !isOpen()) return;
    available = results.filter(Boolean).map(item => ({
      ...item,
      title: typeof savedTitles[item.file] === 'string' && savedTitles[item.file].trim()
        ? savedTitles[item.file].trim().slice(0, 80) : item.title
    }));
    const loading = $('#motion-reels-loading');
    if (loading) loading.hidden = true;
    if (!available.length) {
      $('#motion-reels-stage').insertAdjacentHTML('beforeend', '<p class="motion-reels-empty">Aucune animation trouvée dans assets/motion.</p>');
      return;
    }
    renderVideoList();
    const stage = $('#motion-reels-stage');
    stage.addEventListener('touchstart', event => {
      if (event.target.closest('button,input') || event.touches.length !== 1) { gestureStart = null; return; }
      gestureStart = { y: event.touches[0].clientY, x: event.touches[0].clientX, time: Date.now() };
    }, { passive: true });
    stage.addEventListener('touchend', event => {
      if (!gestureStart || !event.changedTouches.length) return;
      const dy = event.changedTouches[0].clientY - gestureStart.y;
      const dx = event.changedTouches[0].clientX - gestureStart.x;
      gestureStart = null;
      if (Math.abs(dy) > 48 && Math.abs(dy) > Math.abs(dx) * 1.15) {
        lastSwipeAt = Date.now(); navigate(dy < 0 ? 1 : -1);
      }
    }, { passive: true });
    stage.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) < 18) return;
      event.preventDefault();
      if (Date.now() - lastWheelAt < 650) return;
      lastWheelAt = Date.now();
      navigate(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
    const video = player();
    video.addEventListener('loadedmetadata', () => {
      $('#motion-reels-duration').textContent = formatTime(video.duration);
      const landscape = video.videoWidth > video.videoHeight;
      $('#motion-reels-screen').classList.toggle('is-landscape', landscape);
    });
    video.addEventListener('timeupdate', () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        $('#motion-reels-progress').value = String(Math.round(video.currentTime / video.duration * 1000));
        $('#motion-reels-time').textContent = formatTime(video.currentTime);
      }
    });
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('error', () => { $('#motion-reels-error').hidden = false; updatePlayButton(); });
    const wanted = available.findIndex(item => item.file === requestedFile);
    requestedFile = null;
    selectVideo(wanted >= 0 ? wanted : 0);
  }

  document.addEventListener('click', event => {
    if (!isOpen()) return;
    if (event.target.closest('#motion-rename-close,#motion-rename-cancel')) { closeRenameDialog(); return; }
    if (!$('#motion-rename-overlay')?.hidden) return;
    const rename = event.target.closest('#motion-reels-list [data-motion-rename]');
    if (rename) { openRenameDialog(Number(rename.dataset.motionRename), rename); return; }
    const renameCurrent = event.target.closest('#motion-reels-rename-current');
    if (renameCurrent) { openRenameDialog(selected, renameCurrent); return; }
    if (event.target.closest('#motion-reels-prev')) { navigate(-1); return; }
    if (event.target.closest('#motion-reels-next')) { navigate(1); return; }
    if (event.target.closest('#motion-reels-play,#motion-reels-center-play')) { togglePlay(); return; }
    if (event.target.closest('#motion-reels-sound')) { toggleSound(); return; }
    if (event.target.closest('#motion-reels-fullscreen')) { goFullscreen(); return; }
    if (event.target.closest('#motion-reels-library-button')) {
      const drawer = $('#motion-reels-drawer');
      drawer.hidden = !drawer.hidden;
      $('#motion-reels-library-button').setAttribute('aria-expanded', String(!drawer.hidden));
      return;
    }
    if (event.target.closest('#motion-reels-library-close')) {
      $('#motion-reels-drawer').hidden = true;
      $('#motion-reels-library-button').setAttribute('aria-expanded','false');
      return;
    }
    const choice = event.target.closest('#motion-reels-list [data-motion-select]');
    if (choice) { selectVideo(Number(choice.dataset.motionSelect)); return; }
    if (event.target === player() && Date.now() - lastSwipeAt > 400) togglePlay();
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'motion-rename-form' && isOpen()) saveRenamedVideo(event);
  });

  // Escape closes only the rename dialog, not the whole desktop window.
  document.addEventListener('keydown', event => {
    const overlay = $('#motion-rename-overlay');
    if (!isOpen() || !overlay || overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeRenameDialog();
      return;
    }
    if (event.key === 'Tab') {
      const focusables = [...overlay.querySelectorAll('input,button')].filter(el => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length-1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  }, true);

  document.addEventListener('input', event => {
    if (event.target.id === 'motion-rename-input') event.target.setCustomValidity('');
    if (event.target.id === 'motion-reels-progress') {
      const video = player();
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Number(event.target.value) / 1000 * video.duration;
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (!isOpen() || !$('#motion-rename-overlay')?.hidden || event.target.matches('input,textarea,select')) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
    if (event.key === ' ' && !event.target.closest('button')) { event.preventDefault(); togglePlay(); }
  });

  document.addEventListener('visibilitychange', () => {
    if (!isOpen()) return;
    if (document.hidden) pauseVideo();
    else if (player()?.muted) player().play().catch(() => {});
  });

  // Avoid audio continuing after the Mac window is closed, minimized or changed.
  document.addEventListener('click', event => {
    if (isOpen() && event.target.closest('#window-close,#window-minimize,#home-menu,#switch-mode,#dock-roomswap,#back-to-room,[data-open]')) {
      // Do not stop for buttons inside the reels: they use data-motion-* instead.
      pauseVideo();
    }
  }, true);

  // Keep Finder's original behavior and its Motion shortcut intact.
  const previousFinder = window.openFinder;
  if (typeof previousFinder === 'function') {
    window.openFinder = function (...args) {
      previousFinder(...args);
      const subtitle = document.querySelector('.project-card[data-open="motion"] small');
      if (subtitle) subtitle.textContent = 'Swipe through original animations';
    };
  }
})();
