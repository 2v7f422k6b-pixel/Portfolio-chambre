/* Reveal each view only after its image layers have decoded together. */
(() => {
  'use strict';
  function createGate({prepare,pending,reveal,failed}) {
    let revision=0;
    return {
      cancel(){revision++;},
      async run(){
        const current=++revision;
        pending();
        try {
          await prepare();
          if(current===revision)reveal();
        } catch(error) {
          if(current===revision)failed(error);
        }
      }
    };
  }
  function waitForImage(image,timeout=15000) {
    return new Promise((resolve,reject)=>{
      let timer,done=false;
      const finish=error=>{
        if(done)return;done=true;clearTimeout(timer);
        image.removeEventListener('load',loaded);image.removeEventListener('error',broken);
        error?reject(error):resolve();
      };
      const broken=()=>finish(new Error('Image unavailable'));
      const loaded=()=>{
        if(!image.naturalWidth){broken();return;}
        if(typeof image.decode==='function')image.decode().then(()=>finish(),finish);
        else finish();
      };
      timer=setTimeout(()=>finish(new Error('Image timeout')),timeout);
      image.addEventListener('load',loaded);image.addEventListener('error',broken);
      if(image.complete)loaded();
    });
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={createGate,waitForImage};return;}
  const surfaces=['play-viewport','work-desktop','window-content','special-host'].map(id=>document.getElementById(id)).filter(Boolean);
  const states=new Map();
  const mediaSelector='img,image,iframe';
  const visible=surface=>!surface.closest('[hidden]')&&getComputedStyle(surface).display!=='none';
  const language=()=>document.documentElement.lang==='fr';
  const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  function urlsInBackground(element){
    return [...getComputedStyle(element).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match=>match[1]);
  }
  async function prepareImages(scope,held){
    const jobs=[],urls=new Set();
    for(const image of scope.querySelectorAll('img')){
      if(!image.getAttribute('src')&&!image.getAttribute('srcset'))continue;
      // Off-screen gallery thumbnails retain native lazy loading.
      if(image.loading==='lazy'){
        const box=image.getBoundingClientRect();
        if(box.bottom<0||box.top>innerHeight||box.right<0||box.left>innerWidth)continue;
        image.loading='eager';
      }
      jobs.push(waitForImage(image));
    }
    for(const image of scope.querySelectorAll('image')){
      const url=image.getAttribute('href')||image.getAttribute('xlink:href');
      if(url&&!url.startsWith('#'))urls.add(new URL(url,scope.baseURI).href);
    }
    for(const element of scope.querySelectorAll('.work-bg-layer'))for(const url of urlsInBackground(element))urls.add(new URL(url,scope.baseURI).href);
    for(const url of urls){
      const image=new Image();held.push(image);image.src=url;jobs.push(waitForImage(image));
    }
    await Promise.all(jobs);
  }
  async function prepareFrame(iframe,held){
    const ready=()=>{
      try{return iframe.contentDocument?.readyState==='complete'&&iframe.contentDocument.URL!=='about:blank';}
      catch(_){return false;}
    };
    if(!ready())await new Promise((resolve,reject)=>{
      const finish=error=>{clearTimeout(timer);iframe.removeEventListener('load',loaded);error?reject(error):resolve();};
      const loaded=()=>finish();
      const timer=setTimeout(()=>finish(new Error('Page timeout')),15000);
      iframe.addEventListener('load',loaded);
      if(ready())finish();
    });
    try{
      const doc=iframe.contentDocument;
      if(doc?.body)await prepareImages(doc.body,held);
    }catch(error){if(error.name!=='SecurityError')throw error;}
  }
  function makeState(surface){
    let loader=null;
    function position(){
      if(!loader)return;
      loader.style.transform=`translate(${surface.scrollLeft}px,${surface.scrollTop}px)`;
      loader.style.width=surface.clientWidth+'px';loader.style.height=surface.clientHeight+'px';
    }
    surface.addEventListener('scroll',position,{passive:true});
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(position).observe(surface);
    function mount(){
      if(loader?.parentNode===surface)return;
      loader=document.createElement('div');loader.className='nana-surface-loader';
      const label=document.createElement('span');label.setAttribute('role','status');
      const retry=document.createElement('button');retry.type='button';retry.hidden=true;
      retry.addEventListener('click',()=>{
        // Retry is explicit; never reset a running mini-game automatically.
        for(const iframe of surface.querySelectorAll('iframe'))iframe.src=iframe.src;
        for(const image of surface.querySelectorAll('img'))if(image.complete&&!image.naturalWidth)image.src=image.src;
        state.gate.run();
      });
      loader.append(label,retry);surface.append(loader);position();
    }
    const state={clear(){surface.classList.remove('nana-surface-pending');surface.removeAttribute('aria-busy');loader?.remove();},gate:createGate({
      pending(){
        mount();position();surface.classList.add('nana-surface-pending');surface.setAttribute('aria-busy','true');
        loader.classList.remove('nana-load-error');
        loader.firstChild.textContent=language()?'Chargement…':'Loading…';loader.lastChild.hidden=true;
      },
      async prepare(){
        // Hold decoded SVG/background sources until the complete view is painted.
        const held=[];
        await Promise.all([prepareImages(surface,held),...[...surface.querySelectorAll('iframe')].map(iframe=>prepareFrame(iframe,held))]);
        await frame();
        held.length=0;
      },
      reveal(){surface.classList.remove('nana-surface-pending');surface.setAttribute('aria-busy','false');loader?.remove();},
      failed(){
        mount();surface.setAttribute('aria-busy','false');loader.classList.add('nana-load-error');
        loader.firstChild.textContent=language()?'Le chargement n’a pas abouti.':'This view could not finish loading.';
        loader.lastChild.textContent=language()?'Réessayer':'Try again';loader.lastChild.hidden=false;
      }
    })};
    return state;
  }
  for(const surface of surfaces)states.set(surface,makeState(surface));
  function refresh(surface){
    const state=states.get(surface);
    // app.js already decodes the entire target room inside its composite
    // day/night transition. Do not insert a loader into that snapshot.
    if(surface.id==='play-viewport'&&visible(surface)&&document.documentElement.classList.contains('nana-room-theme-transition')&&!surface.classList.contains('nana-surface-pending'))return;
    if(visible(surface)&&surface.querySelector(mediaSelector+',.work-bg-layer'))state.gate.run();
    else {state.gate.cancel();state.clear();}
  }
  const isMedia=node=>node.nodeType===1&&(node.matches(mediaSelector)||node.querySelector(mediaSelector));
  new MutationObserver(records=>{
    const changed=new Set();
    for(const record of records){
      if(record.target.closest?.('.nana-surface-loader'))continue;
      for(const surface of surfaces){
        if(record.type==='attributes'){
          if(record.attributeName==='hidden'&&(record.target===surface||record.target.contains(surface)))changed.add(surface);
          else if(surface.contains(record.target)&&record.target.matches(mediaSelector))changed.add(surface);
        }else if(surface.contains(record.target)){
          const nodes=[...record.addedNodes,...record.removedNodes].filter(node=>!node.classList?.contains('nana-surface-loader'));
          if(nodes.some(isMedia)||(record.target===surface&&nodes.length))changed.add(surface);
        }
      }
    }
    changed.forEach(refresh);
  }).observe(document.getElementById('app'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','src','srcset','href','xlink:href']});
  surfaces.forEach(refresh);
  // Re-decode on history restoration; a mobile browser can discard image memory.
  window.addEventListener('pageshow',event=>{if(event.persisted)surfaces.forEach(refresh);});
})();
