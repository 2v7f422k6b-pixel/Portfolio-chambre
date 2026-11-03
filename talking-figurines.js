/* Miffy & Sonny Angel — mysterious dialogue bubbles.
   Uses the existing SVG room-zone registry; no duplicate PNG masks or hit areas. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene');
  if (!scene) return;

  const W = 1670, H = 942;
  const figurines = {
    miffy: {
      index: -1,
      fr: [
        'Cette étoile n’était pas là hier.',
        'Le miroir se souvient de quelqu’un d’autre.',
        'J’étais là avant la chambre.',
        'Il y a une porte que tu ne vois pas.',
        'Ne compte pas les étoiles. Elles comptent aussi.',
        'Tu es déjà venu ici. Pas cette fois-ci.'
      ],
      en: [
        'That star wasn’t here yesterday.',
        'The mirror remembers someone else.',
        'I was here before the room.',
        'There’s a door you can’t see.',
        'Don’t count the stars. They count too.',
        'You’ve been here before. Not this time.'
      ]
    },
    'sonny-angel': {
      index: -1,
      fr: [
        'La nuit, je change de place sans bouger.',
        'On m’a donné des ailes pour que je reste ici.',
        'Les objets m’appellent par un autre nom.',
        'Je sais ce qu’il y a sous le tapis.',
        'Quand tu pars, la chambre devient plus grande.',
        'Quelqu’un vient ici quand tu fermes les yeux.'
      ],
      en: [
        'At night, I move without moving.',
        'They gave me wings so I would stay here.',
        'The objects call me by another name.',
        'I know what’s under the rug.',
        'When you leave, the room grows bigger.',
        'Someone comes here when you close your eyes.'
      ]
    }
  };

  const style = document.createElement('style');
  style.id = 'talking-figurines-style';
  style.textContent = `
    #play-scene .figurine-speech {
      position: absolute;
      z-index: 1200;
      box-sizing: border-box;
      max-width: min(188px, 47vw);
      min-width: 86px;
      padding: 7px 10px;
      background: #fff2fc;
      color: #ff173b;
      border: 2px solid #ff173b;
      border-radius: 11px 13px 10px 12px;
      box-shadow: 2px 3px 0 rgba(255,23,59,.12);
      font-family: "Nana Trace UI", Arial, sans-serif !important;
      font-size: clamp(10px, .85vw, 12px);
      font-weight: 400;
      line-height: 1.3;
      text-align: center;
      pointer-events: none;
      transform: translate(-50%, -100%) rotate(-1deg);
      animation: figurine-speech-in .2s ease-out both;
    }
    #play-scene .figurine-speech[hidden] { display:none!important; }
    #play-scene .figurine-speech::after {
      content: '';
      position:absolute;
      width:9px; height:9px;
      left:calc(50% - 5px); bottom:-6px;
      background:#fff2fc;
      border-right:2px solid #ff173b;
      border-bottom:2px solid #ff173b;
      transform:rotate(45deg);
    }
    #play-scene .figurine-speech[data-side="below"] {
      transform:translate(-50%, 0) rotate(1deg);
    }
    #play-scene .figurine-speech[data-side="below"]::after {
      top:-6px; bottom:auto;
      border-right:0; border-bottom:0;
      border-left:2px solid #ff173b;
      border-top:2px solid #ff173b;
    }
    html[data-theme="night"] #play-scene .figurine-speech,
    html[data-theme="night"] #play-scene .figurine-speech::after {
      background:#e9b5ff;
    }
    @keyframes figurine-speech-in {
      from {opacity:0;scale:.92;}
      to {opacity:1;scale:1;}
    }
    @media(prefers-reduced-motion:reduce) {
      #play-scene .figurine-speech {animation:none;}
    }
  `;
  document.head.appendChild(style);

  const bubble = document.createElement('div');
  bubble.className = 'figurine-speech';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  bubble.setAttribute('data-no-translate', '');
  bubble.hidden = true;
  scene.appendChild(bubble);

  let timeout;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function hide() {
    clearTimeout(timeout);
    bubble.hidden = true;
  }

  function speak(id, target) {
    const figure = figurines[id];
    if (!figure) return;
    clearTimeout(timeout);
    const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
    figure.index = (figure.index + 1) % figure[lang].length;
    bubble.textContent = figure[lang][figure.index];

    // The zone polygon and artwork use the same 1670 × 942 room coordinates.
    const box = target.getBBox();
    const x = box.x + box.width / 2;
    const above = box.y > 175;
    const y = above ? box.y - 18 : box.y + box.height + 18;

    bubble.dataset.side = above ? 'above' : 'below';
    bubble.hidden = false;
    const scaleX = scene.clientWidth / W;
    const scaleY = scene.clientHeight / H;
    const half = bubble.offsetWidth / 2;
    const px = clamp(x * scaleX, half + 8, Math.max(half + 8, scene.clientWidth - half - 8));
    bubble.style.left = px + 'px';
    bubble.style.top = clamp(y * scaleY, 12, scene.clientHeight - 12) + 'px';

    timeout = setTimeout(hide, 4200);
  }

  // Registered Miffy and Sonny polygons get priority over generic pending-zone handlers.
  // Event delegation keeps working when the registry adds its polygons asynchronously.
  scene.addEventListener('click', event => {
    const polygon = event.target.closest?.('polygon[data-figurine-speech]');
    if (!polygon) return;
    const id = polygon.dataset.figurineSpeech;
    if (!figurines[id]) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    speak(id, polygon);
  }, true);

  document.addEventListener('portfolio-language-change', hide);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hide();
  });
})();