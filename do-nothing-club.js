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
    const download = $('#nothing-download');
    if (download) download.hidden = stage !== 'complete';
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
        '<h2 id="nothing-headline">The art of doing nothing.</h2>' +
        '<p id="nothing-message">You have 60 seconds to accomplish absolutely nothing.</p>' +
        '<div class="nothing-clock" id="nothing-countdown" aria-label="Time remaining">01:00</div>' +
        '<div class="nothing-progress-track" role="progressbar" aria-label="One minute of nothing" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="nothing-progress" class="nothing-progress-fill"></div></div>' +
        '<div id="nothing-certificate" class="nothing-certificate" hidden aria-live="polite">' +
          '<span>✳ AWARDED WITHOUT THE SLIGHTEST EFFORT ✳</span>' +
          '<strong>Official Champion<br>of Absolutely Nothing</strong>' +
          '<small>For 60 seconds of world-class inactivity.</small>' +
        '</div>' +
        '<button id="nothing-download" class="nothing-button nothing-download" type="button" hidden>Download my certificate</button>' +
        '<button id="nothing-action" class="nothing-button" type="button" data-nothing-action="start">Start doing nothing</button>' +
      '</section>';
    if (typeof window.openWindow === 'function') window.openWindow('DO NOTHING CLUB.exe', content, 'do-nothing');
    else return;
    paintTime();
    setView('idle');
  }

  /* Export an original, printable PNG using the visitor's current language. */
  async function downloadCertificate() {
    if (!completed || !isOpen() || $('#nana-do-nothing')?.dataset.stage !== 'complete') return;
    const button = $('#nothing-download');
    if (!button || button.disabled) return;
    const fr = document.documentElement.lang.toLowerCase().startsWith('fr');
    button.disabled = true;
    try {
      if (document.fonts?.load) {
        await document.fonts.load('65px "Nana Trace UI"').catch(() => {});
      }
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1120;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      const red = '#ff173b', paper = '#fff2fc', pink = '#ffe2ee';
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = red;
      ctx.lineWidth = 6;
      ctx.lineJoin = 'round';
      // Slightly imperfect hand-drawn outlines, matching the portfolio.
      const frame = (inset) => {
        ctx.beginPath();
        ctx.moveTo(inset, inset + 3);
        ctx.lineTo(1600 - inset - 2, inset);
        ctx.lineTo(1600 - inset, 1120 - inset + 2);
        ctx.lineTo(inset + 3, 1120 - inset);
        ctx.closePath();
        ctx.stroke();
      };
      frame(42);
      ctx.lineWidth = 2;
      frame(61);
      const heart = (x, y, size) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size, size);
        ctx.beginPath();
        ctx.moveTo(0, .32);
        ctx.bezierCurveTo(-.85, -.32, -.55, -.95, 0, -.42);
        ctx.bezierCurveTo(.55, -.95, .85, -.32, 0, .32);
        ctx.fillStyle = red;
        ctx.fill();
        ctx.restore();
      };
      heart(123, 135, 50);
      heart(1470, 920, 48);
      heart(1467, 147, 29);
      heart(140, 954, 29);
      const fontFamily = '"Nana Trace UI", "NanaTraceUI", "Comic Sans MS", cursive';
      const centered = (value, y, size, maxWidth = 1410, color = red) => {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        let fontSize = size;
        ctx.font = fontSize + 'px ' + fontFamily;
        while (ctx.measureText(value).width > maxWidth && fontSize > 20) {
          fontSize -= 2;
          ctx.font = fontSize + 'px ' + fontFamily;
        }
        ctx.fillText(value, 800, y);
      };
      centered('NANA COLOR STUDIO  ·  DO NOTHING CLUB', 138, 32);
      centered(fr ? 'CERTIFICAT DE FLEMME INTERSIDÉRALE' : 'CERTIFICATE OF INTERGALACTIC LAZINESS', 236, 77);
      centered(fr ? '✳ DÉLIVRÉ SANS LE MOINDRE EFFORT ✳' : '✳ AWARDED WITHOUT THE SLIGHTEST EFFORT ✳', 323, 39);

      // Embed the user's Rilakkuma drawing without cropping it.
      const drawing = new Image();
      const loaded = new Promise((resolve) => {
        drawing.onload = () => resolve(true);
        drawing.onerror = () => resolve(false);
      });
      drawing.src = 'assets/rilakkuma%20game%20illu.png';
      if (await loaded) {
        const maxW = 680, maxH = 385;
        const ratio = Math.min(maxW / drawing.naturalWidth, maxH / drawing.naturalHeight);
        const w = drawing.naturalWidth * ratio, h = drawing.naturalHeight * ratio;
        ctx.fillStyle = pink;
        ctx.fillRect(800 - w / 2 - 9, 390 - 9, w + 18, h + 18);
        ctx.drawImage(drawing, 800 - w / 2, 390, w, h);
      }
      centered(fr ? 'CHAMPION·NE OFFICIEL·LE' : 'OFFICIAL CHAMPION', 829, 62);
      centered(fr ? 'DU RIEN DU TOUT' : 'OF ABSOLUTELY NOTHING', 906, 59);
      centered(fr ? 'Pour 60 secondes d’inactivité de très haut niveau.' : 'For 60 seconds of world-class inactivity.', 979, 36);
      const date = new Intl.DateTimeFormat(fr ? 'fr-FR' : 'en-GB', {dateStyle: 'long'}).format(new Date());
      centered(date, 1048, 26);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export unavailable');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fr ? 'certificat-de-flemme-intersiderale.png' : 'certificate-of-intergalactic-laziness.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      console.error('Could not export the Do Nothing certificate', error);
      window.alert(fr ? 'Impossible de télécharger le certificat pour le moment.' : 'Could not download the certificate right now.');
    } finally {
      button.disabled = false;
    }
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('#nothing-download')) {
      downloadCertificate();
      return;
    }
    const button = event.target.closest?.('#nana-do-nothing [data-nothing-action]');
    if (!button) return;
    if (button.dataset.nothingAction === 'start') start();
    else if (button.dataset.nothingAction === 'cancel') cancel();
  });
  document.addEventListener('visibilitychange', () => { lastTick = performance.now(); });
  window.addEventListener('focus', () => { lastTick = performance.now(); });
  window.NanaDoNothing = {open};
})();