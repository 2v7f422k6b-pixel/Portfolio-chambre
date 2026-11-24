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
    branch.extent=Math.max(branch.length,...branch.fill.map(ring=>Math.max(...ring.map(p=>Math.abs(p.along))))); 
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
    const u=along/b.length;
    const pin=ease(clamp(Math.abs(along)/65));
    const wave=pin*b.wave;
    const advance=along*(1+.16*b.mature)+wave*.62*Math.sin(5.1*u-b.phase*.81);
    const drift=wave*(Math.sin(u*5.2-b.phase)+.36*Math.sin(9*u-b.phase*.57));
    const lateral=offset(b.curve,u)+across*(1+1.05*b.mature)*(1-.83*b.dissolve)+drift;
    const [vx,vy]=b.axis;
    return [b.x+vx*advance-vy*lateral,b.y+vy*advance+vx*lateral-b.rise*clamp(Math.abs(u)*2)];
  }
  // Each texel records when smoke reaches this part of the drawing by travelling
  // inside its curls. The moving boundary is interpolated between texels.
  const flowTiles={"7962": [1848, 1156, 233, 81, 0], "7960": [896, 1184, 270, 70, 81], "7966": [1820, 1004, 181, 68, 151], "7967": [1664, 712, 86, 136, 219], "7965": [2136, 1052, 103, 87, 355], "7964": [2228, 1068, 189, 35, 442], "7968": [1188, 328, 455, 122, 477], "7961": [1844, 504, 116, 62, 599], "7963": [2412, 1324, 164, 89, 661], "7959": [84, 1112, 233, 78, 750], "7956": [1424, 768, 111, 48, 828], "7955": [280, 780, 360, 110, 876], "7970": [1936, 220, 110, 55, 986], "7974": [1384, 20, 190, 97, 1041], "7976": [776, 252, 224, 61, 1138], "7981": [468, 1352, 198, 90, 1199], "7973": [2424, 656, 138, 56, 1289], "7982": [24, 1352, 149, 68, 1345], "7969": [2256, 136, 168, 69, 1413], "7972": [2076, 784, 249, 68, 1482], "7980": [396, 388, 219, 61, 1550], "7975": [1056, 92, 101, 39, 1611], "7957": [176, 632, 215, 57, 1650], "7971": [2056, 8, 94, 44, 1707], "7979": [816, 64, 75, 65, 1751], "7958": [40, 768, 104, 82, 1816], "7978": [104, 84, 211, 72, 1898], "7977": [44, 328, 137, 106, 1970]};
  function readFlow(image,b){
    const [x,y,w,h,top]=flowTiles[b.id];
    const tile=document.createElement('canvas');
    tile.width=w;tile.height=h;
    const c=tile.getContext('2d');
    c.drawImage(image,0,top,w,h,0,0,w,h);
    const rgba=c.getImageData(0,0,w,h).data;
    // Smooth arrival times before extracting the outline. Keep the sentinel
    // border out of the filter so it cannot pull the front into little teeth.
    let values=Float32Array.from({length:w*h},(_,i)=>rgba[4*i]);
    for(let pass=0;pass<3;pass++){
      for(const horizontal of [true,false]){
        const next=new Float32Array(values.length);
        for(let j=1;j<h-1;j++)for(let i=1;i<w-1;i++){
          let sum=0;
          for(let k=-4;k<=4;k++){
            const col=horizontal?Math.max(1,Math.min(w-2,i+k)):i;
            const row=horizontal?j:Math.max(1,Math.min(h-2,j+k));
            sum+=values[row*w+col];
          }
          next[j*w+i]=sum/9;
        }
        values=next;
      }
    }
    for(let i=0;i<w;i++){values[i]=255;values[(h-1)*w+i]=255;}
    for(let j=0;j<h;j++){values[j*w]=255;values[j*w+w-1]=255;}
    return {x,y,w,h,values};
  }
  function growthBoundary(b){
    const {x,y,w,h,values}=b.flow;
    const level=252*b.age;
    const links=new Map(), locations=new Map();
    function cross(from,to){
      const key=2*from+(to-from===w?1:0);
      if(!locations.has(key)){
        const t=(level-values[from])/(values[to]-values[from]);
        const px=x+4*(from%w+(to===from+1?t:0));
        const py=y+4*(Math.floor(from/w)+(to===from+w?t:0));
        locations.set(key,pose(b,point(b,...coordinates(b,px,py))));
      }
      return key;
    }
    function connect(a,z){
      for(const [u,v] of [[a,z],[z,a]]){
        if(!links.has(u))links.set(u,[]);
        links.get(u).push(v);
      }
    }
    for(let j=0;j<h-1;j++)for(let i=0;i<w-1;i++){
      const k=j*w+i, a=values[k]<level,c=values[k+1]<level,
        d=values[k+w+1]<level,e=values[k+w]<level;
      if(a===c&&a===d&&a===e)continue;
      const edges=[];
      if(a!==c)edges.push(cross(k,k+1));
      if(c!==d)edges.push(cross(k+1,k+1+w));
      if(d!==e)edges.push(cross(k+w,k+w+1));
      if(e!==a)edges.push(cross(k,k+w));
      connect(edges[0],edges[1]);
      if(edges.length===4)connect(edges[2],edges[3]);
    }
    const path=new Path2D();
    for(const start of links.keys()){
      let key=start,previous=-1;
      const ring=[];
      do{
        const neighbors=links.get(key);
        const next=neighbors[0]===previous?neighbors[1]:neighbors[0];
        links.delete(key);previous=key;key=next;
        ring.push(locations.get(key));
      }while(key!==start);
      // A periodic quadratic spline keeps the advancing end rounded.
      const last=ring[ring.length-1],first=ring[0];
      path.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);
      for(let i=0;i<ring.length;i++){
        const a=ring[i],z=ring[(i+1)%ring.length];
        path.quadraticCurveTo(a[0],a[1],(a[0]+z[0])/2,(a[1]+z[1])/2);
      }
      path.closePath();
    }
    return path;
  }
  function traceRings(b,rings) {
    ctx.beginPath();
    for(const ring of rings){
      const start=pose(b,ring[0]);ctx.moveTo(start[0],start[1]);
      for(let i=1;i<ring.length;i++){const pt=pose(b,ring[i]);ctx.lineTo(pt[0],pt[1]);}
      ctx.closePath();
    }
  }
  function paintRings(b,rings,color){
    traceRings(b,rings);ctx.fillStyle=color;ctx.fill('evenodd');
  }
  function paintBranch(b,opacity,depth){
      const boundary=b.boundary;
      if(boundary){ctx.save();ctx.clip(boundary,'evenodd');}
      ctx.globalAlpha=opacity*(1-b.dissolve);
      paintRings(b,b.fill,'rgba(255,246,225,.89)');
      paintRings(b,b.ink,depth?'#e98a88':'#ff001e');
      if(boundary){
        ctx.restore();ctx.save();
        traceRings(b,b.fill);ctx.clip('evenodd');
        ctx.strokeStyle='#ff001e';ctx.lineWidth=2;ctx.lineJoin='round';
        ctx.stroke(boundary);ctx.restore();
      }
  }
  let branches=[],sequence=null,frame=0,lastPaint=-Infinity,cycleEnd=0;
  let visible=true;
  function draw(now) {
    const elapsed=sequence===null?0:(now-sequence)/1000;
    const clearing=elapsed-cycleEnd-5.2;
    const time=reduced.matches?0:now/1000;
    const rect=scene.getBoundingClientRect();
    const w=Math.min(2400,Math.round(rect.width*(devicePixelRatio||1)));
    if (!w) return;
    if(canvas.width!==w){canvas.width=w;canvas.height=Math.round(w*height/width);}
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);ctx.clearRect(0,0,width,height);
    for(const b of branches){
      const root=!b.upstream;
      b.age=root?1:Math.max(0,(elapsed-b.delay)/b.duration);
      b.growth=root?1:ease(clamp(b.age));
      b.mature=root||reduced.matches?0:1-Math.exp(-Math.max(0,b.age-1)*b.duration/5);
      b.dissolve=root?0:ease(clamp((clearing-b.release)/b.linger));
      b.rise=reduced.matches?0:b.dissolve*(18+b.length*.052);
      b.phase=time*(.73+(b.id%9)*.069)+b.id*.61;
      for(const turn of b.turns)turn.twist=reduced.matches?0:(.47*Math.sin(time*turn.speed+turn.phase)+.29*Math.sin(time*turn.speed*.53+turn.phase*2.7));
      b.wave=reduced.matches?0:Math.min(root?2:13,b.length*.045);
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
      if(b.age<=0||b.dissolve===1)continue;
      b.boundary=b.flow&&b.age<1?growthBoundary(b):null;
    }
    // A broad bank moves in behind the foreground curls as they mature.
    // Draw the farthest smoke first so the hand-drawn foreground stays legible.
    for(const depth of [2,1,0]){
      for(const b of branches){
        if(b.age<=0||b.dissolve===1)continue;
        const swell=depth?ease(clamp((b.age-1.05-depth*.26)*b.duration/4.5)):1;
        if(!swell)continue;
        ctx.save();
        if(depth){
          if(!b.upstream){ctx.restore();continue;}
          const direction=depth===1?-1:1;
          ctx.translate(b.x,b.y);
          ctx.translate(swell*direction*65,swell*(depth===1?-150:195));
          ctx.scale(1+swell*(depth===1?.25:.46),1+swell*(depth===1?.34:.53));
          ctx.translate(-b.x,-b.y);
        }
        paintBranch(b,swell*(depth?.73:1),depth);
        ctx.restore();
      }

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
    if(loading)return loading;
    const flowImage=new Image();
    flowImage.src=assets+'flow-times.png';
    return loading ||= Promise.all([flowImage.decode(),fetch(assets+'branches-v2.json').then(r=>{
      if(!r.ok)throw Error('Missing incense drawings');
      return r.json();
    })]).then(([,data])=>{
      const byId=new Map();
      branches=data.map(raw=>{
        const b=prepare(raw);b.upstream=byId.get(b.parent);
        if(b.upstream)b.flow=readFlow(flowImage,b);
        if(b.upstream)b.joinLocal=coordinates(b.upstream,...b.join);
        if(b.upstream?.flow){
          const {x,y,w,h,values}=b.upstream.flow;
          const i=Math.round(clamp((b.join[0]-x)/(4*(w-1)))*(w-1));
          const j=Math.round(clamp((b.join[1]-y)/(4*(h-1)))*(h-1));
          b.joinTime=values[j*w+i]/252;
        }
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
        const earliest=b=>Math.max(b.delay,b.upstream.upstream?b.upstream.delay+(.14+b.joinTime)*b.upstream.duration:0);
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

