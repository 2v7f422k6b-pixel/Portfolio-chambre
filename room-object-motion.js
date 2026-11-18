/* Replayable scenes made only from Léna's existing room drawings. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg', active=new Map();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const frame=(offset,x=0,y=0,angle=0)=>({offset,transform:`translate(${x}px,${y}px) rotate(${angle}deg)`});
  const berryFlight=[frame(0),frame(.08,0,3,-2),frame(.24,-4,-38,3),frame(.42,7,-65,-3),frame(.61,14,-58,3),frame(.77,4,-35,-2),frame(.94,0,2,1),frame(1)];
  // Start in place, tip over the front edge, then fall behind the iMac.
  // Nothing travels into the shelf space reserved for future objects on the right.
  const vanTrip=[frame(0),frame(.05,-1,0,-3),frame(.10,1,0,2),frame(.15,-1,1,-5),frame(.23,0,6,-12),frame(.31,-5,18,-28),frame(.43,-9,58,-65),frame(.55,-12,138,-100),frame(.64,-12,218,-115),frame(.65,-12,218,-115),frame(.82),frame(.89),frame(1)].map((step,i)=>({...step,opacity:i>=9&&i<=11?0:1}));
  function element(tag,attrs){
    const el=document.createElementNS(NS,tag);
    for(const [key,value]of Object.entries(attrs||{}))el.setAttribute(key,value);
    return el;
  }
  function berryWings(art){
    const image=art.querySelector('image');
    if(!image)return null;
    const x=+image.getAttribute('x'),y=+image.getAttribute('y'),w=+image.getAttribute('width'),h=+image.getAttribute('height');
    const drawing=Array.from(art.children),parts=element('g',{'data-berry-flight-parts':'','data-nana-load-ignore':''}),defs=element('defs');
    // Trace the two wing/body seams on the existing 261 × 151 transparent crop.
    // No new pixels: three clipped copies are shown only during the little flight.
    const left=[[90,0],[90,55],[94,63],[90,75],[88,88],[89,103],[97,126],[97,151]];
    const right=[[187,0],[187,52],[196,65],[201,78],[205,90],[204,100],[196,122],[196,151]];
    const shapes={left:[[0,0],...left,[0,151]],right:[...right,[261,151],[261,0]],body:[...left,...right.slice().reverse()]};
    const wings=[];
    for(const [name,points]of Object.entries(shapes)){
      const clip=element('clipPath',{id:'berry-flight-clip-'+name,clipPathUnits:'userSpaceOnUse'});
      clip.append(element('polygon',{points:points.map(([a,b])=>`${x+a*w/261},${y+b*h/151}`).join(' ')}));defs.append(clip);
      const moving=element('g',{'data-berry-part':name}),crop=element('g',{'clip-path':`url(#berry-flight-clip-${name})`});
      drawing.forEach(el=>crop.append(el.cloneNode(true)));moving.append(crop);parts.append(moving);
      if(name!=='body'){
        moving.style.transformBox='view-box';
        moving.style.transformOrigin=`${x+(name==='left'?92:197)*w/261}px ${y+78*h/151}px`;
        wings.push(moving);
      }
    }
    parts.prepend(defs);art.append(parts);
    const previous=drawing.map(el=>el.style.visibility);
    drawing.forEach(el=>{el.style.visibility='hidden';});
    return {wings,restore(){parts.remove();drawing.forEach((el,i)=>{el.style.visibility=previous[i];});}};
  }
  function hideBehindIMac(art){
    const group=art.parentElement,imac=document.querySelector('polygon[data-open="work-zoom"]');
    if(!group||!imac)return null;
    const oldMask=group.getAttribute('mask'),defs=element('defs');
    const mask=element('mask',{id:'van-fall-imac-mask',maskUnits:'userSpaceOnUse',x:0,y:0,width:1670,height:942});
    mask.append(element('rect',{x:0,y:0,width:1670,height:942,fill:'white'}));
    mask.append(element('polygon',{points:imac.getAttribute('points'),fill:'black'}));
    defs.append(mask);group.prepend(defs);group.setAttribute('mask','url(#van-fall-imac-mask)');
    return{restore(){defs.remove();if(oldMask===null)group.removeAttribute('mask');else group.setAttribute('mask',oldMask);}};
  }
  function play(id,hit){
    if(active.has(id))return true;
    if(reduced.matches)return false;
    const berry=id==='happy-berry';
    if(!berry&&id!=='volkswagen')return false;
    const redrawnVan=hit?.querySelector('#v2-van-visual');
    const art=redrawnVan || document.getElementById(berry?'happy-berry-art':'volkswagen-visual');
    if(!art?.animate)return false;
    const box=art.getBBox(),previous={box:art.style.transformBox,origin:art.style.transformOrigin};
    art.style.transformBox='view-box';
    art.style.transformOrigin=`${box.x+box.width/2}px ${box.y+box.height*.85}px`;
    const scene=document.getElementById('play-scene'),animations=[];
    const pieces=berry?berryWings(art):null;
    const occlusion=berry||redrawnVan?null:hideBehindIMac(art);
    let done=false;
    function cleanup(){
      if(done)return;done=true;
      animations.forEach(animation=>animation.cancel());pieces?.restore();occlusion?.restore();
      art.style.transformBox=previous.box;art.style.transformOrigin=previous.origin;
      art.removeAttribute('data-motion-playing');
      if(berry)scene?.removeAttribute('data-berry-flying');
      active.delete(id);
    }
    active.set(id,cleanup);art.setAttribute('data-motion-playing',id);
    if(berry)scene?.setAttribute('data-berry-flying','');
    // The V2 van faces right at the far left of the room. Tip forward into the room.
    const redrawnTrip=redrawnVan && [frame(0),frame(.08,1,-1,-2),frame(.18,7,0,2),frame(.30,14,8,15),frame(.45,25,52,49),frame(.64,38,188,92),frame(.72,40,242,102),frame(.83),frame(1)].map((step,i)=>({...step,opacity:i===6||i===7?0:1}));
    const frames=berry?berryFlight:redrawnTrip||vanTrip,options={duration:berry?3400:4200,easing:berry?'ease-in-out':'linear'};
    const main=art.animate(frames,options);animations.push(main);
    // Follow the flying cushion. The van keeps its shelf target so an invisible
    // hit area cannot cover the iMac while it falls behind the screen.
    if(berry&&hit?.animate){
      const oldBox=hit.style.transformBox,oldOrigin=hit.style.transformOrigin;
      hit.style.transformBox='view-box';hit.style.transformOrigin=art.style.transformOrigin;
      const follow=hit.animate(frames,options);animations.push(follow);
      follow.oncancel=()=>{hit.style.transformBox=oldBox;hit.style.transformOrigin=oldOrigin;};
    }
    pieces?.wings.forEach((wing,i)=>{
      const sign=i===0?1:-1;
      animations.push(wing.animate([{transform:'rotate(0deg)'},{transform:`rotate(${sign*24}deg)`,offset:.3},{transform:`rotate(${-sign*18}deg)`,offset:.72},{transform:'rotate(0deg)'}],{duration:400,iterations:7,delay:80,easing:'ease-in-out'}));
    });
    main.onfinish=main.oncancel=cleanup;
    return true;
  }
  function stop(){for(const cleanup of [...active.values()])cleanup();}
  window.addEventListener('hashchange',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();});
  const style=document.createElement('style');
  style.textContent='#play-scene[data-berry-flying] [data-room-outline="IMG_7121.png"]{visibility:hidden!important}';
  document.head.append(style);
  window.NanaRoomObjectMotion={play};
})();
