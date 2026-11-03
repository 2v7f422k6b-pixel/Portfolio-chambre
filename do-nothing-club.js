/* Rilakkuma's Do Nothing Club — deliberately pointless, accessible, and escapable. */
(() => {
  const DURATION = 60 * 1000;
  let timer = null;
  let remaining = DURATION;
  let lastTick = 0;
  let completed = false;
  let doneBefore = false;
  try { doneBefore = sessionStorage.getItem('nana-did-nothing') === '1'; } catch (_) {}

  const $ = (selector) => document.querySelector(selector);
  const isOpen = () => !!$('#nana-do-nothing') && !$('#window-shade')?.hidden;

  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
  }
  function paintTime() {
    const clock = $('#nothing-countdown');
    const bar = $('#nothing-progress');
    if (!clock || !bar) return;
    const secs = Math.ceil(Math.max(0, remaining) / 1000);
    clock.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
    const elapsed = Math.max(0, DURATION - remaining);
    bar.style.width = (elapsed / DURATION * 100) + '%';
    bar.parentElement.setAttribute('aria-valuenow', String(Math.floor(elapsed / DURATION * 100)));
  }
  function setView(stage) {
    const root = $('#nana-do-nothing');
    if (!root) return;
    root.dataset.stage = stage;
    const headline = $('#nothing-headline');
    const message = $('#nothing-message');
    const action = $('#nothing-action');
    const certificate = $('#nothing-certificate');
    certificate.hidden = stage !== 'complete';
    if (stage === 'idle') {
      headline.textContent = 'The art of doing nothing.';
      message.textContent = doneBefore ? 'Five more minutes...' : 'You have 60 seconds to accomplish absolutely nothing.';
      action.textContent = 'Start doing nothing';
      action.dataset.nothingAction = 'start';
    } else if (stage === 'running') {
      headline.textContent = 'The art of doing nothing.';
      message.textContent = 'No tasks. No deadlines. Just existing.';
      action.textContent = 'Actually, never mind.';
      action.dataset.nothingAction = 'cancel';
    } else {
      headline.textContent = 'Congratulations.';
      message.textContent = 'You have achieved absolutely nothing.';
      action.textContent = 'Five more minutes?';
      action.dataset.nothingAction = 'start';
    }
  }
  function finish() {
    stop();
    completed = true;
    doneBefore = true;
    remaining = 0;
    try { sessionStorage.setItem('nana-did-nothing', '1'); } catch (_) {}
    paintTime();
    setView('complete');
  }
  function tick() {
    if (!isOpen()) { stop(); return; }
    const now = performance.now();
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      remaining = Math.max(0, remaining - Math.max(0, now - lastTick));
    }
    lastTick = now;
    paintTime();
    if (remaining <= 0) finish();
  }
  function start() {
    if (!isOpen()) return;
    stop();
    completed = false;
    remaining = DURATION;
    lastTick = performance.now();
    setView('running');
    paintTime();
    timer = window.setInterval(tick, 100);
  }
  function cancel() {
    stop();
    remaining = DURATION;
    paintTime();
    setView('idle');
  }
  function open() {
    stop();
    completed = false;
    remaining = DURATION;
    const content =
      '<section id="nana-do-nothing" class="nothing-club" data-stage="idle">' +
        '<div class="nothing-graphic">' +
          '<img src="assets/rilakkuma%20game%20illu.png" alt="Rilakkuma endormi sous une couverture" width="1200" height="802" draggable="false" decoding="async">' +
        '</div>' +
        '<p class="nothing-kicker">DO NOTHING CLUB / NO. 001</p>' +
        '<h2 id="nothing-headline">The art of doing nothing.</h2>' +
        '<p id="nothing-message">You have 60 seconds to accomplish absolutely nothing.</p>' +
        '<div class="nothing-clock" id="nothing-countdown" aria-label="Time remaining">01:00</div>' +
        '<div class="nothing-progress-track" role="progressbar" aria-label="One minute of nothing" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="nothing-progress" class="nothing-progress-fill"></div></div>' +
        '<div id="nothing-certificate" class="nothing-certificate" hidden aria-live="polite">' +
          '<span>✳ OFFICIALLY CERTIFIED ✳</span>' +
          '<strong>Certified Professional<br>at Doing Nothing</strong>' +
          '<small>No achievements. No deadlines. No regrets.</small>' +
        '</div>' +
        '<button id="nothing-action" class="nothing-button" type="button" data-nothing-action="start">Start doing nothing</button>' +
        '<p class="nothing-footnote">No score, no pressure. You can leave whenever you like.</p>' +
      '</section>';
    if (typeof window.openWindow === 'function') window.openWindow('DO NOTHING CLUB.exe', content, 'do-nothing');
    else return;
    paintTime();
    setView('idle');
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('#nana-do-nothing [data-nothing-action]');
    if (!button) return;
    if (button.dataset.nothingAction === 'start') start();
    else if (button.dataset.nothingAction === 'cancel') cancel();
  });
  document.addEventListener('visibilitychange', () => { lastTick = performance.now(); });
  window.addEventListener('focus', () => { lastTick = performance.now(); });
  window.NanaDoNothing = {open};
})();