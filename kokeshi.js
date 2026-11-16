/* The artist's registered head and body stay separate in both light modes. */
(() => {
  'use strict';
  const doll=document.getElementById('nana-kokeshi');
  if(!doll)return;
  let timer;
  function animate(){
    clearTimeout(timer);doll.classList.remove('is-shy');
    void doll.getBoundingClientRect();doll.classList.add('is-shy');
    timer=setTimeout(()=>doll.classList.remove('is-shy'),1800);
  }
  function activate(event){
    event.preventDefault();event.stopPropagation();animate();
    window.NanaProgress?.visit('objet/kokeshi');
    window.NanaProgress?.feat('kokeshi-yukata');
  }
  function localize(){doll.setAttribute('aria-label',document.documentElement.lang.startsWith('en')?'Kokeshi — unlock the yukata':'Kokeshi — débloquer le yukata');}
  doll.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')animate();});
  doll.addEventListener('click',activate);
  doll.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')activate(event);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);doll.classList.remove('is-shy');}});
  document.addEventListener('portfolio-language-change',localize);localize();
})();
