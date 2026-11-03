/* Talking figurines: two small dialogue bubbles anchored to the real PNG silhouettes. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene');
  const room = document.getElementById('room-img');
  if (!scene || !room) return;

  const W = 1670, H = 942;
  const characters = [
    {
      id: 'miffy', file: 'MIFFY.PNG', index: -1,
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
    {
      id: 'sonny', file: 'SONNY ANGEL.PNG', index: -1,
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
  ];

  const style = document.createElement('style');
  style.id = 'talking-figurines-style';
  style.textContent = `
    #play-scene .figurine-speech {
      position: absolute;
      z-index: 1200;
      box-sizing: border-box;
      display: block;
      max-width: min(255px, 58vw);
      min-width: 118px;
      padding: 11px 15px;
      background: #fff2fc;
      color: #ff173b;
      border: 2px solid #ff173b;
      border-radius: 0;
      box-shadow: 3px 4px 0 rgba(255,23,59,.16);
      font-family: "Comic Sans MS", "Trebuchet MS", cursive;
      font-size: clamp(12px, 1.15vw, 17px);
      font-weight: 700;
      line-height: 1.35;
      text-align: center;
      pointer-events: none;
      transform: translate(-50%, -100%) rotate(-1deg);
      animation: figurine-speech-in .2s ease-out both;
    }
    #play-scene .figurine-speech[hidden] { display: none !important; }
    #play-scene .figurine-speech::after {
      content: '';
      position: absolute;
      width: 13px;
      height: 13px;
      left: calc(50% - 7px);
      bottom: -9px;
      background: #fff2fc;
      border-right: 2px solid #ff173b;
      border-bottom: 2px solid #ff173b;
      transform: rotate(45deg);
    }
    #play-scene .figurine-speech[data-side="below"] {
      transform: translate(-50%, 0) rotate(1deg);
    }
    #play-scene .figurine-speech[data-side="below"]::after {
      top: -9px;
      bottom: auto;
      border-right: 0;
      border-bottom: 0;
      border-left: 2px solid #ff173b;
      border-top: 2px solid #ff173b;
    }
    html[data-theme="night"] #play-scene .figurine-speech,
    html[data-theme="night"] #play-scene .figurine-speech::after { background: #e9b5ff; }
    #play-scene .figurine-keyboard-target {
      position: absolute;
      z-index: 12;
      padding: 0;
      border: 0;
      background: transparent;
      opacity: 0;
      pointer-events: none;
    }
    #play-scene .figurine-keyboard-target:focus-visible {
      opacity: 1;
      outline: 2px dashed #ff173b;
      outline-offset: 3px;
    }
    @keyframes figurine-speech-in {
      from { opacity: 0; scale: .92; }
      to { opacity: 1; scale: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      #play-scene .figurine-speech { animation: none; }
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

  let timer = null;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function hide() {
    clearTimeout(timer);
    timer = null;
    bubble.hidden = true;
  }
  function speak(character) {
    hide();
    const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
    character.index = (character.index + 1) % character[language].length;
    bubble.textContent = character[language][character.index];
    const b = character.bounds;
    const centerX = (b.minX + b.maxX) / 2;
    const above = b.minY > 145;
    const vertical = above ? b.minY - 17 : b.maxY + 18;
    const roomWidth = scene.clientWidth || W;
    const width = Math.min(255, window.innerWidth * .58);
    const left = clamp(centerX * roomWidth / W, width / 2 + 12, roomWidth - width / 2 - 12);
    bubble.style.left = (left / roomWidth * 100) + '%';
    bubble.style.top = (clamp(vertical, 20, H - 20) / H * 100) + '%';
    bubble.dataset.side = above ? 'above' : 'below';
    bubble.hidden = false;
    timer = setTimeout(hide, 4200);
  }

  function load(character) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(img, 0, 0, W, H);
        const pixels = context.getImageData(0, 0, W, H).data;
        const mask = new Uint8Array(W * H);
        const bounds = { minX: W, minY: H, maxX: -1, maxY: -1 };
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const index = y * W + x;
            if (pixels[index * 4 + 3] <= 32) continue;
            mask[index] = 1;
            if (x < bounds.minX) bounds.minX = x;
            if (x > bounds.maxX) bounds.maxX = x;
            if (y < bounds.minY) bounds.minY = y;
            if (y > bounds.maxY) bounds.maxY = y;
          }
        }
        if (bounds.maxX < 0) return;
        character.mask = mask;
        character.bounds = bounds;

        // A keyboard-only target; pointer taps continue to use exact PNG transparency.
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'figurine-keyboard-target';
        button.setAttribute('aria-label', character.id === 'miffy' ? 'Faire parler Miffy / Let Miffy talk' : 'Faire parler Sonny Angel / Let Sonny Angel talk');
        button.style.left = (bounds.minX / W * 100) + '%';
        button.style.top = (bounds.minY / H * 100) + '%';
        button.style.width = (Math.max(12, bounds.maxX - bounds.minX) / W * 100) + '%';
        button.style.height = (Math.max(12, bounds.maxY - bounds.minY) / H * 100) + '%';
        button.addEventListener('click', event => {
          event.stopPropagation();
          speak(character);
        });
        scene.appendChild(button);
      } catch (error) {
        console.warn('Figurine speech mask unavailable:', character.file, error);
      }
    };
    img.src = 'assets/' + encodeURIComponent(character.file);
  }
  characters.forEach(load);

  scene.addEventListener('click', event => {
    if (event.target.closest?.('polygon,button,a,input,textarea,select,[role="button"]')) return;
    const rect = room.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.floor((event.clientX - rect.left) * W / rect.width);
    const y = Math.floor((event.clientY - rect.top) * H / rect.height);
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const index = y * W + x;
    for (const character of [...characters].reverse()) {
      if (!character.mask?.[index]) continue;
      event.preventDefault();
      event.stopImmediatePropagation();
      speak(character);
      return;
    }
    if (!bubble.hidden) hide();
  }, true);

  document.addEventListener('portfolio-language-change', () => {
    if (!bubble.hidden) hide();
  });
})();