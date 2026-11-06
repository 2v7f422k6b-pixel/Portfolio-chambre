/* White silhouette feedback for the three independently positioned room decorations.
   Use the already-perspective-transformed artwork, not the clickable hitbox. */
(() => {
  'use strict';
  const svg = document.getElementById('hotspots');
  const hover = window.NanaRoomHover;
  if (!svg || !hover) return;

  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const [name, value] of Object.entries(attrs))
      node.setAttribute(name, String(value));
    return node;
  };

  for (const [groupId, visualSelector, hitId] of [
    ['nana-wall-lamp', '.nana-wall-lamp-visual', 'wall-lamp-hit'],
    ['nana-wall-mirror', 'g[pointer-events="none"]', 'wall-mirror-hit']
  ]) {
    const group = document.getElementById(groupId);
    const visual = group?.querySelector(visualSelector);
    const hit = document.getElementById(hitId);
    if (!group || !visual || !hit) continue;
    // Reference unfiltered artwork so night dimming/lamp glow cannot tint the ring.
    const source = make('g', {id: groupId + '-artwork-for-outline'});
    source.append(...visual.childNodes);
    visual.append(source);

    // <use> tracks the existing distorted artwork automatically after edits.
    // Filtering the *combined* artwork avoids a line down the two triangles.
    const outline = make('use', {
      href: '#' + source.id,
      class: 'nana-decor-white-outline room-hover-outline',
      filter: hover.ring,
      'aria-hidden': 'true',
      'pointer-events': 'none'
    });
    group.insertBefore(outline, hit);
  }

  const style = document.createElement('style');
  style.id = 'nana-interactive-decor-outlines-style';
  style.textContent = `
    #hotspots .nana-decor-white-outline {
      opacity: 0;
      pointer-events: none !important;
      transition: opacity .15s ease;
    }
    #hotspots #nana-wall-lamp:hover > .nana-decor-white-outline,
    #hotspots #nana-wall-lamp:focus-within > .nana-decor-white-outline,
    #hotspots #nana-wall-mirror:hover > .nana-decor-white-outline,
    #hotspots #nana-wall-mirror:focus-within > .nana-decor-white-outline,
    #hotspots.hotspot-guide-on .nana-decor-white-outline,
    #hotspots.hotspot-peek .nana-decor-white-outline {
      opacity: 1;
    }
    html.lamp-edit-mode #hotspots #nana-wall-lamp > .nana-decor-white-outline,
    html.poster-edit-mode #hotspots #nana-wall-mirror > .nana-decor-white-outline {
      opacity: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      #hotspots .nana-decor-white-outline { transition: none; }
    }
  `;
  document.head.appendChild(style);
})();
