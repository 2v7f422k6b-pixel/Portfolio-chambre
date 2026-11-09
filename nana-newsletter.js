/* An optional monthly letter. No email leaves the browser before a deliberate submission. */
(() => {
  'use strict';
  const progress = window.NanaProgress;
  if (!progress || window.NanaNewsletter) return;
  const KEY = 'nana-newsletter-v1';
  const ENDPOINT = 'https://formspree.io/f/mbggaaqo';
  const VERSION = '20261109';
  const english = () => document.documentElement.lang.startsWith('en');
  const t = (fr, en) => english() ? en : fr;
  function read() {
    try { const value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return {seen:value?.seen === true, requested:value?.requested === true};
    } catch (_) { return {seen:false, requested:false}; }
  }
  let state = read(), previousFocus, sending = false, status = '', source = 'notebook';
  function save(update) {
    const saved = read();
    state = {seen:state.seen || saved.seen, requested:state.requested || saved.requested, ...update};
    // Only display preferences are stored here, never the visitor's email address.
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  }
  const note = document.createElement('aside');
  note.id = 'nana-newsletter-note'; note.className = 'nn-paper nn-frame'; note.hidden = true;
  note.setAttribute('data-no-translate', '');
  note.setAttribute('aria-labelledby', 'nn-note-title');
  note.innerHTML = '<button class="nn-close nn-frame" type="button" data-nn-dismiss><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button><p id="nn-note-title"></p><p class="nn-note-copy"></p><button class="nn-button nn-frame" type="button" data-nn-open></button>';
  const dialog = document.createElement('dialog');
  dialog.id = 'nana-newsletter'; dialog.className = 'nn-paper nn-frame';
  dialog.setAttribute('data-no-translate', '');
  dialog.setAttribute('aria-labelledby', 'nn-title');
  dialog.setAttribute('aria-describedby', 'nn-description');
  dialog.innerHTML = '<button class="nn-close nn-frame" type="button" data-nn-close><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button><div class="nn-letter"><img class="nn-envelope" src="assets/portfolio-ux/mail.png" alt=""><p class="nn-eyebrow">La newsletter de Léna</p><h1 id="nn-title"></h1><p id="nn-description"></p><form id="nn-form"><label for="nn-email" id="nn-email-label"></label><div class="nn-field nn-frame"><input id="nn-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required aria-describedby="nn-consent" placeholder="toi@exemple.fr"></div><div class="nn-honey" aria-hidden="true"><label>Website<input name="_gotcha" tabindex="-1" autocomplete="off"></label></div><p id="nn-consent" class="nn-small"></p><button class="nn-button nn-frame nn-submit" type="submit"></button></form><p id="nn-status" role="status" aria-live="polite" tabindex="-1"></p><p class="nn-privacy nn-small"></p><button class="nn-later" type="button" data-nn-close></button></div>';
  document.body.append(note, dialog);
  const form = dialog.querySelector('form'), email = dialog.querySelector('#nn-email');
  const submit = dialog.querySelector('[type="submit"]'), statusNode = dialog.querySelector('#nn-status');
  function localize() {
    note.querySelector('#nn-note-title').textContent = t('On garde le lien ?', 'Shall we keep in touch?');
    note.querySelector('.nn-note-copy').textContent = t('Un petit courrier de temps en temps, pour revenir découvrir ce qui a changé ici.', 'A little letter now and then, inviting you back to discover what’s new here.');
    note.querySelector('[data-nn-open]').textContent = t('Découvrir la newsletter', 'Discover the newsletter');
    note.querySelector('[data-nn-dismiss]').setAttribute('aria-label', t('Fermer cette invitation', 'Dismiss this invitation'));
    dialog.querySelector('.nn-eyebrow').textContent = t('La newsletter de Léna', 'Letters from Léna');
    dialog.querySelector('#nn-title').textContent = t('Un petit courrier\nde ma chambre', 'A little letter\nfrom my room');
    dialog.querySelector('#nn-description').textContent = t('Des nouvelles de moi, des dessins en cours et les petites nouveautés de la chambre et de la boutique. Environ une fois par mois.', 'A few updates from me, drawings in progress and little additions to the room and the shop. About once a month.');
    dialog.querySelector('#nn-email-label').textContent = t('Ton adresse mail', 'Your email address');
    email.placeholder = t('toi@exemple.fr', 'you@example.com');
    dialog.querySelector('#nn-consent').textContent = t('En m’inscrivant, j’accepte de recevoir la newsletter de Léna (Nana Color Studio). Je peux me désinscrire à tout moment.', 'By signing up, I agree to receive Léna’s newsletter (Nana Color Studio). I can unsubscribe at any time.');
    submit.textContent = sending ? t('Envoi en cours…', 'Sending…') : t('Recevoir les petits courriers', 'Send me little letters');
    submit.disabled = sending;
    email.disabled = sending;
    form.hidden = state.requested;
    statusNode.textContent = state.requested ? t('Ta demande d’inscription a bien été envoyée. À bientôt dans ta boîte mail !', 'Your signup request has been sent. See you in your inbox!')
      : status === 'error' ? t('L’envoi n’a pas abouti. Ton adresse est toujours ici : tu peux réessayer.', 'Your request could not be sent. Your address is still here so you can try again.')
      : sending ? t('Envoi de ta demande…', 'Sending your request…') : '';
    dialog.querySelector('.nn-privacy').innerHTML = t('Ton adresse est transmise à Léna via Formspree, uniquement pour cette newsletter. Pour te désinscrire ou demander la suppression de ton adresse : ', 'Your address is sent to Léna via Formspree, only for this newsletter. To unsubscribe or ask for your address to be deleted: ') + '<a href="mailto:lena.defirmas@gmail.com">lena.defirmas@gmail.com</a>.';
    dialog.querySelector('.nn-later').textContent = t('Retour à la chambre', 'Back to the room');
    dialog.querySelector('.nn-close').setAttribute('aria-label', t('Fermer la newsletter', 'Close newsletter'));
  }
  function open(origin = 'notebook') {
    source = origin;
    note.hidden = true; save({seen:true}); localize();
    if (!dialog.open) { previousFocus = document.activeElement; dialog.showModal(); }
    (state.requested ? statusNode : email).focus({preventScroll:true});
    return true;
  }
  function close() { if (dialog.open) dialog.close(); }
  note.querySelector('[data-nn-dismiss]').addEventListener('click', () => { note.hidden = true; save({seen:true}); });
  note.querySelector('[data-nn-open]').addEventListener('click', () => {
    source = 'room-invitation';
    if (window.NanaDeepLinks) window.NanaDeepLinks.open('newsletter'); else open(source);
  });
  dialog.querySelectorAll('[data-nn-close]').forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  });
  dialog.addEventListener('close', () => {
    window.NanaDeepLinks?.sync();
    const target = previousFocus?.isConnected && previousFocus.getClientRects().length ? previousFocus : document.getElementById('nana-journal-trigger');
    target?.focus({preventScroll:true});
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || state.requested || !form.reportValidity() || form.elements._gotcha.value) return;
    // The signup button supplies explicit newsletter consent; gameplay is never submitted.
    const data = new FormData();
    data.set('email', email.value.trim());
    data.set('subject', '[Newsletter Nana Color Studio] Demande d’inscription');
    data.set('message', 'Demande explicite de recevoir la newsletter mensuelle de Léna / Nana Color Studio. Ajouter cette adresse à la liste newsletter.');
    data.set('newsletter_consent', dialog.querySelector('#nn-consent').textContent);
    data.set('consent_version', VERSION);
    data.set('consent_at', new Date().toISOString());
    data.set('language', english() ? 'en' : 'fr');
    data.set('source', source);
    sending = true; status = ''; localize();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(ENDPOINT, {method:'POST', body:data, headers:{Accept:'application/json'}, signal:controller.signal});
      if (!response.ok) throw new Error('Newsletter request rejected');
      save({seen:true, requested:true});
      form.reset();
    } catch (_) { status = 'error'; }
    finally {
      window.clearTimeout(timeout); sending = false; localize();
      if (dialog.open) statusNode.focus({preventScroll:true});
    }
  });

  const activities = ['outfit-styled', 'latte-made', 'beads-made', 'minilab-composed', 'rested', 'polaroids-all'];
  function engaged() {
    const snapshot = progress.snapshot(), room = snapshot.room;
    const required = new Set(room.required), discovered = new Set(room.discovered);
    const count = [...required].filter(id => discovered.has(id)).length;
    return activities.some(id => snapshot.feats.includes(id)) || (required.size > 0 && count * 4 >= required.size);
  }
  function roomIsClear() {
    return document.getElementById('app')?.classList.contains('mode-play') && !document.hidden && !progress.suppressed()
      && !document.querySelector('dialog[open], #window-shade:not([hidden]), #special-shade:not([hidden]), #nana-dreamlab-overlay, #coloring-overlay:not([hidden]), #work-break-nudge:not([hidden]), #nana-journal-notice:not([hidden]), #global-search-popover:not([hidden]), #mobile-menu-toggle[aria-expanded="true"]');
  }
  // Wait for a real activity, at least a minute of visible Play, and a quiet return to the room.
  // Never take focus, cover a game, or show this invitation again after it was seen.
  let activeMs = 0, lastTick = performance.now(), clearSince = null;
  const timer = window.setInterval(() => {
    const now = performance.now();
    if (!document.hidden && document.getElementById('app')?.classList.contains('mode-play')) activeMs += Math.min(1500, now - lastTick);
    lastTick = now;
    const clear = roomIsClear();
    if (!clear) { clearSince = null; note.hidden = true; }
    else if (clearSince === null) clearSince = now;
    if (state.requested || (state.seen && note.hidden)) { window.clearInterval(timer); return; }
    if (state.seen || !clear || activeMs < 60000 || now - clearSince < 2000 || !engaged()) return;
    localize(); note.hidden = false; save({seen:true});
  }, 1000);
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    const saved = read();
    state = {seen:state.seen || saved.seen, requested:state.requested || saved.requested};
    if (state.seen || state.requested) note.hidden = true;
    localize();
  });
  document.addEventListener('portfolio-language-change', localize);
  window.NanaNewsletter = {open:() => open(source), close, current:() => dialog.open ? 'newsletter' : null};
  localize();
})();
