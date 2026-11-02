/* Pixel-accurate hit testing against the original transparent Procreate layers.
   The original SVG elements remain the sole action targets and keyboard controls. */
(() => {
  const scene = document.getElementById('play-scene');
  const svg = document.getElementById('hotspots');
  if (!scene || !svg) return;
  const definitions = [
    ['work-zoom','IMAC.PNG'],
    ['gabzilla','TSHIRT GABZILLA.PNG'],
    ['music','MARSHALL.PNG'],
    ['phone','IPHONE.PNG'],
    ['tamagotchi','TAMAGOTCHI.PNG'],
    ['latte','MUG LATTE.PNG'],
    ['book','TALE.PNG'],
    ['photos','VASE.PNG'],['photos','STARS LAMP.PNG'],['about','JELLY LAMP.PNG'],['polaroids','INSTAX.PNG'],
    ['photos','CRAYONS 1.PNG'],['photos','CRAYONS 2.PNG'],['photos','CRAYONS 3.PNG'],
    ['pages','BOOKS 1.PNG'],['pages','BOOKS 2.PNG'],['pages','BOOKS 3.PNG'],
    ['toggle-night','OFFICE LAMP.PNG'],['photos','IPAD.PNG'],['photos','RUG.PNG'],
    ['about','MIFFY.PNG'],['toggle-night','BAMBI LAMP.PNG'],['about','SONNY ANGEL.PNG'],
    ['latte','BRETZEL.PNG'],
    ['about','RILAKKUMA.PNG'],
    ['contact','GUITARE.PNG']
  ];
  const targets = definitions.map(([action, file]) => ({
    file, action, target: action==='toggle-night' ? document.getElementById('theme-toggle') : file==='INSTAX.PNG' ? document.getElementById('instax-hotspot') : svg.querySelector('[data-open="'+action+'"]')
  })).filter(item => item.target);
  const cd = svg.querySelector('[data-mv-open]');
  if (cd) targets.push({file:'CDS.PNG',target:cd});
  const ring = [...svg.querySelectorAll('[data-open="photos"]')]
    .find(el => el.getAttribute('aria-label')?.toLowerCase().includes('ring light'));
  if (ring) targets.push({file:'RING LIGHT.PNG',target:ring});
  const cat = svg.querySelector('[data-cat-pet]');
  if (cat) targets.push({file:'CAT.PNG',target:cat});
  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d', {willReadFrequently:true});
  for (const item of targets) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      if (!ctx) return;
      ctx.drawImage(img,0,0);
      try {
        item.alpha = ctx.getImageData(0,0,canvas.width,canvas.height).data;
        item.width = canvas.width;
        item.height = canvas.height;
      } catch(e) { /* preserve old polygon if pixels are unavailable */ }
    };
    img.src = 'assets/'+encodeURIComponent(item.file);
  }
  const image = document.getElementById('room-img');
  function point(event) {
    const r = image?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return null;
    const x = (event.clientX-r.left)/r.width;
    const y = (event.clientY-r.top)/r.height;
    return x>=0 && x<1 && y>=0 && y<1 ? {x,y} : null;
  }
  function hit(item,p) {
    const x = Math.floor(p.x*item.width), y = Math.floor(p.y*item.height);
    if(item.alpha[(y*item.width+x)*4+3]>25)return true;
    // Line-art PNGs have transparent interiors: test enclosed regions via a cached flood fill.
    if(!item.filled){
      const w=item.width,h=item.height,a=item.alpha;
      const solid=new Uint8Array(w*h);
      for(let yy=2;yy<h-2;yy++)for(let xx=2;xx<w-2;xx++){
        const i=yy*w+xx;if(a[i*4+3]>25)
          for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)solid[i+dy*w+dx]=1;
      }
      const outside=new Uint8Array(w*h),q=new Int32Array(w*h);let head=0,tail=0;
      function add(i){if(!solid[i]&&!outside[i]){outside[i]=1;q[tail++]=i;}}
      for(let xx=0;xx<w;xx++){add(xx);add((h-1)*w+xx);}
      for(let yy=0;yy<h;yy++){add(yy*w);add(yy*w+w-1);}
      while(head<tail){const i=q[head++],xx=i%w;if(xx)add(i-1);if(xx<w-1)add(i+1);if(i>=w)add(i-w);if(i<(h-1)*w)add(i+w);}
      item.filled=outside;
    }
    return item.filled[y*item.width+x]===0;
  }
  let forwarding = false;
  scene.addEventListener('click',event => {
    if (forwarding || !event.isTrusted || !event.clientX && !event.clientY) return;
    const p = point(event);
    if (!p) return;
    const ready = targets.filter(item => item.alpha);
    if (!ready.length) return;
    const matched = [...ready].reverse().find(item => hit(item,p));
    const original = event.target.closest?.('#hotspots polygon');
    if (matched) {
      if (original === matched.target && original.getAttribute('data-open')===matched.action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      forwarding = true;
      try {
        if(matched.action==='toggle-night'){
          document.getElementById('theme-toggle')?.click();
        } else if(matched.action && matched.target.getAttribute('data-open')!==matched.action){
          const button=document.createElement('button');button.dataset.open=matched.action;button.hidden=true;
          document.body.appendChild(button);button.click();button.remove();
        } else matched.target.click();
      } finally { forwarding = false; }
    } else if (original && ready.some(item => item.target === original)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);
})();
