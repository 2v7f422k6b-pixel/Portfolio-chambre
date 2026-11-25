// Display the same cropped, glossy drawing in Mokona’s paw, the notebook and the menu.
(() => {
  const ns='http://www.w3.org/2000/svg';
  let serial=0;
  function element(tag,attrs){
    const node=document.createElementNS(ns,tag);
    for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
    return node;
  }
  window.NanaBadgeArt = badge => {
    const id='nana-badge-art-'+(++serial);
    const art=badge.image;
    const root=element('svg',{viewBox:'0 0 100 100',class:'nana-gloss-badge','aria-hidden':'true',focusable:'false'});
    const defs=element('defs',{});
    const drawing=element('svg',{id,viewBox:art.box?.join(' ')||'0 0 100 100',width:100,height:100,overflow:'hidden'});
    drawing.append(element('image',{href:art.src||art,width:art.width||100,height:art.height||100}));
    const mask=element('mask',{id:id+'-mask',maskUnits:'userSpaceOnUse',x:0,y:0,width:100,height:100,style:'mask-type:alpha'});
    mask.append(element('use',{href:'#'+id}));
    const gradient=element('linearGradient',{id:id+'-light'});
    for(const [offset,alpha] of [[0,0],[.46,.14],[.57,.82],[.66,.35],[1,0]])
      gradient.append(element('stop',{offset,'stop-color':'white','stop-opacity':alpha}));
    defs.append(drawing,mask,gradient);
    const reflection=element('g',{mask:'url(#'+id+'-mask)'});
    const sweep=element('g',{class:'badge-sweep'});
    sweep.append(element('path',{d:'M-70 0h32l-44 100h-32z',fill:'url(#'+id+'-light)'}));
    reflection.append(sweep);
    root.append(defs,element('use',{href:'#'+id}),reflection);
    return root;
  };
})();
