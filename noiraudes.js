(() => {
  const scene = document.getElementById('play-scene');
  const viewport = document.getElementById('play-viewport');
  if (!scene || !viewport) return;
  const layer = document.createElement('div');
  layer.dataset.roomV2Layer = '';
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:7';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.setAttribute('aria-label', document.documentElement.lang.startsWith('en') ? 'Lift the duvet corner' : 'Soulever le coin de la couette');
  trigger.style.cssText = 'position:absolute;left:30.7%;top:87.4%;width:5.7%;height:6%;padding:0;border:0;background:transparent;pointer-events:auto;cursor:pointer';
  const canvas = document.createElement('canvas');
  // Only the floor strip is redrawn. All coordinates below match the original PNG canvas.
  const floorTop = 1370;
  canvas.width = 3072;
  canvas.height = 1732 - floorTop;
  canvas.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:20.90069%;pointer-events:none';
  canvas.setAttribute('aria-hidden', 'true');
  layer.append(canvas, trigger);
  scene.append(layer);
  const ctx = canvas.getContext('2d');
  if (!ctx) { layer.remove(); return; }
  const names = ['bleue','jaune','rose'];
  const parade = [
    [0,0,9.2,0],[1,.85,10.1,1],[2,2.1,10.5,2],[0,3.8,11.4,1],
    [2,4.7,11.6,2],[1,6.1,9.8,0],[0,9.3,10.2,2]
  ];
  // Foot positions on the illustrated floor. The front opening is between
  // the two glass sides, whose nearest corners are at x=1324 and x=2122.
  // Each route rounds both corners with clearance for the widest sprite.
  const floorRoutes = [
    [995,1592,1592,1592], [1245,1689,1695,1692], [1410,1689,1695,1692],
    [1590,1548,1567,1557], [1830,1558,1577,1567], [2045,1727,1726,1728],
    [2200,1727,1726,1728], [2440,1610,1634,1622], [2700,1632,1655,1644],
    [3175,1630,1658,1644]
  ];
  function groundAt(x, lane) {
    const next = floorRoutes.findIndex(point => point[0] >= x);
    if (next <= 0) return floorRoutes[next === 0 ? 0 : floorRoutes.length-1][lane+1];
    const from = floorRoutes[next-1], to = floorRoutes[next];
    const t = (x-from[0])/(to[0]-from[0]);
    const blend = t*t*(3-2*t);
    return from[lane+1] + (to[lane+1]-from[lane+1])*blend;
  }
  let art, running = false, frame;
  function load(name) {
    const img = new Image();
    img.src = 'assets/room-redraw/noiraudes/' + name + (name === 'pli' ? '.png?v=pli-nettoye' : '.png');
    return img.decode().then(() => img);
  }
  function stop() {
    cancelAnimationFrame(frame);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    running = false;
  }
  trigger.addEventListener('click', async event => {
    event.stopPropagation();
    if (running || scene.classList.contains('sea-lit')) return;
    running = true;
    art ??= Promise.all(['pli', ...names.flatMap(name => [name+'-0',name+'-1'])].map(load));
    let images;
    try { images = await art; } catch { art = null; stop(); return; }
    const start = performance.now();
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const night = document.documentElement.dataset.theme === 'night';
    canvas.style.filter = night ? 'url(#room-v2-night-ink)' : '';
    function paint(now) {
      const t = (now-start)/1000;
      const end = still ? 3 : 20.25;
      if (t >= end || !viewport.getClientRects().length || scene.classList.contains('sea-lit')) { stop(); return; }
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.save();
      ctx.translate(0,-floorTop);
      ctx.globalAlpha = Math.min(1,t*5,(end-t)*2);
      ctx.drawImage(images[0],972,1510);
      parade.forEach(([kind,delay,duration,lane],i) => {
        if (still && i >= 3) return;
        const p = still ? .055+i*.053 : (t-delay-.18)/duration;
        if (p < 0 || p > 1) return;
        const emergence = Math.min(1,p/.038);
        const reveal = emergence*emergence*(3-2*emergence);
        // Start inside the drawn opening and join the existing walk smoothly.
        const x = 995+2180*p+42*(1-emergence)**2;
        const ground = groundAt(x,lane);
        const beat = t*(3.25+i*.12)+i;
        const pose = still ? i%2 : Math.floor(beat*2)%2;
        const img = images[1+2*kind+pose];
        const rise = still ? 0 : 3*Math.abs(Math.sin(beat*Math.PI*2));
        // Leave room for the raised yellow star to round the right corner too.
        const nearRightFoot = Math.max(0, Math.min(1, (x-1820)/225, (2440-x)/240));
        const turn = nearRightFoot*nearRightFoot*(3-2*nearRightFoot);
        const scale = .30+.62*reveal-.25*turn;
        ctx.save();
        ctx.globalAlpha *= reveal;
        ctx.drawImage(img,x-img.width*scale/2,ground-img.height*scale-rise,img.width*scale,img.height*scale);
        ctx.restore();
      });
      ctx.restore();
      frame = requestAnimationFrame(paint);
    }
    frame = requestAnimationFrame(paint);
  });
})();
