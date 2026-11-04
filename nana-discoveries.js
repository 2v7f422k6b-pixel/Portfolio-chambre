/* A little surprise after every distinct clickable spot in the Play room has been visited.
   The room registry supplies stable object IDs; clicks are remembered locally, not sent anywhere. */
(() => {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg) return;

  const STORAGE_KEY = 'nana-room-exploration-20261104-v1';
  const posters = [...svg.querySelectorAll('polygon[data-type="poster"]')]
    .map(el => 'poster:' + el.dataset.index);
  const objects = (window.NANA_ROOM_ZONES || []).map(zone => 'object:' + zone.id);
  // Flowers are a separate gallery hotspot; these three decor pieces are added by other scripts.
  const required = new Set([...posters, ...objects, 'flowers', 'mirror', 'wall-lamp', 'fortune-cookie']);
  if (!required.size) return;

  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) {}
  const discovered = new Set(
    (Array.isArray(stored.discovered) ? stored.discovered : []).filter(id => required.has(id))
  );
  // Existing explorers who saw the previous congratulations can claim the new gift too.
  let celebrated = stored.celebrated === true && stored.rewardSeen === true;
  const previewOnly = new URLSearchParams(location.search).get('previewReward') === '1';
  let pending = false;
  let previousFocus = null;

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        discovered: [...discovered], celebrated: celebrated, rewardSeen: celebrated
      }));
    } catch (_) { /* Still works for this visit if browser storage is disabled. */ }
  }

  function editing() {
    const flags = new URLSearchParams(location.search);
    if (['posterEdit', 'lampEdit', 'starsEdit', 'cookieEdit', 'ipadClockEdit', 'zones']
        .some(flag => flags.has(flag))) return true;
    return document.documentElement.classList.contains('poster-edit-mode')
      || document.documentElement.classList.contains('lamp-edit-mode');
  }

  function idForClick(target) {
    if (!(target instanceof Element) || !svg.contains(target)) return null;
    const zone = target.closest('[data-room-zone-id]');
    if (zone) return 'object:' + zone.dataset.roomZoneId;
    const poster = target.closest('polygon[data-type="poster"]');
    if (poster) return 'poster:' + poster.dataset.index;
    if (target.closest('#wall-mirror-hit')) return 'mirror';
    if (target.closest('#wall-lamp-hit')) return 'wall-lamp';
    if (target.closest('#nana-fortune-cookie [data-open="fortune-cookie"]')) return 'fortune-cookie';
    if (target.closest('polygon[data-open="gearnews-series"]')) return 'object:ring-light';
    if (target.closest('polygon[data-open="photos"]')) return 'flowers';
    return null;
  }

  const dialog = document.createElement('dialog');
  dialog.id = 'nana-discovery-dialog';
  dialog.setAttribute('aria-labelledby', 'nana-discovery-title');
  dialog.setAttribute('aria-describedby', 'nana-discovery-description');
  dialog.setAttribute('data-no-translate', '');
  dialog.innerHTML = [
    '<div class="nana-discovery-inside">',
    '  <button type="button" class="nana-discovery-close" aria-label="Fermer">×</button>',
    '  <div class="nana-discovery-sparkles" aria-hidden="true">',
    '    <svg viewBox="0 0 180 65" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '      <path d="M27 4L33 21L51 20L37 31L42 48L27 38L13 49L17 31L3 21L21 21Z" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>',
    '      <path d="M91 0L98 19L119 18L103 32L109 55L91 42L74 55L79 33L63 18L84 19Z" stroke="currentColor" stroke-width="2.7" stroke-linejoin="round"/>',
    '      <path d="M153 10L158 25L174 25L163 35L166 51L153 43L141 51L144 36L132 25L148 25Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    '    </svg>',
    '  </div>',
    '  <p class="nana-discovery-kicker" id="nana-discovery-kicker"></p>',
    '  <h2 id="nana-discovery-title"></h2>',
    '  <p id="nana-discovery-description"></p>',
    '  <p class="nana-discovery-count" id="nana-discovery-count"></p>',
    '  <section class="nana-discovery-reward" aria-labelledby="nana-discovery-reward-title">',
    '    <p class="nana-discovery-thanks" id="nana-discovery-thanks"></p>',
    '    <strong class="nana-discovery-discount">−10 %</strong>',
    '    <p class="nana-discovery-reward-title" id="nana-discovery-reward-title"><span id="nana-discovery-gift-text"></span> <a id="nana-discovery-shop-link" href="#" target="_blank" rel="noopener noreferrer">Nana’s Little Shop</a>.</p>',
    '    <div class="nana-discovery-coupon"><code>MERCI10</code><button type="button" id="nana-discovery-copy"></button></div>',
    '    <p class="nana-discovery-note" id="nana-discovery-note"></p>',
    '  </section>',
    '  <button type="button" class="nana-discovery-shop" id="nana-discovery-shop"></button>',
    '  <button type="button" class="nana-discovery-continue" id="nana-discovery-continue"></button>',
    '</div>'
  ].join('\n');
  document.body.appendChild(dialog);

  const closeButton = dialog.querySelector('.nana-discovery-close');
  const continueButton = dialog.querySelector('.nana-discovery-continue');
  const shopButton = dialog.querySelector('#nana-discovery-shop');
  const shopLink = dialog.querySelector('#nana-discovery-shop-link');
  const copyButton = dialog.querySelector('#nana-discovery-copy');
  shopLink.href = document.getElementById('nana-shop-bag')?.href ||
    'https://htmlpreview.github.io/?https://github.com/2v7f422k6b-pixel/Portfolio-chambre/blob/feature/nanas-little-shop/shop-prototype.html';

  function localize() {
    const english = document.documentElement.lang.toLowerCase().startsWith('en');
    dialog.querySelector('#nana-discovery-kicker').textContent = english ? 'A LITTLE SURPRISE FOR YOU' : 'UNE PETITE SURPRISE POUR TOI';
    dialog.querySelector('#nana-discovery-title').textContent = english
      ? 'The room has no more secrets for you!'
      : 'La chambre n’a plus de secrets pour toi !';
    dialog.querySelector('#nana-discovery-description').textContent = english
      ? 'You clicked on every little corner of my room. Well done, curious soul!'
      : 'Tu as cliqué dans tous les petits recoins de ma chambre. Bravo, petite âme curieuse !';
    dialog.querySelector('#nana-discovery-count').textContent = english
      ? required.size + ' interactive spots discovered'
      : required.size + ' zones cliquables découvertes';
    dialog.querySelector('#nana-discovery-thanks').textContent = english
      ? 'Thank you for exploring every little corner of my world.'
      : 'Merci d’avoir exploré tous les recoins de mon petit univers.';
    dialog.querySelector('#nana-discovery-gift-text').textContent = english
      ? 'A little gift for your next print at'
      : 'Un petit cadeau pour ton prochain print dans';
    dialog.querySelector('#nana-discovery-note').textContent = english
      ? 'Keep this code safe. Checkout is not open yet.'
      : 'Garde ce code précieusement. Les commandes ne sont pas encore ouvertes.';
    shopButton.textContent = english ? 'Visit Nana’s Little Shop' : 'Aller dans la boutique';
    copyButton.textContent = english ? 'Copy code' : 'Copier le code';
    copyButton.setAttribute('aria-label', english ? 'Copy discount code MERCI10' : 'Copier le code de réduction MERCI10');
    continueButton.textContent = english ? 'Keep wandering' : 'Continuer à flâner';
    closeButton.setAttribute('aria-label', english ? 'Close' : 'Fermer');
  }

  closeButton.addEventListener('click', () => dialog.close());
  continueButton.addEventListener('click', () => dialog.close());
  shopButton.addEventListener('click', () => {
    dialog.close();
    const bag = document.getElementById('nana-shop-bag');
    if (bag) bag.click();
    else window.open(shopLink.href, '_blank', 'noopener,noreferrer');
  });
  copyButton.addEventListener('click', async () => {
    let success = false;
    try { await navigator.clipboard.writeText('MERCI10'); success = true; }
    catch (_) {
      const input = document.createElement('textarea');
      input.value = 'MERCI10';
      input.style.cssText = 'position:fixed;left:-10000px;top:0';
      document.body.appendChild(input); input.select();
      try { success = document.execCommand('copy'); } catch (_) {}
      input.remove();
    }
    const english = document.documentElement.lang.toLowerCase().startsWith('en');
    copyButton.textContent = success ? (english ? 'Copied!' : 'Copié !') : (english ? 'Select MERCI10' : 'Sélectionne MERCI10');
  });
  dialog.addEventListener('close', () => {
    if (previousFocus && document.contains(previousFocus)
        && previousFocus.getClientRects().length) previousFocus.focus();
  });
  document.addEventListener('portfolio-language-change', localize);
  localize();

  function celebrate() {
    pending = false;
    if (celebrated || discovered.size !== required.size || editing()) return;
    localize();
    previousFocus = document.activeElement;
    try {
      dialog.showModal();
      celebrated = true;
      persist();
      closeButton.focus();
    } catch (_) { /* Keep progress; the next interaction can retry. */ }
  }

  function remember(id) {
    if (previewOnly || !id || !required.has(id) || celebrated || editing()) return;
    if (!discovered.has(id)) {
      discovered.add(id);
      persist();
    }
    if (discovered.size === required.size && !pending) {
      pending = true;
      // Let the final interactive object open before showing the congratulations.
      window.setTimeout(celebrate, 450);
    }
  }

  // Read-only preview: never changes exploration progress or marks the reward claimed.
  if (previewOnly) {
    window.setTimeout(() => {
      localize();
      if (!dialog.open) {
        try { dialog.showModal(); closeButton.focus(); } catch (_) {}
      }
    }, 350);
  }

  // Capture survives custom interactions that stop propagation (lamps, rug, cookie, etc.).
  svg.addEventListener('click', event => remember(idForClick(event.target)), true);
  // The rug's keyboard handler toggles directly instead of dispatching a click.
  svg.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest?.('[data-room-zone-id="tapis"]'))
      remember('object:tapis');
  }, true);
})();
