(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const W = 1536, H = 866;
  const key = 'nana-alice-murs-v1';
  const catalog = Object.entries({
    'soap-bubbles':'Bulles de savon','butterflies-grass':'Papillons dans l’herbe',
    kitchen:'Cuisine','cherry-blossom':'Fleurs de cerisier','butterfly-back':'Papillon de dos',
    lighter:'Portrait bleu',clown:'Clown','IMG_1458':'Château','still-life':'Nature morte',
    'marseille-emblem':'Marseille',bubblegum:'Bubblegum',closeup:'Gros plan',
    'snow-city':'Ville enneigée',motorbike:'Moto','synth-portrait':'Portrait au synthé'
  });
  const colors = [['Rose','#ff9acb'],['Jaune','#ffe58b'],['Bleu','#a6e4ff'],['Violet','#d4a7ff'],['Vert','#b9e6a0'],['Pêche','#ffb99d']];
  const starFile='assets/drawn-ui/etoile_mur.png';
  const fileFor = id => 'assets/previews/photos/'+id+'.webp';
  const allowed = new Set(catalog.map(([id])=>fileFor(id)));
  const fresh = () => ({version:1,items:[],images:[],templates:{}});
  let model=fresh(), mode='star', selected=-1, preview=false, scale=1, drag=null;
  const history=[];
  const item=()=>model.items[selected];
  const center=q=>q.reduce(([x,y],[a,b])=>[x+a/4,y+b/4],[0,0]);
  const validQuad=q=>Array.isArray(q)&&q.length===4&&q.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<10000))&&q.every(([x,y],i)=>{
    const [a,b]=q[(i+1)%4],[c,d]=q[(i+2)%4];
    return (a-x)*(d-b)-(b-y)*(c-a)>1;
  });
  function valid(m){
    if(m?.version!==1||!Array.isArray(m.items)||!Array.isArray(m.images)||!m.templates||typeof m.templates!=='object')return false;
    const ids=new Set();
    for(const im of m.images){
      if(!im||!/^import-[\w-]+$/.test(im.id)||ids.has(im.id)||typeof im.name!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(im.src))return false;
      ids.add(im.id);
    }
    return Object.values(m.templates).every(validQuad)&&m.items.every(o=>o&&validQuad(o.q)&&(o.kind==='star'?colors.some(c=>c[1]===o.color):o.kind==='poster'&&(allowed.has(o.src)||ids.has(o.src))));
  }
  function notify(s){$('status').textContent=s}
  try{const saved=localStorage.getItem(key);if(saved){const m=JSON.parse(saved);if(valid(m))model=m;}}catch{}
  function save(){
    try{localStorage.setItem(key,JSON.stringify(model));notify('Brouillon enregistré sur cet appareil')}
    catch{notify('Stockage local indisponible ou plein · exporte ton placement pour le conserver')}
  }
  function checkpoint(){
    // Records are replaced on edit. Imported image data can safely be shared by undo states.
    history.push({version:1,items:model.items.slice(),images:model.images.slice(),templates:{...model.templates}});
    if(history.length>60)history.shift();
  }
  function imageSrc(id){return model.images.find(im=>im.id===id)?.src||id}
  function posterMenu(){
    const prev=$('posters').value;
    $('posters').replaceChildren(...catalog.map(([id,name])=>new Option(name,fileFor(id))),...model.images.map(im=>new Option(im.name,im.id)));
    if([...$('posters').options].some(o=>o.value===prev))$('posters').value=prev;
    $('posterThumb').src=imageSrc($('posters').value);
  }
  colors.forEach(([label,value])=>$('color').add(new Option(label,value)));
  posterMenu();
  // Project the whole 100 × 100 image onto the four corners using one homography.
  function transform([[x0,y0],[x1,y1],[x2,y2],[x3,y3]]){
    const dx1=x1-x2,dx2=x3-x2,dy1=y1-y2,dy2=y3-y2;
    const dx3=x0-x1+x2-x3,dy3=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
    const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den;
    return 'matrix3d('+[(x1-x0+g*x1)/100,(y1-y0+g*y1)/100,0,g/100,(x3-x0+h*x3)/100,(y3-y0+h*y3)/100,0,h/100,0,0,1,0,x0,y0,0,1].join(',')+')';
  }
  function stylePiece(el,o){
    el.style.transform=transform(o.q);
    if(o.kind==='star'){
      const mask='url('+starFile+') center / 100% 100% no-repeat';
      el.style.webkitMask=mask;el.style.mask=mask;el.style.backgroundColor=o.color;el.style.opacity='.58';
    }else{el.style.backgroundImage='url("'+imageSrc(o.src)+'")'}
  }
  function pieces(){
    $('items').replaceChildren(...model.items.map(o=>{const el=document.createElement('div');el.className='piece';stylePiece(el,o);return el}));
  }
  function ui(){
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode&&!preview)));
    $('preview').setAttribute('aria-pressed',String(preview));$('preview').textContent=preview?'Reprendre l’édition':'Aperçu';
    $('sheet').classList.toggle('preview',preview);$('sheet').classList.toggle('pan',mode==='pan'||preview);
    $('starTools').hidden=mode!=='star'&&!(mode==='select'&&item()?.kind==='star');$('posterTools').hidden=mode!=='poster';
    for(const id of ['larger','smaller','remove'])$(id).disabled=preview||!item();
    $('undo').disabled=preview||!history.length;
    $('hint').textContent=preview?'Aperçu du placement.':({star:'Touche le mur pour poser une étoile. Les suivantes reprennent sa perspective sur ce mur.',poster:'Choisis une affiche, puis touche le mur pour la poser.',select:'Déplace le dessin ou tire une poignée pour régler un coin.',pan:'Fais glisser la vue après avoir zoomé.'})[mode];
    $('handles').replaceChildren();
    const q=item()?.q,show=q&&!preview&&mode!=='pan';$('outline').hidden=!show;
    $('outline').style.display=show?'block':'none';
    if(!show)return;
    $('outline').firstElementChild.setAttribute('points',q.map(([x,y])=>[x*scale,y*scale].join(',')).join(' '));
    const [cx,cy]=center(q);
    q.forEach(([x,y],i)=>{
      const dx=x-cx,dy=y-cy,len=Math.hypot(dx,dy)||1;
      const h=document.createElement('span');h.className='handle';h.dataset.corner=i;
      h.style.left=(x*scale+dx/len*13)+'px';h.style.top=(y*scale+dy/len*13)+'px';
      $('handles').append(h);
    });
  }
  function resize(){
    const vp=$('viewport');scale=Math.min(vp.clientWidth/W,vp.clientHeight/H)*Number($('zoom').value);
    $('sheet').style.width=W*scale+'px';$('sheet').style.height=H*scale+'px';$('scene').style.transform='scale('+scale+')';ui();
  }
  function wall(x){return x<585?'left':'right'}
  function remember(o){
    if(o?.kind!=='star')return;
    const [cx,cy]=center(o.q);model.templates[wall(cx)]=o.q.map(([x,y])=>[x-cx,y-cy]);
  }
  function setMode(m){preview=false;mode=m;ui()}
  function point(e){const r=$('sheet').getBoundingClientRect();return [(e.clientX-r.left)/scale,(e.clientY-r.top)/scale]}
  function contains(q,[x,y]){
    return q.every(([a,b],i)=>{const [c,d]=q[(i+1)%4];return (c-a)*(y-b)-(d-b)*(x-a)>=0});
  }
  function add(p){
    const [x,y]=p, star=mode==='star',img=$('posterThumb');
    const w=star?10:84,h=star?10:w*(img.naturalHeight/Math.max(1,img.naturalWidth)||1.3);
    const offsets=(star&&model.templates[wall(x)])||[[-w,-h],[w,-h],[w,h],[-w,h]];
    const q=offsets.map(([a,b])=>[a+x,b+y]);
    checkpoint();model.items.push(star?{kind:'star',q,color:$('color').value}:{kind:'poster',q,src:$('posters').value});
    selected=model.items.length-1;pieces();ui();save();
  }
  const sheet=$('sheet');
  sheet.onpointerdown=e=>{
    if(preview||mode==='pan'||drag||e.button!==0)return;
    const p=point(e),corner=e.target.closest('[data-corner]');
    const hit=model.items.findLastIndex(o=>contains(o.q,p));
    let action='add';
    if(corner)action='corner';
    else if(mode==='select'||hit===selected&&selected>=0){
      selected=hit;if(hit<0){ui();return}action='move';
      if(item().kind==='star'&&mode==='select')$('color').value=item().color;
    }
    sheet.setPointerCapture(e.pointerId);
    drag={id:e.pointerId,p,action,index:corner?Number(corner.dataset.corner):-1,q:item()?.q,changed:false};ui();
  };
  sheet.onpointermove=e=>{
    if(!drag||drag.id!==e.pointerId||drag.action==='add')return;
    const [x,y]=point(e),dx=x-drag.p[0],dy=y-drag.p[1];
    if(!drag.changed&&Math.hypot(dx,dy)*scale<2)return;
    const q=drag.q.map(([a,b],i)=>drag.action==='move'||i===drag.index?[a+dx,b+dy]:[a,b]);
    if(!validQuad(q))return;
    if(!drag.changed){checkpoint();drag.changed=true}
    model.items[selected]={...item(),q};$('items').children[selected].style.transform=transform(q);ui();
  };
  function finish(e){
    if(!drag||e.pointerId!==drag.id)return;
    if(drag.action==='add'&&e.type==='pointerup'&&Math.hypot(...point(e).map((v,i)=>v-drag.p[i]))*scale<10)add(drag.p);
    else if(drag.changed){remember(item());save()}
    drag=null;ui();
  }
  sheet.onpointerup=finish;sheet.onpointercancel=finish;sheet.onlostpointercapture=finish;
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
  $('preview').onclick=()=>{preview=!preview;ui()};
  $('color').onchange=()=>{
    if(item()?.kind==='star'&&!preview){checkpoint();model.items[selected]={...item(),color:$('color').value};pieces();save();ui()}
  };
  $('posters').onchange=()=>$('posterThumb').src=imageSrc($('posters').value);
  function size(factor){
    const o=item(),[cx,cy]=center(o.q),q=o.q.map(([x,y])=>[cx+(x-cx)*factor,cy+(y-cy)*factor]);
    if(!validQuad(q))return;
    checkpoint();model.items[selected]={...o,q};remember(item());pieces();ui();save();
  }
  $('larger').onclick=()=>size(1.16);$('smaller').onclick=()=>size(1/1.16);
  $('remove').onclick=()=>{checkpoint();model.items.splice(selected,1);selected=-1;pieces();ui();save()};
  $('undo').onclick=()=>{if(!history.length)return;model=history.pop();selected=-1;posterMenu();pieces();ui();save()};
  $('zoom').onchange=()=>{
    const vp=$('viewport'),r=sheet.getBoundingClientRect(),v=vp.getBoundingClientRect();
    const [x,y]=item()?center(item().q):[(v.left+v.width/2-r.left)/scale,(v.top+v.height/2-r.top)/scale];
    resize();vp.scrollTo(x*scale-vp.clientWidth/2,y*scale-vp.clientHeight/2);
  };
  $('imageFile').onchange=async e=>{
    const f=e.target.files[0];e.target.value='';if(!f)return;
    const url=URL.createObjectURL(f);
    try{
      const im=new Image();im.src=url;await im.decode();
      const cv=document.createElement('canvas'),s=Math.min(1,1200/Math.max(im.width,im.height));
      cv.width=Math.max(1,Math.round(im.width*s));cv.height=Math.max(1,Math.round(im.height*s));
      cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
      const id='import-'+crypto.randomUUID();checkpoint();model.images.push({id,name:f.name,src:cv.toDataURL('image/webp',.9)});
      posterMenu();$('posters').value=id;$('posters').onchange();setMode('poster');save();
    }catch{notify('Cette image ne peut pas être ouverte. Essaie un PNG ou un JPEG.')}finally{URL.revokeObjectURL(url)}
  };
  $('export').onclick=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(model)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='murs-alice.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  };
  $('jsonFile').onchange=async e=>{
    const f=e.target.files[0];e.target.value='';if(!f)return;
    try{const m=JSON.parse(await f.text());if(!valid(m))throw Error();checkpoint();model=m;selected=-1;posterMenu();pieces();setMode('select');save()}
    catch{notify('Fichier de placement invalide.')}
  };
  new ResizeObserver(resize).observe($('viewport'));pieces();resize();
})();
