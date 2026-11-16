/* One gentle, replayable motion per activation, using the artist's intact drawings. */
(() => {
  'use strict';
  for(const [id,fr,en,duration] of [
    ['nana-fifi-horse','Faire bondir le cheval de Fifi Brindacier',"Make Pippi Longstocking’s horse hop",1300],
    ['nana-zola-book','Animer le livre Nana d’Émile Zola','Animate Nana by Émile Zola',1200]
  ]){
    const toy=document.getElementById(id);if(!toy)continue;
    let timer;
    function stop(){clearTimeout(timer);toy.classList.remove('is-playing');}
    function activate(event){
      event.preventDefault();event.stopPropagation();stop();
      void toy.getBoundingClientRect();toy.classList.add('is-playing');
      timer=setTimeout(stop,duration);
    }
    toy.addEventListener('click',activate);
    toy.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')activate(event);});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    window.addEventListener('hashchange',stop);
    const localize=()=>toy.setAttribute('aria-label',document.documentElement.lang.startsWith('en')?en:fr);
    document.addEventListener('portfolio-language-change',localize);localize();
  }
})();
