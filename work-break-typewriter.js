/* Work-mode typewriter: five visible minutes, one invitation per Work visit. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const switchButton = document.getElementById('switch-mode');
  if (!app || !switchButton) return;

  // A discreet URL flag lets the owner preview the animation immediately.
  // Ordinary visitors retain the five-minute, foreground-only timer.
  const TEST_MODE = new URLSearchParams(window.location.search).get('typewriterTest') === '1';
  const WORK_DELAY = TEST_MODE ? 0 : 5 * 60 * 1000;
  const SENTENCE = 'All work and no play makes Jack a dull boy';
  const MESSAGE = Array(3).fill(SENTENCE).join(' ');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0;
  let startedAt = null;
  let timeoutId = null;
  let typeId = null;
  let shown = false;
  let wasWork = app.classList.contains('mode-work');
  let lastFocus = null;

  const dialog = document.createElement('div');
  dialog.id = 'work-break-nudge';
  dialog.hidden = true;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'wb-heading');
  dialog.setAttribute('aria-describedby', 'wb-desc');
  dialog.innerHTML = `
    <section class="wb-card">
      <button type="button" class="wb-close" data-wb-close aria-label="Close the invitation">×</button>
      <h2 class="wb-heading" id="wb-heading">A little break?</h2>
      <div class="wb-machine wb-machine-original" aria-label="A typewriter writing a familiar phrase">
        <img class="wb-original-art" src="assets/typewriter-original.svg" alt="" aria-hidden="true" draggable="false">
        <div class="wb-paper" data-done="false">
          <span class="wb-written" aria-hidden="true"></span><span class="wb-caret" aria-hidden="true"></span>
        </div>
        <svg class="wb-key-labels" data-no-translate translate="no" viewBox="0 0 2400 1986" aria-hidden="true">
          <text x="665" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">1</text><text x="782" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">2</text><text x="910" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">3</text><text x="1026" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">4</text><text x="1154" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">5</text><text x="1270" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">6</text><text x="1392" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">7</text><text x="1514" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">8</text><text x="1636" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">9</text><text x="1754" y="1388" text-anchor="middle" dominant-baseline="middle" font-size="38">0</text>
<text x="690" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">A</text><text x="800" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">Z</text><text x="910" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">E</text><text x="1020" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">R</text><text x="1130" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">T</text><text x="1238" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">Y</text><text x="1350" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">U</text><text x="1460" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">I</text><text x="1570" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">O</text><text x="1680" y="1470" text-anchor="middle" dominant-baseline="middle" font-size="38">P</text>
<text x="724" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">Q</text><text x="834" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">S</text><text x="946" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">D</text><text x="1056" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">F</text><text x="1166" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">G</text><text x="1276" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">H</text><text x="1390" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">J</text><text x="1500" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">K</text><text x="1612" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">L</text><text x="1724" y="1554" text-anchor="middle" dominant-baseline="middle" font-size="38">M</text>
<text x="620" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="28">Maj</text><text x="758" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">W</text><text x="866" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">X</text><text x="974" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">C</text><text x="1080" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">V</text><text x="1198" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">B</text><text x="1304" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">N</text><text x="1416" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">,</text><text x="1498" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">;</text><text x="1576" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">:</text><text x="1672" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="38">!</text><text x="1778" y="1640" text-anchor="middle" dominant-baseline="middle" font-size="28">Maj</text>
        </svg>
      </div>
      <p class="wb-desc" id="wb-desc">Maybe it’s time to explore the other side?</p>
      <div class="wb-actions">
        <button type="button" class="wb-go" data-wb-play>Go to Play mode ♥</button>
        <button type="button" class="wb-stay" data-wb-stay>Keep working</button>
      </div>
    </section>`;
  document.body.append(dialog);

  const paper = dialog.querySelector('.wb-paper');
  const written = dialog.querySelector('.wb-written');
  const machine = dialog.querySelector('.wb-machine');
  // Expose the entire quote to screen readers without 150 incremental announcements.
  written.removeAttribute('aria-hidden');
  written.setAttribute('aria-label', MESSAGE);
  written.setAttribute('role', 'img');

  function clearTyping() {
    if (typeId !== null) clearTimeout(typeId);
    typeId = null;
    machine.classList.remove('is-typing');
  }

  function hidePrompt() {
    clearTyping();
    if (dialog.hidden) return;
    dialog.hidden = true;
    if (lastFocus?.isConnected && !lastFocus.closest('[hidden]')) {
      lastFocus.focus({preventScroll: true});
    }
    lastFocus = null;
  }

  function typeMessage() {
    let i = 0;
    written.textContent = '';
    paper.dataset.done = 'false';
    if (reduceMotion.matches) {
      written.textContent = MESSAGE;
      paper.dataset.done = 'true';
      return;
    }
    machine.classList.add('is-typing');
    function next() {
      if (dialog.hidden) return;
      i = Math.min(i + 1, MESSAGE.length);
      written.textContent = MESSAGE.slice(0, i);
      if (i < MESSAGE.length) {
        typeId = setTimeout(next, 32);
      } else {
        typeId = null;
        paper.dataset.done = 'true';
        machine.classList.remove('is-typing');
      }
    }
    typeId = setTimeout(next, 380);
  }

  function showPrompt() {
    if (shown || !isActive()) return;
    shown = true;
    lastFocus = document.activeElement;
    dialog.hidden = false;
    dialog.querySelector('[data-wb-play]').focus({preventScroll: true});
    typeMessage();
  }

  function isWork() {
    return app.classList.contains('mode-work');
  }

  function isActive() {
    return isWork() && !document.hidden;
  }

  function pauseTimer() {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = null;
    if (startedAt !== null) {
      elapsed += performance.now() - startedAt;
      startedAt = null;
    }
  }

  function sync() {
    const work = isWork();
    if (!work) {
      pauseTimer();
      if (wasWork) {
        elapsed = 0;
        shown = false;
        hidePrompt();
      }
      wasWork = false;
      return;
    }
    wasWork = true;
    if (!isActive() || shown) {
      pauseTimer();
      return;
    }
    if (startedAt === null) {
      startedAt = performance.now();
      timeoutId = setTimeout(() => {
        pauseTimer();
        showPrompt();
      }, Math.max(0, WORK_DELAY - elapsed));
    }
  }

  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-wb-play]')) {
      hidePrompt();
      // Reuse the existing navigation so the Work -> Play zoom stays consistent.
      switchButton.click();
    } else if (event.target.closest('[data-wb-stay],[data-wb-close]')) {
      hidePrompt();
    }
  });

  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hidePrompt();
    } else if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  new MutationObserver(sync).observe(app, {attributes: true, attributeFilter: ['class']});
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', pauseTimer);
  sync();
})();
