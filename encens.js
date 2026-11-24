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
  canvas.style.imageRendering='auto';
  const accelerated=document.createElement('canvas');
  let renderer;
  try{renderer=smokeRenderer(accelerated);}catch(error){console.warn(error);}
  if(renderer){place(accelerated,0,0,width,height);canvas.style.display='none';}
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
    const a=curve[i],b=curve[i+1]??a,q=t-i;
    const m=i>0?(b-curve[i-1])*.5:0;
    const n=i+2<curve.length?(curve[i+2]-a)*.5:0;
    return a+(b-a)*ease(q)+q*(1-q)*(m*(1-q)-n*q);
  }
  // Coordinates along and across each hand-drawn branch's curved centre line.
  function coordinates(branch,x,y) {
    const [vx,vy]=branch.axis,dx=x-branch.anchor[0],dy=y-branch.anchor[1];
    const along=dx*vx+dy*vy;
    return [along,dy*vx-dx*vy-offset(branch.curve,along/branch.length)];
  }
  const turns={"7955":[[1181,1169],[1667,1002],[693,1042],[1206,866]],"7956":[[1479,924],[1766,816],[1599,892]],"7957":[[829,823],[385,813],[781,674],[218,754]],"7958":[[272,1068],[149,825],[312,919]],"7959":[[327,1358],[544,1271],[880,1144],[717,1178]],"7960":[[1305,1249],[1592,1320],[1836,1293],[1123,1257]],"7961":[[2258,543],[1979,617],[2084,630],[1879,620]],"7962":[[2742,1186],[2325,1416],[2035,1394],[2533,1284]],"7963":[[2958,1631],[2607,1516],[2447,1484],[2745,1510]],"7964":[[2562,1108],[2950,1142]],"7965":[[2189,1365],[2508,1079],[2330,1262]],"7966":[[2441,1039],[1963,1108],[2138,1073]],"7967":[[1974,746],[1746,1148]],"7968":[[2733,555],[1593,467],[2554,699],[1606,653]],"7969":[[2729,193],[2381,310],[2620,378],[2291,259]],"7970":[[2311,394],[2047,258],[2059,376]],"7971":[[2128,160],[2332,38]],"7972":[[2252,901],[2978,1024],[2825,985],[2701,814]],"7973":[[2811,708],[2554,805],[2681,786],[2450,768]],"7974":[[1509,233],[1900,84],[1683,172],[1646,298]],"7975":[[1180,195],[1271,152],[1090,178]],"7976":[[1378,405],[1110,301],[819,359]],"7977":[[533,353],[368,412],[229,431],[347,633]],"7978":[[726,276],[283,188],[565,207]],"7979":[[959,289],[1012,103],[1078,112],[914,178]],"7980":[[766,558],[1110,545],[620,442],[428,450]],"7981":[[627,1521],[1073,1677],[857,1542],[1007,1469]],"7982":[[230,1372],[161,1595],[467,1450]],"7983":[[1741,1383],[1823,1398]],"7984":[[1899,1383],[1960,1376]]};
  // Coordinates on each drawing, measured along and across its centre line.
  const bends={
    7980:[[511,-82]],7977:[[65,-16]],7957:[[24,113],[431,99]],
    7966:[[332,-77],[108,-147]],7964:[[368,-19],[624,-17]],7965:[[235,-66]],
    7960:[[775,178]],7981:[[349,125]],7962:[[703,-106]],7973:[[139,-26]],
    7968:[[170,-373],[27,-216]],7967:[[333,-26]],7956:[[11,-3]],
    7955:[[-45,-146],[816,-249],[1269,-133]],7959:[[181,153]],
    7958:[[101,-161],[118,29]],7961:[[170,-158],[22,-104]]
  };
  function softenBends(b,ring){
    const centers=bends[b.id];
    if(!centers||ring.length<8)return ring;
    const n=ring.length/2;
    return ring.map((v,k)=>{
      const i=k>>1,axis=k%2,x=ring[2*i],y=ring[2*i+1];
      const [u,h]=coordinates(b,x/2,y/2);
      const distance=Math.min(...centers.map(([a,c])=>Math.hypot(u-a,h-c)));
      const strength=ease(clamp(1-distance/150));
      if(!strength)return v;
      // Average equal arc lengths on either side. Both edges of the ink bend together.
      function sample(sign,reach){
        let j=i;
        for(let step=1;step<n;step++){
          const next=(j+sign+n)%n;
          const len=Math.hypot(ring[2*j]-ring[2*next],ring[2*j+1]-ring[2*next+1]);
          if(len>=reach)return ring[2*j+axis]+(ring[2*next+axis]-ring[2*j+axis])*reach/len;
          reach-=len;j=next;
        }
        return v;
      }
      return v+strength*((sample(1,36)+sample(-1,36)+sample(1,18)+sample(-1,18))/4-v)*.82;
    });
  }
  function prepare(branch) {
    branch.turns=turns[branch.id].map(([x,y],i)=>({at:coordinates(branch,x,y),radius:Math.min(100,Math.max(28,branch.length*.16)),speed:.78+((branch.id*13+i*19)%37)/42,phase:branch.id*1.7+i*2.4}));
    for(const key of ['fill','ink']){
      branch[key]=branch[key].map(ring=>{
        ring=softenBends(branch,ring);
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
    const contactWeight=b.contact?ease(clamp(1-Math.hypot(along-b.contact.at[0],across-b.contact.at[1])/b.contact.radius)):0;
    return {along,across,turn:best,weight:weight*pin,contactWeight};
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
    const lateral=offset(b.curve,u)+across*(1+1.05*b.mature)*(1-.30*b.dissolve)+drift;
    const [vx,vy]=b.axis;
    let x=b.x+vx*advance-vy*lateral,y=b.y+vy*advance+vx*lateral-b.rise*clamp(Math.abs(u)*2);
    if(b.contact && pt.contactWeight){
      x+=pt.contactWeight*b.contact.dx;y+=pt.contactWeight*b.contact.dy;
    }
    return [x,y];
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
  function outline(b,rings){
    const path=new Path2D();
    for(const ring of rings){
      const xy=ring.map(p=>pose(b,p));
      for(const [x,y] of xy){
        b.left=Math.min(b.left,x);b.right=Math.max(b.right,x);
        b.top=Math.min(b.top,y);b.bottom=Math.max(b.bottom,y);
      }
      for(let i=0;i<xy.length;i++){
        const prev=xy[(i+xy.length-1)%xy.length], p=xy[i], next=xy[(i+1)%xy.length];
        // Limit the rounding distance on long segments to retain fine drawn tips.
        const before=Math.min(.5,6/(Math.hypot(prev[0]-p[0],prev[1]-p[1])||1));
        const after=Math.min(.5,6/(Math.hypot(next[0]-p[0],next[1]-p[1])||1));
        const x=p[0]+before*(prev[0]-p[0]),y=p[1]+before*(prev[1]-p[1]);
        if(i===0)path.moveTo(x,y);else path.lineTo(x,y);
        path.quadraticCurveTo(p[0],p[1],p[0]+after*(next[0]-p[0]),p[1]+after*(next[1]-p[1]));
      }
      path.closePath();
    }
    return path;
  }
  // Composite just the ink in a reusable tile. Remove ink wherever another
  // visible wisp already occupies that space, including during its reveal.
  const tile=document.createElement('canvas'),pen=tile.getContext('2d');
  function smokeRenderer(target){
    const gl=target.getContext('webgl',{alpha:true,antialias:false,stencil:true,depth:false,premultipliedAlpha:true});
    if(!gl||!gl.getContextAttributes().stencil)return null;
    const program=gl.createProgram();
    function shader(type,source){
      const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));
      gl.attachShader(program,sh);gl.deleteShader(sh);
    }
    shader(gl.VERTEX_SHADER,`attribute vec2 position,uv;varying vec2 tex;
      uniform vec4 transform;
      void main(){tex=uv;vec2 p=position*transform.xy+transform.zw;
      gl_Position=vec4(p*vec2(2./3072.,-2./1732.)+vec2(-1.,1.),0.,1.);}`);
    const derivatives=!!gl.getExtension('OES_standard_derivatives');
    shader(gl.FRAGMENT_SHADER,`${derivatives?'#extension GL_OES_standard_derivatives : enable':''}
      precision highp float;varying vec2 tex;
      uniform sampler2D art,flow;uniform float age,opacity;uniform int pass;
      void main(){
        vec3 a=texture2D(art,tex).rgb;
        float arrive=texture2D(flow,tex).r;
        float front=age*252./255.-arrive;
        float edge=${derivatives?'max(.0003,fwidth(front))':'.003'};
        float reveal=age>=1.?1.:smoothstep(-.5*edge,.5*edge,front);
        float fill=a.r*reveal;
        float ink=max(a.g*reveal,age<1.?a.r*(1.-smoothstep(.0,edge,abs(front))):0.);
        if(pass==1){if(fill*opacity<.5)discard;gl_FragColor=vec4(0.);return;}
        vec3 beige=vec3(1.,.9647,.8824),red=vec3(1.,0.,.118);
        float f=fill*.89*opacity,i=ink*opacity;
        // With one occupied silhouette, only the ink belonging to that
        // silhouette is visible. Outside all silhouettes, keep free tips.
        if(pass==5 && fill*opacity<.5)discard;
        if(pass==2||pass==5){i*=a.b;gl_FragColor=vec4(red*i,i);return;}
        if(pass==0){i*=1.-a.b;gl_FragColor=vec4(beige*f*(1.-i)+red*i,f*(1.-i)+i);return;}
        gl_FragColor=vec4(beige*f*(1.-i)+vec3(.914,.541,.533)*i,f*(1.-i)+i);
      }`);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const position=gl.getAttribLocation(program,'position'),uv=gl.getAttribLocation(program,'uv');
    gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(uv);
    const u={};for(const key of ['transform','age','opacity','pass','art','flow'])u[key]=gl.getUniformLocation(program,key);
    gl.uniform1i(u.art,0);gl.uniform1i(u.flow,1);
    function texture(format,w,h,data){
      const id=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,id);
      for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);
      for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
      gl.texImage2D(gl.TEXTURE_2D,0,format,w,h,0,format,gl.UNSIGNED_BYTE,data);return id;
    }
    function buffer(type,data,usage){
      const buf=gl.createBuffer();gl.bindBuffer(type,buf);gl.bufferData(type,data,usage);return buf;
    }
    function prepareSprite(b){
      // Rasterize the smoothed original outlines at their native resolution once.
      [b.x,b.y]=b.anchor;b.mature=b.wave=b.phase=b.rise=b.dissolve=0;
      for(const t of b.turns)t.twist=0;
      b.left=b.top=Infinity;b.right=b.bottom=-Infinity;
      const fill=outline(b,b.fill),ink=outline(b,b.ink);
      const f=b.flow||{x:Math.floor(b.left)-4,y:Math.floor(b.top)-4,
        w:Math.ceil((b.right-b.left+12)/4),h:Math.ceil((b.bottom-b.top+12)/4)};
      const w=f.w*4,h=f.h*4,x=f.x-2,y=f.y-2;
      const c=document.createElement('canvas');c.width=w;c.height=h;
      const p=c.getContext('2d',{willReadFrequently:true});p.translate(-x,-y);
      p.fill(fill,'evenodd');const pixels=p.getImageData(0,0,w,h).data;
      p.clearRect(x,y,w,h);p.fill(ink,'evenodd');
      const lines=p.getImageData(0,0,w,h).data;
      // Composite each drawing in its own stacking order. Only the small
      // mouths connecting two wisps need the shared-outline stencil.
      p.clearRect(x,y,w,h);
      const mouths=branches.filter(child=>child.upstream===b).map(child=>insetJoins[child.id]||child.join);
      if(b.upstream)mouths.push(b.anchor);
      if(b.contact)mouths.push(b.contact.from);
      for(const child of branches)if(child.contact?.other===b)mouths.push(child.contact.to);
      for(const [cx,cy] of mouths){
        const ramp=p.createRadialGradient(cx,cy,18,cx,cy,48);
        ramp.addColorStop(0,'black');ramp.addColorStop(1,'transparent');
        p.fillStyle=ramp;p.fillRect(cx-48,cy-48,96,96);
      }
      const joints=p.getImageData(0,0,w,h).data;
      for(let j=0;j<pixels.length;j+=4){
        pixels[j]=pixels[j+3];pixels[j+1]=lines[j+3];pixels[j+2]=joints[j+3];pixels[j+3]=255;
      }
      const art=texture(gl.RGBA,w,h,pixels);
      const flow=texture(gl.LUMINANCE,f.values?f.w:1,f.values?f.h:1,f.values?Uint8Array.from(f.values,Math.round):new Uint8Array(1));
      const nx=Math.ceil(w/16),ny=Math.ceil(h/16),points=[],uvs=[],indices=[];
      for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
        const a=i/nx,d=j/ny;uvs.push(a,d);
        points.push(point(b,...coordinates(b,x+w*a,y+h*d)));
        if(i<nx&&j<ny){const k=j*(nx+1)+i;indices.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}
      }
      const coords=new Float32Array(uvs.length);
      b.sprite={art,flow,points,coords,pos:buffer(gl.ARRAY_BUFFER,coords,gl.DYNAMIC_DRAW),
        uv:buffer(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW),
        indices:buffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW),count:indices.length};
    }
    function render(list){
      const active=list.filter(b=>b.age>0&&b.dissolve<1);
      gl.viewport(0,0,target.width,target.height);gl.stencilMask(255);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
      for(const b of active){
        const s=b.sprite;
        for(let i=0;i<s.points.length;i++){const xy=pose(b,s.points[i]);s.coords[2*i]=xy[0];s.coords[2*i+1]=xy[1];}
        gl.bindBuffer(gl.ARRAY_BUFFER,s.pos);gl.bufferSubData(gl.ARRAY_BUFFER,0,s.coords);
      }
      gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      for(const pass of [4,3,0,1,2,5]){
        gl.uniform1i(u.pass,pass);
        if(pass===1){
          gl.enable(gl.STENCIL_TEST);gl.colorMask(false,false,false,false);
          gl.stencilFunc(gl.ALWAYS,0,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
        }
        if(pass===2||pass===5){
          gl.colorMask(true,true,true,true);gl.stencilFunc(gl.EQUAL,pass===2?0:1,255);
          gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
        }
        for(const b of active){
          const depth=pass===4?2:pass===3?1:0;
          const swell=depth?ease(clamp((b.age-1.05-depth*.26)*b.duration/4.5)):1;
          if(depth&&(!b.upstream||!swell))continue;
          const sx=depth?swell*(depth===1?.25:.46):0,sy=depth?swell*(depth===1?.34:.53):0;
          gl.uniform4f(u.transform,1+sx,1+sy,depth?swell*(depth===1?-65:65)-sx*b.x:0,
            depth?swell*(depth===1?-150:195)-sy*b.y:0);
          gl.uniform1f(u.age,b.age);gl.uniform1f(u.opacity,(1-b.dissolve)*swell*(depth?.73:1));
          const s=b.sprite;
          gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,s.art);
          gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,s.flow);
          gl.bindBuffer(gl.ARRAY_BUFFER,s.pos);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ARRAY_BUFFER,s.uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,s.indices);gl.drawElements(gl.TRIANGLES,s.count,gl.UNSIGNED_SHORT,0);
        }
      }
      gl.disable(gl.STENCIL_TEST);
    }
    return {prepareSprite,render};
  }

  function paintJoinedOutline(b){
    const scale=canvas.width/width;
    const x=Math.floor(b.left-4),y=Math.floor(b.top-4);
    const w=Math.ceil((b.right+4-x)*scale),h=Math.ceil((b.bottom+4-y)*scale);
    if(tile.width<w)tile.width=w;
    if(tile.height<h)tile.height=h;
    pen.setTransform(1,0,0,1,0,0);pen.clearRect(0,0,w,h);
    pen.setTransform(scale,0,0,scale,-x*scale,-y*scale);
    pen.save();
    if(b.boundary)pen.clip(b.boundary,'evenodd');
    pen.fillStyle=pen.strokeStyle='#ff001e';pen.lineJoin='round';pen.lineWidth=1.35;
    pen.stroke(b.fillPath);pen.fill(b.inkPath,'evenodd');pen.restore();
    if(b.boundary){
      pen.save();pen.clip(b.fillPath,'evenodd');pen.strokeStyle='#ff001e';pen.lineWidth=1.35;pen.lineJoin='round';pen.stroke(b.boundary);pen.restore();
    }
    pen.globalCompositeOperation='destination-out';
    for(const other of branches){
      if(other===b||other.age<=0||other.dissolve>=1||
         other.right<x||other.left>b.right+4||other.bottom<y||other.top>b.bottom+4)continue;
      pen.save();
      if(other.boundary)pen.clip(other.boundary,'evenodd');
      pen.globalAlpha=1-other.dissolve;pen.fill(other.fillPath,'evenodd');pen.restore();
    }
    pen.globalCompositeOperation='source-over';
    ctx.drawImage(tile,0,0,w,h,x,y,w/scale,h/scale);
  }
  function paintBranch(b,opacity,depth){
      const boundary=b.boundary;
      if(boundary){ctx.save();ctx.clip(boundary,'evenodd');}
      ctx.globalAlpha=opacity*(1-b.dissolve);
      ctx.fillStyle='rgba(255,246,225,.89)';ctx.fill(b.fillPath,'evenodd');
      if(depth){
        ctx.fillStyle=ctx.strokeStyle='#e98a88';ctx.lineWidth=1.35;
        ctx.stroke(b.fillPath);ctx.fill(b.inkPath,'evenodd');
      }
      if(boundary)ctx.restore();
  }
  let branches=[],sequence=null,frame=0,lastPaint=-Infinity,cycleEnd=0;
  let visible=true;
  function draw(now) {
    const elapsed=sequence===null?0:(now-sequence)/1000;
    const clearing=elapsed-cycleEnd-5.2;
    const time=reduced.matches?0:now/1000;
    const rect=scene.getBoundingClientRect();
    const w=Math.min(4096,Math.round(rect.width*Math.max(1.5,devicePixelRatio||1)));
    if (!w) return;
    if(renderer){
      if(accelerated.width!==w){accelerated.width=w;accelerated.height=Math.round(w*height/width);}
    }else if(canvas.width!==w){canvas.width=w;canvas.height=Math.round(w*height/width);}
    if(!renderer){ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);ctx.clearRect(0,0,width,height);}
    for(const b of branches){
      const root=!b.upstream;
      b.age=root?1:Math.max(0,(elapsed-b.delay)/b.duration);
      b.growth=root?1:ease(clamp(b.age));
      b.mature=root||reduced.matches?0:1-Math.exp(-Math.max(0,b.age-1)*b.duration/5);
      b.dissolve=root?0:ease(clamp((clearing-b.release)/b.linger));
      b.rise=reduced.matches?0:b.dissolve*(18+b.length*.052);
      b.phase=time*(.73+(b.id%9)*.069)+b.id*.61;
      for(const turn of b.turns)turn.twist=reduced.matches?0:(.36*Math.sin(time*turn.speed*.85+turn.phase)+.19*Math.sin(time*turn.speed*.48+turn.phase*2.7));
      b.wave=reduced.matches?0:Math.min(root?2:13,b.length*.045);
      if(root){[b.x,b.y]=b.anchor;}
      else {
        const parent=b.upstream;
        // The first large branches grow from the moving ends of the idle tendrils.
        const f=parent.upstream?0:1-b.growth;
        const along=b.joinLocal[0]*(1-f)+parent.length*f;
        const across=b.joinLocal[1]*(1-f);
        [b.x,b.y]=pose(parent,point(parent,along,across));
        // Keep the open mouth on the moving parent, including during local twisting.
        const origin=pose(b,point(b,0,0));
        b.x+=b.x-origin[0];b.y+=b.y-origin[1];
      }
    }
    // Both endpoints are sampled in the same frame. Blend the correction over
    // the length of the incoming tendril so the curl stays attached as it moves.
    for(const b of branches){
      const c=b.contact;if(!c)continue;
      c.dx=0;c.dy=0;
      const weight=ease(clamp((Math.min(b.age,c.other.age)-.72)/.28))*(1-c.other.dissolve);
      if(!weight)continue;
      const source=pose(b,c.source),dest=pose(c.other,c.dest);
      c.dx=(dest[0]-source[0])*weight;c.dy=(dest[1]-source[1])*weight;
    }
    for(const b of branches){
      if(b.age<=0||b.dissolve===1)continue;
      if(renderer)continue;
      b.left=b.top=Infinity;b.right=b.bottom=-Infinity;
      b.fillPath=outline(b,b.fill);b.inkPath=outline(b,b.ink);
      b.boundary=b.flow&&b.age<1?growthBoundary(b):null;
    }
    if(renderer){
      renderer.render(branches);
      if(sequence!==null&&clearing>=8)sequence=null;
      return;
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
    for(const b of branches){
      if(b.age<=0||b.dissolve>=1)continue;
      ctx.globalAlpha=1-b.dissolve;paintJoinedOutline(b);
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
  observer.observe(renderer?accelerated:canvas);
  document.addEventListener('visibilitychange',wake);
  new ResizeObserver(wake).observe(scene);
  const insetJoins={"7966": [1878, 1240], "7967": [1726, 1224], "7965": [2166, 1372], "7964": [2257, 1116], "7968": [1971, 739], "7961": [1979, 729], "7963": [2661, 1367], "7959": [942, 1352], "7956": [1826, 892], "7955": [1589, 912], "7970": [2022, 411], "7974": [1700, 381], "7976": [1644, 382], "7981": [603, 1374], "7973": [2557, 709], "7982": [575, 1484], "7969": [2615, 351], "7972": [2484, 1031], "7980": [1218, 566], "7975": [1414, 180], "7957": [729, 832], "7971": [2111, 162], "7979": [998, 276], "7958": [437, 931], "7978": [912, 293], "7977": [256, 719]};
  accelerated.addEventListener('webglcontextlost',()=>{
    renderer=null;accelerated.style.display='none';canvas.style.display='';
    observer.disconnect();observer.observe(canvas);wake();
  });
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
        if(b.upstream)b.joinLocal=coordinates(b.upstream,...(insetJoins[b.id]||b.join));
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
      const contacts=[
        [7961,[2286,526],7968,[2290,534],230],
        [7962,[2758,1174],7964,[2758,1180],275],
        [7965,[2525,1085],7966,[2506,1061],195],
        [7966,[2519,1042],7964,[2536,1108],200],
        [7973,[2722,848],7972,[2727,832],150]
      ];
      for(const [id,from,parent,to,radius] of contacts){
        const b=byId.get(id),other=byId.get(parent),at=coordinates(b,...from);
        b.contact={from,to,at,other,radius,dx:0,dy:0,source:point(b,...at),dest:point(other,...coordinates(other,...to))};
        for(const rings of [b.fill,b.ink])for(const ring of rings)for(const p of ring)
          p.contactWeight=ease(clamp(1-Math.hypot(p.along-at[0],p.across-at[1])/radius));
      }
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
      if(renderer){
        try{branches.forEach(renderer.prepareSprite);}catch(error){
          console.warn(error);renderer=null;accelerated.style.display='none';canvas.style.display='';
          observer.disconnect();observer.observe(canvas);
        }
      }
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

