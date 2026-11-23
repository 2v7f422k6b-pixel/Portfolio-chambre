(() => {
  if (new URLSearchParams(location.search).get('chambreV2') !== '1') return;
  const scene = document.querySelector('#play-scene');
  if (!scene) return;
  const assets = 'assets/test-encens/';
  const layer = document.createElement('div');
  layer.dataset.roomV2Layer = 'encens';
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:90';
  function place(element, x, y, w, h) {
    Object.assign(element.style, {position:'absolute', left:x/3072*100+'%', top:y/1732*100+'%', width:w/3072*100+'%', height:h/1732*100+'%'});
    layer.append(element);
  }
  function picture(id,x,y,w,h) {
    const img = new Image();
    img.alt = '';
    img.src = assets + id + '.png';
    place(img,x,y,w,h);
    return img;
  }
  picture(7954,1833,1406,60,40);
  const idle = [picture(7983,1701,1366,168,58),picture(7984,1860,1363,139,64)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  idle.forEach((img,i) => {
    img.style.transformOrigin = i ? 'left bottom' : 'right bottom';
    if (!reduce.matches) img.animate([{transform:'rotate(-2deg)'},{transform:'rotate(2deg)'}], {duration:1900+i*400,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});
  });
  const canvas = document.createElement('canvas');
  place(canvas,0,0,3072,1732);
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label','Encens · Incense');
  button.style.cssText='pointer-events:auto;background:transparent;border:0;cursor:pointer;min-height:44px;padding:0';
  place(button,1695,1345,315,120);
  scene.append(layer);
  let ready, busy=false;
  async function renderer() {
    const images = await Promise.all(['smoke.webp','arrival.png'].map(async name => {
      const img = new Image(); img.src=assets+name; await img.decode(); return img;
    }));
    const gl=canvas.getContext('webgl',{premultipliedAlpha:false,antialias:false});
    if (!gl) {
      const ctx=canvas.getContext('2d');
      canvas.width=images[0].width; canvas.height=images[0].height;
      return progress => { ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=progress;ctx.drawImage(images[0],0,0); };
    }
    const program=gl.createProgram();
    function attach(type,source) {
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);
    }
    attach(gl.VERTEX_SHADER,'attribute vec2 pos; varying vec2 uv;void main(){uv=vec2(pos.x*.5+.5,.5-pos.y*.5);gl_Position=vec4(pos,0.,1.);}');
    attach(gl.FRAGMENT_SHADER,`precision mediump float;
      varying vec2 uv; uniform sampler2D ink,arrival; uniform float progress,clock,motion;
      void main(){
        float strength=smoothstep(.018,.2,distance(uv,vec2(.607,.819)))*motion;
        vec2 shift=vec2(.0016*sin(uv.y*27.+clock*1.35),.0035*sin(uv.x*21.-clock*1.2+uv.y*8.))*strength;
        vec2 sampleAt=uv+shift;
        vec4 c=texture2D(ink,sampleAt);
        float start=texture2D(arrival,sampleAt).r;
        c.a*=smoothstep(start,start+.04,progress*1.05);gl_FragColor=c;
      }`);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'pos');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    images.forEach((img,i)=>{
      gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
      for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
      for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      gl.uniform1i(gl.getUniformLocation(program,i?'arrival':'ink'),i);
    });
    const [progress,clock,motion]=['progress','clock','motion'].map(n=>gl.getUniformLocation(program,n));
    return (p,t)=>{
      const w=Math.min(1800,Math.max(1,Math.round(scene.clientWidth*devicePixelRatio)));
      if(canvas.width!==w){canvas.width=w;canvas.height=Math.round(w*1732/3072);}
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform1f(progress,p);gl.uniform1f(clock,t);gl.uniform1f(motion,reduce.matches?0:1);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    };
  }
  button.addEventListener('click',async event=>{
    event.stopPropagation();
    if(busy)return;
    busy=true;
    try {
      ready ||= renderer();const paint=await ready;
      const start=performance.now();canvas.hidden=false;
      function frame(now){
        const t=(now-start)/1000;
        const p=Math.max(0,Math.min(t/4,1,(9-t)/3));
        paint(p,t);
        idle.forEach(img=>img.style.opacity=String(Math.max(0,1-p*12)));
        if(t<9)requestAnimationFrame(frame);
        else {canvas.hidden=true;busy=false;}
      }
      requestAnimationFrame(frame);
    } catch(error){busy=false;ready=null;console.error('Encens',error);}
  });
})();
