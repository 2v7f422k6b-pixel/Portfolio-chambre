/* White silhouette feedback for the three independently positioned room decorations.
   Use the already-perspective-transformed artwork, not the clickable hitbox. */
(() => {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg || document.getElementById('nana-decor-white-outline-filter')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const [name, value] of Object.entries(attrs))
      node.setAttribute(name, String(value));
    return node;
  };

  // The filter renders only a delicate white ring outside the artwork alpha,
  // with a subtle halo matching the other clickable PNG objects.
  const defs = svg.querySelector(':scope > defs') || svg.insertBefore(make('defs'), svg.firstChild);
  const filter = make('filter', {
    id: 'nana-decor-white-outline-filter',
    x: '-35%', y: '-35%', width: '170%', height: '170%',
    'color-interpolation-filters': 'sRGB'
  });
  filter.append(
    make('feMorphology', { in: 'SourceAlpha', operator: 'dilate', radius: '2', result: 'expanded' }),
    make('feComposite', { in: 'expanded', in2: 'SourceAlpha', operator: 'out', result: 'rim' }),
    make('feFlood', { 'flood-color': '#fff', 'flood-opacity': '1', result: 'white' }),
    make('feComposite', { in: 'white', in2: 'rim', operator: 'in', result: 'white-rim' }),
    make('feGaussianBlur', { in: 'white-rim', stdDeviation: '2', result: 'glow' })
  );
  const merge = make('feMerge');
  merge.append(make('feMergeNode', { in: 'glow' }), make('feMergeNode', { in: 'white-rim' }));
  filter.appendChild(merge);
  defs.appendChild(filter);

  for (const [groupId, visualSelector, hitId] of [
    ['nana-wall-lamp', '.nana-wall-lamp-visual', 'wall-lamp-hit'],
    ['nana-wall-mirror', 'g[pointer-events="none"]', 'wall-mirror-hit']
  ]) {
    const group = document.getElementById(groupId);
    const visual = group?.querySelector(visualSelector);
    const hit = document.getElementById(hitId);
    if (!group || !visual || !hit) continue;
    visual.id = groupId + '-artwork-for-outline';

    // <use> tracks the existing distorted artwork automatically after edits.
    // Filtering the *combined* artwork avoids a line down the two triangles.
    const outline = make('use', {
      href: '#' + visual.id,
      class: 'nana-decor-white-outline',
      filter: 'url(#nana-decor-white-outline-filter)',
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
