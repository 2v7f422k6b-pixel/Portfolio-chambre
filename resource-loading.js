/* Fetch the selected view first. Keep the artist's original image files intact. */
(() => {
  'use strict';
  function createQueue({eligible,schedule,limit=2}) {
    const jobs=[];
    let active=0,scheduled=false;
    function wake(){
      if(scheduled||active>=limit||!jobs.some(job=>eligible(job.mode)))return;
      scheduled=true;
      schedule(()=>{
        scheduled=false;
        while(active<limit){
          const index=jobs.findIndex(job=>eligible(job.mode));
          if(index<0)break;
          const job=jobs.splice(index,1)[0];active++;
          Promise.resolve().then(job.run).catch(()=>{}).finally(()=>{active--;wake();});
        }
      });
    }
    return {add(mode,run){jobs.push({mode,run});wake();},wake};
  }
  function matchesView(resource,mode,theme){
    return (!resource.mode||resource.mode===mode)&&(!resource.theme||resource.theme===theme);
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={createQueue,matchesView};return;}

  let mode=null,theme=document.documentElement.dataset.theme||'day',ready=false;
  const selector='[data-resource-src],[data-resource-href],[data-resource-background]';
  const queue=createQueue({
    eligible:target=>target===mode&&ready&&!document.hidden,
    schedule:callback=>{
      if(window.requestIdleCallback)window.requestIdleCallback(callback,{timeout:1500});
      else setTimeout(callback,80);
    }
  });
  const resource=element=>({mode:element.dataset.resourceMode,theme:element.dataset.resourceTheme});
  function hydrate(element){
    const data=element.dataset;
    if(data.resourceSrc&&element.getAttribute('src')!==data.resourceSrc)element.setAttribute('src',data.resourceSrc);
    if(data.resourceHref&&element.getAttribute('href')!==data.resourceHref)element.setAttribute('href',data.resourceHref);
    if(data.resourceBackground)element.style.setProperty('--nana-work-background',`url("${data.resourceBackground}")`);
  }
  function activate(nextMode,nextTheme=theme){
    if(nextMode!==mode||nextTheme!==theme)ready=false;
    mode=nextMode;theme=nextTheme;
    for(const element of document.querySelectorAll(selector)){
      if(!element.hasAttribute('data-nana-lazy')&&matchesView(resource(element),mode,theme))hydrate(element);
    }
  }
  function setSource(element,url,{mode:target='play',theme:variant}={}){
    element.dataset.resourceMode=target;
    if(variant)element.dataset.resourceTheme=variant;
    const name=element.localName==='image'?'resourceHref':'resourceSrc';
    element.dataset[name]=url;
    if(matchesView(resource(element),mode,theme))hydrate(element);
  }
  function required(element){
    return !element.closest('[data-nana-load-ignore]')&&matchesView(resource(element),mode,theme);
  }
  function themeReady(target,variant){
    const images=[...document.querySelectorAll('img[data-resource-theme]')].filter(image=>matchesView(resource(image),target,variant));
    return images.length>0&&images.every(image=>image.getAttribute('src')===image.dataset.resourceSrc&&image.complete&&image.naturalWidth>0);
  }

  // Native lazy loading does not cover SVG <image> thumbnails. Observe the
  // existing SVG viewport so the exact crop and full-resolution source stay unchanged.
  const lazy=new Map();
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting)revealLazy(entry.target);
  },{rootMargin:'120px'});
  function revealLazy(target){
    const element=lazy.get(target);
    if(!element)return;
    hydrate(element);observer?.unobserve(target);lazy.delete(target);
  }
  function pruneLazy(){
    for(const target of lazy.keys())if(!target.isConnected){observer?.unobserve(target);lazy.delete(target);}
  }
  function lazySource(element,url,target=element){
    element.setAttribute('data-nana-lazy','');
    element.dataset[element.localName==='image'?'resourceHref':'resourceSrc']=url;
    if(!observer){hydrate(element);return;}
    lazy.set(target,element);observer.observe(target);
  }
  function inViewport(element){
    if(!element.isConnected||element.closest('[hidden]'))return false;
    const box=element.getBoundingClientRect();
    let left=0,top=0,right=innerWidth,bottom=innerHeight;
    if(!box.width||!box.height)return false;
    for(let parent=element.parentElement;parent;parent=parent.parentElement){
      const style=getComputedStyle(parent);
      if(style.display==='none')return false;
      if(/auto|scroll|hidden|clip/.test(style.overflow+style.overflowX+style.overflowY)){
        const clip=parent.getBoundingClientRect();
        left=Math.max(left,clip.left);right=Math.min(right,clip.right);
        top=Math.max(top,clip.top);bottom=Math.min(bottom,clip.bottom);
      }
    }
    return box.bottom>top&&box.top<bottom&&box.right>left&&box.left<right;
  }
  function loadVisible(scope=document){
    pruneLazy();
    for(const target of lazy.keys())if(scope.contains(target)&&inViewport(target))revealLazy(target);
  }
  function enqueueImage(target,url,prepare){
    queue.add(target,()=>new Promise(resolve=>{
      const image=new Image();image.decoding='async';image.fetchPriority='low';
      const finish=()=>{clearTimeout(timer);image.onload=image.onerror=null;resolve();};
      const timer=setTimeout(()=>{image.removeAttribute('src');finish();},15000);
      image.onload=()=>{try{prepare(image);}finally{finish();}};
      image.onerror=finish;image.src=url;
    }));
  }
  window.NanaResources={activate,setSource,required,themeReady,lazySource,loadVisible,inViewport,pruneLazy,
    enqueueImage,
    enqueue:(target,run)=>queue.add(target,run),
    hold(target){if(target===mode)ready=false;},
    ready(target){if(target===mode){ready=true;queue.wake();}}
  };
  document.addEventListener('visibilitychange',()=>queue.wake());
})();
