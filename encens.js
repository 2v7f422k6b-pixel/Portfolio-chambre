(() => {
  if (new URLSearchParams(location.search).get('chambreV2') !== '1') return;
  const scene = document.querySelector('#play-scene');
  if (!scene) return;
  const assets = 'assets/test-encens/';
  const width = 3072, height = 1732;
  const layer = document.createElement('div');
  layer.dataset.roomV2Layer = 'encens';
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:90';
  function place(element,x,y,w,h) {
    Object.assign(element.style,{position:'absolute',left:x/width*100+'%',top:y/height*100+'%',width:w/width*100+'%',height:h/height*100+'%'});
    layer.append(element);
  }
  const bowl = new Image();
  bowl.alt = '';
  bowl.src = assets + '7954.png';
  place(bowl,1833,1406,60,40);
  const canvas = document.createElement('canvas');
  place(canvas,0,0,width,height);
  const ctx=canvas.getContext('2d');
  if (!ctx) return;
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label','Encens · Incense');
  button.style.cssText='pointer-events:auto;background:transparent;border:0;cursor:pointer;min-height:44px;padding:0';
  place(button,1695,1345,315,120);
  scene.append(layer);

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>x*x*(3-2*x);
  function offset(curve,u) {
    const t=clamp(u)*(curve.length-1),i=Math.floor(t);
    return curve[i]+((curve[i+1]??curve[i])-curve[i])*(t-i);
  }
  // Coordinates along and across each hand-drawn branch's curved centre line.
  function coordinates(branch,x,y) {
    const [vx,vy]=branch.axis,dx=x-branch.anchor[0],dy=y-branch.anchor[1];
    const along=dx*vx+dy*vy;
    return [along,dy*vx-dx*vy-offset(branch.curve,along/branch.length)];
  }
  function prepare(branch) {
    for(const key of ['fill','ink']){
      branch[key]=branch[key].map(ring=>{
        const local=[];
        for(let i=0;i<ring.length;i+=2)local.push(...coordinates(branch,ring[i]/2,ring[i+1]/2));
        return local;
      });
    }
    branch.duration=1.65+Math.min(2.2,branch.length/460);
    return branch;
  }
  function pose(b,along,across) {
    const p=b.growth;
    const advance=along*p;
    const u=advance/b.length;
    const curl=Math.sin(Math.PI*p)*Math.sin(u*3.1)*Math.min(40,b.length*.11);
    const drift=Math.min(1,Math.abs(u)*2)*b.wave*Math.sin(u*4.5+b.phase);
    const lateral=offset(b.curve,u)+across*p*(.22+.78*p)+curl+drift;
    const [vx,vy]=b.axis;
    return [b.x+vx*advance-vy*lateral,b.y+vy*advance+vx*lateral];
  }
  function paintRings(b,rings,color) {
    ctx.beginPath();
    for(const ring of rings){
      const start=pose(b,ring[0],ring[1]);ctx.moveTo(start[0],start[1]);
      for(let i=2;i<ring.length;i+=2){const pt=pose(b,ring[i],ring[i+1]);ctx.lineTo(pt[0],pt[1]);}
      ctx.closePath();
    }
    ctx.fillStyle=color;ctx.fill('evenodd');
  }
  let branches=[],sequence=null,frame=0,lastPaint=-Infinity,cycleEnd=0;
  let visible=true;
  function draw(now) {
    const elapsed=sequence===null?0:(now-sequence)/1000;
    const expansion=Math.max(0,Math.min(elapsed,cycleEnd,(cycleEnd+2.4+cycleEnd*.7-elapsed)/.7));
    const time=reduced.matches?0:now/1000;
    const rect=scene.getBoundingClientRect();
    const w=Math.min(2400,Math.round(rect.width*(devicePixelRatio||1)));
    if (!w) return;
    if(canvas.width!==w){canvas.width=w;canvas.height=Math.round(w*height/width);}
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);ctx.clearRect(0,0,width,height);
    for(const b of branches){
      const root=!b.upstream;
      b.growth=root?1:ease(clamp((expansion-b.delay)/b.duration));
      b.phase=time*1.35+b.id*.61;
      b.wave=reduced.matches?0:Math.min(root?3:8,b.length*.035);
      if(root){[b.x,b.y]=b.anchor;}
      else {
        const parent=b.upstream;
        // The first large branches grow from the moving ends of the idle tendrils.
        const f=parent.upstream?0:1-b.growth;
        const along=b.joinLocal[0]*(1-f)+parent.length*f;
        const across=b.joinLocal[1]*(1-f);
        [b.x,b.y]=pose(parent,along,across);
        b.x+=(b.anchor[0]-b.join[0])*b.growth;
        b.y+=(b.anchor[1]-b.join[1])*b.growth;
      }
      if(b.growth<=.002)continue;
      paintRings(b,b.fill,'rgba(255,246,225,.60)');
      paintRings(b,b.ink,'#ff001e');
    }
    if(sequence!==null && elapsed>=cycleEnd*1.7+2.4)sequence=null;
  }
  function tick(now) {
    frame=0;
    if(!visible||document.hidden||!branches.length)return;
    const interval=sequence===null?90:32;
    if(now-lastPaint>=interval){draw(now);lastPaint=now;}
    if(sequence!==null||!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame)frame=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();});
  observer.observe(canvas);
  document.addEventListener('visibilitychange',wake);
  new ResizeObserver(wake).observe(scene);
  let loading;
  function load() {
    return loading ||= fetch(assets+'branches-v2.json').then(r=>{
      if(!r.ok)throw Error('Missing incense drawings');
      return r.json();
    }).then(data=>{
      const byId=new Map();
      branches=data.map(raw=>{
        const b=prepare(raw);b.upstream=byId.get(b.parent);
        if(b.upstream)b.joinLocal=coordinates(b.upstream,...b.join);
        b.delay=b.upstream?Math.max(.22+b.start/315,b.upstream.upstream?b.upstream.delay+.38:0):0;
        if(b.upstream)cycleEnd=Math.max(cycleEnd,b.delay+b.duration);
        byId.set(b.id,b);return b;
      });
      wake();
    }).catch(error=>{loading=null;throw error;});
  }
  load().catch(console.error);
  button.addEventListener('click',async event=>{
    event.stopPropagation();
    await load();
    if(sequence===null){sequence=performance.now();wake();}
  });
})();
