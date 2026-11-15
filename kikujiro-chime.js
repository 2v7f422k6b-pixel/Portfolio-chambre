/* The fixed strap holds the angel/bell; the clappers move inside the glass.
   Only an intentional activation earns the saved future Kikujiro discovery. */
(() => {
  'use strict';
  const chime=document.getElementById('nana-kikujiro-chime');
  if(!chime)return;
  const feat='kikujiro-chime';
  let context=null,lastSound=-Infinity,ringTimer,toastTimer;
  const localize=()=>chime.setAttribute('aria-label',document.documentElement.lang.startsWith('en')
    ?'Ring the chime — discover the future Kikujiro outfit':'Faire tinter la clochette — découvrir la future tenue Kikujiro');
  function animate(){
    clearTimeout(ringTimer);chime.classList.remove('is-ringing');
    void chime.getBoundingClientRect();chime.classList.add('is-ringing');
    ringTimer=setTimeout(()=>chime.classList.remove('is-ringing'),1800);
  }
  async function sound(gesture=false){
    const Type=window.AudioContext||window.webkitAudioContext;
    if(!Type||document.hidden)return;
    // Browsers may require a click before sound is permitted on hover.
    if(!gesture&&context?.state!=='running'&&!navigator.userActivation?.hasBeenActive)return;
    const now=performance.now();if(now-lastSound<700)return;lastSound=now;
    try{
      if(!context||context.state==='closed')context=new Type();
      if(context.state==='suspended')await context.resume();
      if(context.state!=='running'||document.hidden)return;
      const start=context.currentTime+.015;
      for(const [note,offset] of [[1174.66,0],[1567.98,.085]]){
        for(const [ratio,level,decay] of [[1,.045,1.8],[2.71,.012,1.1],[4.07,.004,.65]]){
          const oscillator=context.createOscillator(),gain=context.createGain(),at=start+offset;
          oscillator.type='sine';oscillator.frequency.value=note*ratio;
          gain.gain.setValueAtTime(.0001,at);
          gain.gain.exponentialRampToValueAtTime(level,at+.004);
          gain.gain.exponentialRampToValueAtTime(.0001,at+decay);
          oscillator.connect(gain);gain.connect(context.destination);
          oscillator.start(at);oscillator.stop(at+decay+.03);
          oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
        }
      }
    }catch(_){/* Drawing, animation and reward remain available without audio. */}
  }
  function activate(event){
    event.preventDefault();event.stopPropagation();animate();void sound(true);
    const progress=window.NanaProgress,already=progress?.hasFeat(feat);
    progress?.visit('objet/clochette-kikujiro');progress?.feat(feat);
    if(!already&&progress?.hasFeat(feat)){
      const toast=document.getElementById('toast');if(!toast)return;
      const message=document.documentElement.lang.startsWith('en')
        ?'Discovery saved for the future Kikujiro outfit.'
        :'Découverte mémorisée pour la future tenue Kikujiro.';
      toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);
      toastTimer=setTimeout(()=>{if(toast.textContent===message)toast.hidden=true;},3000);
    }
  }
  chime.addEventListener('pointerenter',event=>{
    if(event.pointerType==='touch')return;animate();void sound();
  });
  chime.addEventListener('click',activate);
  chime.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')activate(event);});
  document.addEventListener('visibilitychange',()=>{
    chime.classList.toggle('is-idle',document.hidden);
    if(document.hidden){clearTimeout(ringTimer);chime.classList.remove('is-ringing');}
  });
  document.addEventListener('portfolio-language-change',localize);localize();
})();
