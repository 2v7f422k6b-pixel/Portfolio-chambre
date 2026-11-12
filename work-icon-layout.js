/* Owner-only layout controls; publishing uses the Atelier's GitHub authorization. */
(() => {
  'use strict';
  const KEY = 'nana-work-icon-layout-v1';
  const unlocked = () => { try { return sessionStorage.getItem('nana-admin-session-v1') === '1'; } catch (_) { return false; } };
  const desktop = document.getElementById('work-desktop');
  if (!desktop) return;
  let layout = window.NANA_PUBLISHED_SETTINGS?.[KEY] || {};
  if (unlocked()) { try { layout = JSON.parse(localStorage.getItem(KEY) || JSON.stringify(layout)); } catch (_) {} }
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) layout = {};
  let editing = false, toolbar, status, active, previous, drag;
  const shifts = new WeakMap();
  const profile = () => matchMedia('(max-width: 760px)').matches ? 'small' : 'large';
  const items = () => [...desktop.querySelectorAll('.desktop-folder, .desk-extra')];
  const id = el => el.dataset.open || el.dataset.object;
  const clamp = (v, min, max) => Math.max(min, Math.min(Math.max(min, max), v));
  function position(el, point) {
    const bounds = desktop.getBoundingClientRect(), rect = el.getBoundingClientRect();
    const shift = shifts.get(el) || {x:0,y:0};
    const x = clamp(point.x * bounds.width, rect.width / 2 + 8, bounds.width - rect.width / 2 - 8);
    const y = clamp(point.y * bounds.height, rect.height / 2 + 8, bounds.height - rect.height / 2 - 100);
    const dx = x - (rect.left - bounds.left + rect.width / 2 - shift.x);
    const dy = y - (rect.top - bounds.top + rect.height / 2 - shift.y);
    el.style.translate = dx + 'px ' + dy + 'px';
    shifts.set(el, {x:dx,y:dy});
    return {x:x / bounds.width,y:y / bounds.height};
  }
  function apply() {
    if (desktop.hidden || !desktop.clientWidth) return;
    const values = layout[profile()] || {};
    items().forEach(el => {
      const point = values[id(el)];
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) position(el, point);
      else { el.style.removeProperty('translate'); shifts.delete(el); }
    });
    if (status && editing) status.textContent = 'Disposition ' + (profile() === 'small' ? 'petit écran' : 'grand écran') + ' · Glisse une icône, ou sélectionne-la puis utilise les flèches.';
  }
  function move(el, x, y) {
    const bounds = desktop.getBoundingClientRect();
    const point = position(el, {x:(x-bounds.left)/bounds.width,y:(y-bounds.top)/bounds.height});
    layout[profile()] = {...layout[profile()], [id(el)]:point};
    status.textContent = 'Position modifiée. Enregistre le brouillon pour la conserver.';
  }
  function select(el) {
    active?.removeAttribute('data-layout-selected');
    active = el; active.setAttribute('data-layout-selected','true');
  }
  function finish(save) {
    if (save) {
      try { localStorage.setItem(KEY, JSON.stringify(layout)); }
      catch (_) { status.textContent = 'Le navigateur ne peut pas enregistrer le brouillon. Exporte les réglages avant de quitter.'; return; }
    } else layout = previous;
    editing = false; drag = null; active?.removeAttribute('data-layout-selected');
    desktop.classList.remove('nana-work-layout-editing'); toolbar.remove(); apply();
    document.getElementById('nana-admin-trigger')?.click();
  }
  window.NanaWorkLayout = {start() {
    if (!unlocked() || editing) return;
    document.querySelector('[data-mode="work"]')?.click();
    previous = JSON.parse(JSON.stringify(layout)); editing = true;
    desktop.classList.add('nana-work-layout-editing');
    toolbar = document.createElement('section'); toolbar.className = 'nana-admin-work-layout';
    toolbar.setAttribute('aria-label','Placement des icônes Work');
    toolbar.innerHTML = '<strong>Déplacer les icônes Work</strong><p role="status"></p><div class="nana-admin-actions"><button class="nana-admin-action" data-save>Enregistrer le brouillon</button><button class="nana-admin-action" data-reset>Disposition d’origine</button><button class="nana-admin-action" data-cancel>Annuler</button></div><small>Ensuite, « Publier sur le site » dans l’atelier pour rendre ces positions visibles à tous.</small>';
    document.body.append(toolbar); status = toolbar.querySelector('[role="status"]');
    toolbar.querySelector('[data-save]').onclick = () => finish(true);
    toolbar.querySelector('[data-cancel]').onclick = () => finish(false);
    toolbar.querySelector('[data-reset]').onclick = () => { delete layout[profile()]; apply(); status.textContent = 'Disposition d’origine rétablie pour cet écran. Enregistre le brouillon pour la conserver.'; };
    requestAnimationFrame(apply);
  }};
  desktop.addEventListener('pointerdown', e => {
    if (!editing || !unlocked() || (e.button !== undefined && e.button !== 0)) return;
    const el = e.target.closest('.desktop-folder, .desk-extra'); if (!el) return;
    e.preventDefault(); e.stopImmediatePropagation(); select(el);
    const rect = el.getBoundingClientRect();
    drag = {el, pointer:e.pointerId, x:e.clientX-rect.left-rect.width/2, y:e.clientY-rect.top-rect.height/2};
    el.setPointerCapture(e.pointerId);
  }, true);
  desktop.addEventListener('pointermove', e => {
    if (!drag || drag.pointer !== e.pointerId) return;
    e.preventDefault(); move(drag.el,e.clientX-drag.x,e.clientY-drag.y);
  });
  const stop = () => { drag = null; };
  desktop.addEventListener('pointerup', stop); desktop.addEventListener('pointercancel', stop);
  desktop.addEventListener('click', e => {
    if (!editing) return;
    const el = e.target.closest('.desktop-folder, .desk-extra'); if (!el) return;
    e.preventDefault(); e.stopImmediatePropagation(); select(el);
  }, true);
  desktop.addEventListener('keydown', e => {
    if (!editing || !e.target.matches('.desktop-folder, .desk-extra')) return;
    const directions = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if (!directions[e.key]) return;
    e.preventDefault(); e.stopPropagation(); select(e.target);
    const rect = active.getBoundingClientRect(), step = e.shiftKey ? 10 : 2, d = directions[e.key];
    move(active,rect.left+rect.width/2+d[0]*step,rect.top+rect.height/2+d[1]*step);
  });
  const css = document.createElement('style');
  css.textContent = '.nana-work-layout-editing .desktop-folder,.nana-work-layout-editing .desk-extra{touch-action:none!important;cursor:move!important;user-select:none;transition:none!important}.nana-work-layout-editing [data-layout-selected]{outline:2px dashed #f22;outline-offset:4px}.nana-admin-work-layout{position:fixed;z-index:100000;right:12px;top:58px;width:min(360px,calc(100vw - 24px));padding:14px;background:#fff9f3;color:#b91b2d;font:15px sans-serif;max-height:40vh;overflow:auto}.nana-admin-work-layout .nana-admin-action{border:0;background:transparent;color:inherit;font:inherit;text-decoration:underline;cursor:pointer;padding:7px 3px}.nana-admin-work-layout p{margin:8px 0}.nana-admin-work-layout small{display:block;margin-top:8px}';
  document.head.append(css);
  const observer = new ResizeObserver(() => { if (!drag) apply(); });
  observer.observe(desktop);
  const watchItems = () => { items().forEach(el => observer.observe(el)); apply(); };
  document.addEventListener('DOMContentLoaded', watchItems);
  document.fonts?.ready.then(watchItems);
  document.addEventListener('portfolio-mode-change', () => requestAnimationFrame(apply));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();
