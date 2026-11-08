/* The illustrated hotspot and the full-page shop reached from the room. */
(() => {
  'use strict';
  let dialog;
  let frame;
  let activeRoute;

  function open(route) {
    activeRoute = route;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'nana-shop-dialog';
      dialog.setAttribute('aria-label', 'Nana’s Little Shop');
      dialog.style.cssText = 'inset:0;margin:0;padding:0;border:none;width:100%;max-width:none;height:100%;max-height:none;background:#fff8e9';
      frame = document.createElement('iframe');
      frame.id = 'nana-shop-frame';
      frame.title = 'Nana’s Little Shop';
      frame.src = 'shop.html?embedded=1';
      frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
      frame.addEventListener('load', () => frame?.contentWindow?.NanaShopPage?.show(activeRoute));
      dialog.append(frame);
      dialog.addEventListener('cancel', event => {
        event.preventDefault();
        window.NanaDeepLinks.open('room');
      });
      document.body.append(dialog);
    }
    if (!dialog.open) dialog.showModal();
    frame.contentWindow.NanaShopPage?.show(route);
  }

  function close() {
    if (!dialog) return;
    activeRoute = null;
    dialog.close();
    dialog.remove();
    dialog = frame = null;
  }

  function mount() {
    const scene = document.getElementById('play-scene');
    if (!scene || document.getElementById('nana-shop-bag')) return;
    const bag = document.createElement('a');
    bag.id = 'nana-shop-bag';
    bag.href = window.NanaDeepLinks || document.querySelector('script[src*="nana-deep-links.js"]') ? '#/shop' : 'shop.html';
    bag.setAttribute('aria-label', "Ouvrir Nana's Little Shop");
    bag.title = "Nana's Little Shop";
    scene.append(bag);
    const style = document.createElement('style');
    style.textContent = '#play-scene{position:relative}#nana-shop-bag{position:absolute;left:86%;top:75.7%;width:7.65%;height:16.8%;z-index:30;display:block;cursor:pointer;background:transparent;touch-action:manipulation}#nana-shop-bag:focus-visible{outline:2px dashed #fff;outline-offset:3px}';
    document.head.append(style);
  }
  window.NanaShop = {open, close, current: () => activeRoute || null};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
