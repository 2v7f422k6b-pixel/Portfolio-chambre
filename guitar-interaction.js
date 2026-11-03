/* Hand-drawn guitar: a gentle six-string strum and fading vibration.
   Works with the existing illustrated SVG hotspot, without changing its position. */
(() => {
  const svg = document.getElementById('hotspots');
  const guitar = svg?.querySelector('polygon[data-open="contact"][data-room-zone-id="guitare"], polygon[data-open="contact"][aria-label*="guitar"]');
  if (!svg || !guitar) return;

  guitar.setAttribute('aria-label', 'Jouer un accord sur la guitare');
  guitar.setAttribute('title', 'Jouer de la guitare');
  guitar.dataset.guitarPlay = 'true';

  const NS = 'http://www.w3.org/2000/svg';
  const layer = document.createElementNS(NS, 'g');
  layer.id = 'guitar-vibration-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute('pointer-events', 'none');

  const strings = Array.from({ length: 6 }, () => {
    const path = document.createElementNS(NS, 'path');
    path.classList.add('guitar-string-vibration');
    layer.appendChild(path);
    return path;
  });
  const ripples = Array.from({ length: 3 }, (_, i) => {
    const path = document.createElementNS(NS, 'path');
    path.classList.add('guitar-body-ripple');
    path.style.setProperty('--ripple-delay', String(i * 0.11) + 's');
    layer.appendChild(path);
    return path;
  });
  svg.appendChild(layer);

  // The artwork and hotspot use the same 1670 x 942 coordinate system.
  // Calibrated against the six original red strings in the room illustration.
  // Keep anchors relative to the hotspot so they still move with the guitar.
  function geometry() {
    const b = guitar.getBBox();
    const x = b.x, y = b.y, w = b.width, h = b.height;
    const top = { x: x + w * 0.943 + 18, y: y - h * 0.012 + 6 };
    const bottom = { x: x + w * 0.558 + 18, y: y + h * 0.610 + 38 };
    const body = { x: x + w * 0.43, y: y + h * 0.79 };
    return { top, bottom, body, scale: Math.min(w / 113, h / 320) };
  }

  function drawString(index, time, g) {
    const spacing = index - 2.5;
    const start = { x: g.top.x + spacing * 4.85 * g.scale, y: g.top.y };
    const end = { x: g.bottom.x + spacing * 5.25 * g.scale, y: g.bottom.y };
    const vx = end.x - start.x, vy = end.y - start.y;
    const length = Math.hypot(vx, vy) || 1;
    const nx = -vy / length, ny = vx / length;
    const amplitude = 4.1 * g.scale * Math.exp(-3.3 * time);
    const frequency = 15 + index * 1.5;
    const points = [];
    for (let p = 0; p <= 20; p++) {
      const u = p / 20;
      const wobble = amplitude * Math.sin(Math.PI * u)
        * Math.sin(2 * Math.PI * (frequency * time + u * (1 + index * 0.08)));
      const px = start.x + vx * u + nx * wobble;
      const py = start.y + vy * u + ny * wobble;
      points.push((p ? 'L' : 'M') + px.toFixed(2) + ' ' + py.toFixed(2));
    }
    strings[index].setAttribute('d', points.join(' '));
  }

  function drawRipples(g) {
    const { x, y } = g.body;
    const s = g.scale;
    // Small irregular hand-drawn sound waves to the left of the guitar body.
    ripples[0].setAttribute('d', 'M ' + (x-32*s) + ' ' + (y-33*s) + ' Q ' + (x-49*s) + ' ' + y + ' ' + (x-28*s) + ' ' + (y+25*s));
    ripples[1].setAttribute('d', 'M ' + (x-42*s) + ' ' + (y-43*s) + ' Q ' + (x-66*s) + ' ' + y + ' ' + (x-38*s) + ' ' + (y+34*s));
    ripples[2].setAttribute('d', 'M ' + (x-52*s) + ' ' + (y-53*s) + ' Q ' + (x-80*s) + ' ' + y + ' ' + (x-47*s) + ' ' + (y+44*s));
  }

  let animationFrame = 0;
  function vibrate() {
    cancelAnimationFrame(animationFrame);
    const g = geometry();
    drawRipples(g);
    layer.classList.remove('is-plucking');
    // Restart the ripple animation on every tap, including rapid successive taps.
    void layer.getBoundingClientRect();
    layer.classList.add('is-plucking');
    const beginning = performance.now();
    function frame(now) {
      const time = (now - beginning) / 1000;
      if (time >= 1.7) {
        layer.style.opacity = '0';
        layer.classList.remove('is-plucking');
        return;
      }
      for (let i = 0; i < strings.length; i++) drawString(i, time, g);
      layer.style.opacity = String(Math.min(1, time * 18) * Math.min(1, (1.7 - time) * 2.3));
      animationFrame = requestAnimationFrame(frame);
    }
    frame(beginning);
  }

  let audioContext = null;
  const notes = [82.41, 123.47, 164.81, 196, 246.94, 329.63]; // E minor guitar tuning/chord
  function playStrum() {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return; // Animation still works without Web Audio.
    try {
      if (!audioContext) audioContext = new AudioContextType();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const sampleRate = audioContext.sampleRate;
      const baseTime = audioContext.currentTime + 0.02;
      notes.forEach((frequency, index) => {
        // Karplus–Strong: a short noise excitation is repeatedly averaged, producing
        // a decaying pitched string rather than a synthetic beep.
        const length = Math.ceil(sampleRate * 1.9);
        const period = Math.max(2, Math.round(sampleRate / frequency));
        const buffer = audioContext.createBuffer(1, length, sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < period; i++) samples[i] = (Math.random() * 2 - 1) * 0.55;
        const decay = 0.9967 - index * 0.00012;
        for (let i = period; i < length; i++) {
          samples[i] = (samples[i-period] + samples[i-period+1]) * 0.5 * decay;
        }
        const source = audioContext.createBufferSource();
        const lowpass = audioContext.createBiquadFilter();
        const volume = audioContext.createGain();
        const start = baseTime + index * 0.024;
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 2800 + index * 120;
        volume.gain.setValueAtTime(0.0001, start);
        volume.gain.exponentialRampToValueAtTime(0.085, start + 0.012);
        volume.gain.exponentialRampToValueAtTime(0.0001, start + 1.75);
        source.buffer = buffer;
        source.connect(lowpass);
        lowpass.connect(volume);
        volume.connect(audioContext.destination);
        source.start(start);
        source.stop(start + 1.78);
        source.onended = () => {
          source.disconnect();
          lowpass.disconnect();
          volume.disconnect();
        };
      });
    } catch (error) {
      console.warn('Guitar sound unavailable:', error);
    }
  }

  // Capture before app.js would open Contact. Contact remains in the menu and dock.
  svg.addEventListener('click', event => {
    if (!guitar.contains(event.target) && event.target !== guitar) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    vibrate();
    playStrum();
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      layer.classList.remove('is-plucking');
      layer.style.opacity = '0';
    }
  });
})();