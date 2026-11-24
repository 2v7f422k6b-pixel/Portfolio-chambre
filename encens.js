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
  const turns={"7955":[[1181,1169],[1667,1002],[693,1042],[1206,866]],"7956":[[1479,924],[1766,816],[1599,892]],"7957":[[829,823],[385,813],[781,674],[218,754]],"7958":[[272,1068],[149,825],[312,919]],"7959":[[327,1358],[544,1271],[880,1144],[717,1178]],"7960":[[1305,1249],[1592,1320],[1836,1293],[1123,1257]],"7961":[[2258,543],[1979,617],[2084,630],[1879,620]],"7962":[[2742,1186],[2325,1416],[2035,1394],[2533,1284]],"7963":[[2958,1631],[2607,1516],[2447,1484],[2745,1510]],"7964":[[2562,1108],[2950,1142]],"7965":[[2189,1365],[2508,1079],[2330,1262]],"7966":[[2441,1039],[1963,1108],[2138,1073]],"7967":[[1974,746],[1746,1148]],"7968":[[2733,555],[1593,467],[2554,699],[1606,653]],"7969":[[2729,193],[2381,310],[2620,378],[2291,259]],"7970":[[2311,394],[2047,258],[2059,376]],"7971":[[2128,160],[2332,38]],"7972":[[2252,901],[2978,1024],[2825,985],[2701,814]],"7973":[[2811,708],[2554,805],[2681,786],[2450,768]],"7974":[[1509,233],[1900,84],[1683,172],[1646,298]],"7975":[[1180,195],[1271,152],[1090,178]],"7976":[[1378,405],[1110,301],[819,359]],"7977":[[533,353],[368,412],[229,431],[347,633]],"7978":[[726,276],[283,188],[565,207]],"7979":[[959,289],[1012,103],[1078,112],[914,178]],"7980":[[766,558],[1110,545],[620,442],[428,450]],"7981":[[627,1521],[1073,1677],[857,1542],[1007,1469]],"7982":[[230,1372],[161,1595],[467,1450]],"7983":[[1741,1383],[1823,1398]],"7984":[[1899,1383],[1960,1376]]};
  function prepare(branch) {
    branch.turns=turns[branch.id].map(([x,y],i)=>({at:coordinates(branch,x,y),radius:Math.min(100,Math.max(28,branch.length*.16)),speed:.78+((branch.id*13+i*19)%37)/42,phase:branch.id*1.7+i*2.4}));
    for(const key of ['fill','ink']){
      branch[key]=branch[key].map(ring=>{
        const local=[];
        for(let i=0;i<ring.length;i+=2)local.push(...coordinates(branch,ring[i]/2,ring[i+1]/2));
        const points=[];
        for(let i=0;i<local.length;i+=2)points.push(point(branch,local[i],local[i+1]));
        return points;
      });
    }
    branch.duration=1.65+Math.min(2.2,branch.length/460);
    return branch;
  }
  function point(b,along,across) {
    let best=null,weight=0;
    for(const turn of b.turns){
      const dx=along-turn.at[0],dy=across-turn.at[1];
      const w=ease(clamp(1-Math.hypot(dx,dy)/turn.radius));
      if(w>weight){weight=w;best=turn;}
    }
    const pin=ease(clamp(Math.hypot(along,across)/32));
    return {along,across,turn:best,weight:weight*pin};
  }
  function pose(b,pt) {
    let {along,across,turn,weight}=pt;
    if(turn){
      const twist=turn.twist*weight;
      const dx=along-turn.at[0],dy=across-turn.at[1];
      along-=dy*twist;across+=dx*twist;
    }
    const p=b.growth;
    // The growth front stretches the tip first; width catches up downstream.
    const distance=Math.min(1.4,Math.abs(along)/b.length);
    const reach=p/(p+(1-p)*(.32+.9*distance));
    const advance=along*reach;
    const spread=ease(clamp((p-.27*distance)/(1-.27*distance)));
    const u=advance/b.length;
    const curl=Math.sin(Math.PI*p)*Math.sin(u*3.1)*Math.min(40,b.length*.11);
    const drift=Math.min(1,Math.abs(u)*2)*b.wave*Math.sin(u*4.5+b.phase);
    const lateral=offset(b.curve,u)+across*spread*(.1+.9*spread)*(1-.83*b.dissolve)+curl+drift;
    const [vx,vy]=b.axis;
    return [b.x+vx*advance-vy*lateral,b.y+vy*advance+vx*lateral-b.rise*clamp(Math.abs(u)*2)];
  }
  function paintRings(b,rings,color) {
    ctx.beginPath();
    for(const ring of rings){
      const start=pose(b,ring[0]);ctx.moveTo(start[0],start[1]);
      for(let i=1;i<ring.length;i++){const pt=pose(b,ring[i]);ctx.lineTo(pt[0],pt[1]);}
      ctx.closePath();
    }
    ctx.fillStyle=color;ctx.fill('evenodd');
  }
  let branches=[],sequence=null,frame=0,lastPaint=-Infinity,cycleEnd=0;
  let visible=true;
  function draw(now) {
    const elapsed=sequence===null?0:(now-sequence)/1000;
    const clearing=elapsed-cycleEnd-2.4;
    const time=reduced.matches?0:now/1000;
    const rect=scene.getBoundingClientRect();
    const w=Math.min(2400,Math.round(rect.width*(devicePixelRatio||1)));
    if (!w) return;
    if(canvas.width!==w){canvas.width=w;canvas.height=Math.round(w*height/width);}
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);ctx.clearRect(0,0,width,height);
    for(const b of branches){
      const root=!b.upstream;
      const age=clamp((elapsed-b.delay)/b.duration);
      const pulse=age+.095*Math.sin(2*Math.PI*age+b.id)*Math.sin(Math.PI*age);
      b.growth=root?1:ease(clamp(pulse));
      b.dissolve=root?0:ease(clamp((clearing-b.release)/b.linger));
      b.rise=reduced.matches?0:b.dissolve*(18+b.length*.052);
      b.phase=time*(.73+(b.id%9)*.069)+b.id*.61;
      for(const turn of b.turns)turn.twist=reduced.matches?0:(.47*Math.sin(time*turn.speed+turn.phase)+.29*Math.sin(time*turn.speed*.53+turn.phase*2.7));
      b.wave=reduced.matches?0:Math.min(root?2:2.6,b.length*.035);
      if(root){[b.x,b.y]=b.anchor;}
      else {
        const parent=b.upstream;
        // The first large branches grow from the moving ends of the idle tendrils.
        const f=parent.upstream?0:1-b.growth;
        const along=b.joinLocal[0]*(1-f)+parent.length*f;
        const across=b.joinLocal[1]*(1-f);
        [b.x,b.y]=pose(parent,point(parent,along,across));
        b.x+=(b.anchor[0]-b.join[0])*b.growth;
        b.y+=(b.anchor[1]-b.join[1])*b.growth;
      }
      if(b.growth<=.002||b.dissolve===1)continue;
      ctx.globalAlpha=1-b.dissolve;
      paintRings(b,b.fill,'rgba(255,246,225,.80)');
      paintRings(b,b.ink,'#ff001e');
    }
    ctx.globalAlpha=1;
    if(sequence!==null && clearing>=8)sequence=null;
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
      // Give each new offshoot its own beat, after its parent has begun to unfold.
      const pending=branches.filter(b=>b.upstream);
      const scheduled=new Set(branches.filter(b=>!b.upstream));
      let last=-.25;
      function variation(id){const n=Math.sin(id*91.37)*43758.53;return n-Math.floor(n);}
      while(pending.length){
        const eligible=pending.filter(b=>scheduled.has(b.upstream));
        const earliest=b=>Math.max(b.delay,b.upstream.upstream?b.upstream.delay+.38*b.upstream.duration:0);
        eligible.sort((a,b)=>earliest(a)-earliest(b));
        const b=eligible[0];
        const variationAtBranch=variation(b.id);
        b.delay=Math.max(earliest(b),last+.17+.85*variationAtBranch**2);
        b.duration*=.85+.48*variation(b.id+31);
        b.release=2.1*(1-clamp(b.start/2200))+1.2*variation(b.id+73);
        b.linger=2.8+1.6*variation(b.id+47);
        last=b.delay;scheduled.add(b);pending.splice(pending.indexOf(b),1);
      }
      cycleEnd=Math.max(...branches.map(b=>b.delay+b.duration));
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
