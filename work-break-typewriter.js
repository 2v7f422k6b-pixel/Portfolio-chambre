/* Work-mode typewriter: five visible minutes, one invitation per Work visit. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const switchButton = document.getElementById('switch-mode');
  if (!app || !switchButton) return;

  const WORK_DELAY = 5 * 60 * 1000;
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
      <div class="wb-machine" aria-label="A typewriter writing a familiar phrase">
        <div class="wb-paper" data-done="false">
          <span class="wb-written" aria-hidden="true"></span><span class="wb-caret" aria-hidden="true"></span>
        </div>
        <div class="wb-roller" aria-hidden="true"></div>
        <div class="wb-body" aria-hidden="true">
          <div class="wb-keys">${'<i class="wb-key"></i>'.repeat(33)}</div>
        </div>
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
