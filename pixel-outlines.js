/* One shared white silhouette style for all room PNGs, including the bag/Mimilab. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene'), svg = document.getElementById('hotspots');
  const hover = window.NanaRoomHover;
  if (!scene || !svg || !hover) return;
  const files = ['IMAC.PNG','TSHIRT GABZILLA.PNG','MARSHALL.PNG','CDS.PNG','IPHONE.PNG','TAMAGOTCHI.PNG','MUG LATTE.PNG','TALE.PNG','RILAKKUMA.PNG','GUITARE.PNG','RING LIGHT.PNG','CAT.PNG','INSTAX.PNG','VASE.PNG','STARS LAMP.PNG','JELLY LAMP.PNG','CRAYONS 1.PNG','CRAYONS 2.PNG','CRAYONS 3.PNG','BOOKS 1.PNG','BOOKS 2.PNG','BOOKS 3.PNG','OFFICE LAMP.PNG','IPAD.PNG','RUG.PNG','MIFFY.PNG','BAMBI LAMP.PNG','SONNY ANGEL.PNG','BRETZEL.PNG'];
  const layers = new Map();
  const extra = [];
  let pointer = null, client = null, target = null, queued = false;
  const independent = '#nana-shop-bag,#nana-wall-mirror,#nana-wall-lamp,#nana-fortune-cookie,polygon[data-type="poster"]';
  function draw() {
    queued = false;
    const all = hover.guide(), night = document.documentElement.dataset.theme === 'night';
    const focused = document.activeElement;
    const focusFile = window.NANA_ROOM_ZONES?.find(zone => zone.element === focused)?.file;
    let selected = null;
    // Foreground HTML objects and independently positioned decorations own their feedback.
    for (const item of extra) {
      if (item.night !== night) {hover.show(item.layer, false); continue;}
      const active = item.bag
        ? !!(target?.closest?.('#nana-shop-bag') || focused?.closest?.('#nana-shop-bag'))
        : !!(pointer && !target?.closest?.(independent) && hover.contains(item.layer, ...pointer));
      if (active) selected = item.layer;
      hover.show(item.layer, all || active);
    }
    if (!selected && pointer && !target?.closest?.(independent)) {
      for (let n = files.length - 1; n >= 0; n--) {
        const layer = layers.get(files[n]);
        if (hover.contains(layer, ...pointer)) {selected = layer; break;}
      }
    }
    for (const [file, layer] of layers) hover.show(layer, all || layer === selected || file === focusFile);
  }
  function schedule() {if (!queued) {queued = true; requestAnimationFrame(draw);}}
  // Decode at most two source images together; retain only cropped silhouettes.
  let next = 0, active = 0;
  function pump() {
    while (active < 2 && next < files.length) {
      const file = files[next++], image = new Image(); active++;
      image.decoding = 'async';
      image.onload = () => {
        try {
          const layer = hover.silhouette(image);
          if (layer) {layer.outline.dataset.roomOutline = file; layers.set(file, layer);}
        } catch (error) {console.warn('Could not prepare room outline', file, error);}
        active--; schedule(); pump();
      };
      image.onerror = () => {active--; pump();};
      image.src = 'assets/' + encodeURIComponent(file);
    }
  }
  pump();
  function mountExtras() {
    for (const [selector, bag, night] of [
      ['.nana-minilab-day', false, false], ['.nana-minilab-night', false, true],
      ['.nana-bag-day', true, false], ['.nana-bag-night', true, true]
    ]) {
      const image = scene.querySelector(selector);
      if (!image) continue;
      const prepare = () => {
        try {
          let box;
          if (bag) {
            // Same room percentages as nana-shop-bag.js, independent of whether
            // Play mode or either theme image is currently hidden.
            const area = {x: .86 * hover.W, y: .757 * hover.H, width: .0765 * hover.W, height: .168 * hover.H};
            const fit = Math.min(area.width / image.naturalWidth, area.height / image.naturalHeight);
            const width = image.naturalWidth * fit, height = image.naturalHeight * fit;
            box = {x: area.x + (area.width - width) / 2, y: area.y + (area.height - height) / 2, width, height};
          }
          const layer = hover.silhouette(image, box);
          if (layer) {layer.outline.dataset.roomOutline = selector; extra.push({layer, bag, night}); schedule();}
        } catch (error) {console.warn('Could not prepare added room outline', selector, error);}
      };
      if (image.complete && image.naturalWidth) prepare();
      else image.addEventListener('load', prepare, {once: true});
    }
  }
  // Images are mounted by the inline layer code and the shop script before DOMContentLoaded.
  document.addEventListener('DOMContentLoaded', mountExtras, {once: true});
  new MutationObserver(schedule).observe(svg, {attributes: true, attributeFilter: ['class']});
  new MutationObserver(schedule).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  function updatePointer() {
    if (client) {
      const r = scene.getBoundingClientRect();
      pointer = [(client[0] - r.left) * hover.W / r.width, (client[1] - r.top) * hover.H / r.height];
      target = document.elementFromPoint(...client);
      if (!scene.contains(target)) pointer = null;
    }
    schedule();
  }
  scene.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    client = [event.clientX, event.clientY]; updatePointer();
  }, {passive: true});
  scene.addEventListener('pointerleave', () => {pointer = client = target = null; schedule();});
  scene.addEventListener('pointercancel', () => {pointer = client = target = null; schedule();});
  document.getElementById('play-viewport')?.addEventListener('scroll', updatePointer, {passive: true});
  window.addEventListener('resize', updatePointer, {passive: true});
  scene.addEventListener('focusin', schedule);
  scene.addEventListener('focusout', schedule);
})();
