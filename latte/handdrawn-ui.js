/* Latte Lab — subtle hand-traced UI borders only; illustrated mug/art stays intact. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const targets=[
    ['.window','frame',11],['.bar','bottom',23],['.bar button','frame',37],
    ['.station','station',41],['.saucer-label','frame',53],
    ['.progress','bottom',67],['button.action','frame',79],
    ['.milk-options button','frame',83],['.meter','frame',97],
    ['.tip','left',101],['.status','top-dashed',113],
    ['.art-tools button','frame',127],['.latte-input-shell','frame',139]
  ];
  const observed=new WeakMap(),all=[];
  const round=n=>Math.round(n*10)/10;
  function seeded(seed){
    let n=seed>>>0;
    return ()=>{
      n^=n<<13;n^=n>>>17;n^=n<<5;
      return(n>>>0)/4294967296;
    };
  }
  function makePath(width,height,kind,seed){
    const rand=seeded(seed),variation=1.0;
    function edge(x0,y0,x1,y1,d){
      const horizontal=Math.abs(x1-x0)>=Math.abs(y1-y0);
      const count=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)/37));
      for(let i=1;i<=count;i++){
        const from=(i-1)/count,to=i/count,mid=(from+to)/2;
        const cx=x0+(x1-x0)*mid+(horizontal?0:(rand()-.5)*variation*2);
        const cy=y0+(y1-y0)*mid+(horizontal?(rand()-.5)*variation*2:0);
        const x=x0+(x1-x0)*to+(horizontal||i===count?0:(rand()-.5)*variation);
        const y=y0+(y1-y0)*to+(!horizontal||i===count?0:(rand()-.5)*variation);
        d+=' Q '+round(cx)+' '+round(cy)+' '+round(x)+' '+round(y);
      }
      return d;
    }
    if(kind==='station')kind=window.matchMedia('(max-width:650px)').matches?'bottom':'right';
    const l=1.6,t=1.6,r=Math.max(l+4,width-1.6),b=Math.max(t+4,height-1.6);
    if(kind==='track')return edge(9,height/2,width-9,height/2,'M 9 '+round(height/2));
    if(kind==='bottom'||kind==='top-dashed'){
      const y=kind==='bottom'?height-2:2;
      return edge(l,y,r,y,'M '+l+' '+round(y));
    }
    if(kind==='left'||kind==='right'){
      const x=kind==='right'?width-2:2;
      return edge(x,t,x,b,'M '+round(x)+' '+t);
    }
    let d='M '+l+' '+t;
    d=edge(l,t,r,t,d);d=edge(r,t,r,b,d);d=edge(r,b,l,b,d);
    return edge(l,b,l,t,d)+' Z';
  }
  function redraw(item,force=false){
    if(!item.element.isConnected)return;
    const w=item.element.offsetWidth,h=item.element.offsetHeight;
    const mobile=window.matchMedia('(max-width:650px)').matches;
    if(w<18||h<12)return;
    if(!force&&w===item.w&&h===item.h&&(item.kind!=='station'||mobile===item.mobile))return;
    item.w=w;item.h=h;item.mobile=mobile;
    item.svg.setAttribute('viewBox','0 0 '+w+' '+h);
    item.ink.setAttribute('d',makePath(w,h,item.kind,item.seed));
  }
  const ro='ResizeObserver' in window?new ResizeObserver(entries=>{
    for(const entry of entries){const item=observed.get(entry.target);if(item)redraw(item);}
  }):null;
  function attach(el,kind,seed){
    const previous=observed.get(el);
    if(previous){
      // Button textContent updates in the mini-game can remove its decoration.
      if(previous.svg.parentNode!==el){el.appendChild(previous.svg);redraw(previous,true);}
      return;
    }
    const svg=document.createElementNS(NS,'svg');
    svg.classList.add('latte-trace-svg');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    svg.setAttribute('preserveAspectRatio','none');
    const ink=document.createElementNS(NS,'path');
    if(kind==='top-dashed')ink.setAttribute('stroke-dasharray','5 5');
    svg.appendChild(ink);
    el.classList.add('latte-traced');
    el.appendChild(svg);
    const item={element:el,svg,ink,kind,seed,w:0,h:0,mobile:false};
    observed.set(el,item);all.push(item);
    ro?.observe(el);redraw(item,true);
  }
  function wrapInputs(){
    document.querySelectorAll('input[type=range]').forEach((input,i)=>{
      if(input.closest('.latte-slider-shell'))return;
      const shell=document.createElement('span');
      shell.className='latte-slider-shell';
      input.parentNode.insertBefore(shell,input);
      shell.appendChild(input);
      attach(shell,'track',181+i*37);
    });
    document.querySelectorAll('.art-name input').forEach(input=>{
      if(input.closest('.latte-input-shell'))return;
      const shell=document.createElement('span');
      shell.className='latte-input-shell';
      input.parentNode.insertBefore(shell,input);
      shell.appendChild(input);
    });
  }
  function scan(){
    wrapInputs();
    for(const [selector,kind,seed]of targets){
      document.querySelectorAll(selector).forEach((el,i)=>attach(el,kind,seed+i*131));
    }
  }
  scan();
  let scheduled=false;
  const mo=new MutationObserver(records=>{
    const relevant=records.some(record=>
      [...record.addedNodes,...record.removedNodes].some(node=>
        node.nodeType===1&&(!node.classList?.contains('latte-trace-svg')||
          (record.removedNodes.length>0&&node.parentNode!==record.target))
      )
    );
    if(!relevant||scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;scan();});
  });
  mo.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>all.forEach(item=>redraw(item,true)),{passive:true});
})();
