/* Separate actions: turn the handle, then open the capsule in the tray. */
(() => {
  'use strict';
  const machine=document.getElementById('room-gachapon');
  if(!machine)return;
  const turn=machine.querySelector('.gacha-turn-button'),capsule=machine.querySelector('.gacha-capsule-button');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let timer=null,dialog=null;
  const text=(fr,en)=>document.documentElement.lang.startsWith('en')?en:fr;
  function finish(){clearTimeout(timer);timer=null;machine.classList.remove('is-turning');machine.classList.add('has-capsule');machine.removeAttribute('aria-busy');capsule.hidden=false;}
  turn.addEventListener('click',event=>{
    event.stopPropagation();
    if(timer!==null||!capsule.hidden)return;
    machine.classList.remove('has-capsule');
    if(reduced.matches){finish();return;}
    machine.classList.add('is-turning');machine.setAttribute('aria-busy','true');
    timer=setTimeout(finish,1500);
  });
  capsule.addEventListener('click',event=>{
    event.stopPropagation();
    if(capsule.hidden||dialog)return;
    dialog=document.createElement('dialog');dialog.className='gacha-open-dialog';dialog.setAttribute('aria-label',text('Capsule ouverte','Opened capsule'));
    const art=document.createElement('img');art.src='assets/room-gachapon/7299.png';art.alt=text('La capsule rose ouverte','The opened pink capsule');
    const close=document.createElement('button');close.type='button';close.textContent=text('Fermer','Close');close.addEventListener('click',()=>dialog.close());
    dialog.append(art,close);document.body.append(dialog);
    dialog.addEventListener('close',()=>{dialog.remove();dialog=null;machine.classList.remove('has-capsule');capsule.hidden=true;turn.focus({preventScroll:true});},{once:true});
    dialog.showModal();close.focus();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer!==null)finish();});
  window.addEventListener('hashchange',()=>{if(timer!==null)finish();if(dialog)dialog.close();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches&&timer!==null)finish();});
})();
