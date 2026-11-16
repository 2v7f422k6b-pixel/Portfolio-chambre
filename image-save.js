/* Shared image keepsakes: a real image preview and a fresh gesture for iOS sharing. */
(() => {
  'use strict';
  const t=(fr,en)=>document.documentElement.lang.startsWith('en')?en:fr;
  let current;
  async function show(source,name='nana-souvenir.png'){
    const blob=source instanceof Blob?source:await (await fetch(source)).blob();
    if(!blob.type.startsWith('image/'))throw new Error('Expected an image');
    current?.close();
    const url=URL.createObjectURL(blob),file=new File([blob],name,{type:blob.type});
    const dialog=document.createElement('dialog');current=dialog;
    dialog.className='nana-image-save';
    dialog.setAttribute('aria-label',t('Garder mon image','Keep my image'));
    const close=document.createElement('button');close.textContent=t('Fermer','Close');close.onclick=()=>dialog.close();
    const image=new Image();image.src=url;image.alt=t('Ton souvenir à enregistrer','Your keepsake to save');
    const hint=document.createElement('p');hint.textContent=t('Appui long ou clic droit sur l’image pour l’enregistrer.','Touch and hold or right-click the image to save it.');
    const actions=document.createElement('div');actions.className='nana-image-actions';
    if(navigator.canShare?.({files:[file]})){
      const share=document.createElement('button');share.textContent=t('Partager / enregistrer dans Photos','Share / save to Photos');
      share.onclick=async()=>{try{await navigator.share({files:[file],title:t('Mon souvenir','My keepsake')});}catch(e){if(e.name!=='AbortError')hint.textContent=t('Tu peux enregistrer l’image par appui long.','You can save the image by touching and holding it.');}};
      actions.append(share);
    }
    const download=document.createElement('a');download.href=url;download.download=name;download.textContent=t('Télécharger le PNG','Download PNG');
    actions.append(download,close);dialog.append(actions,image,hint);document.body.append(dialog);
    const previous=document.activeElement;
    dialog.addEventListener('close',()=>{dialog.remove();URL.revokeObjectURL(url);if(current===dialog)current=null;previous?.focus({preventScroll:true});},{once:true});
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.showModal();close.focus();
  }
  async function textImage(text,name){
    await document.fonts.ready;
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    ctx.font='32px "Nana Trace UI", sans-serif';
    const lines=[];
    for(const paragraph of text.split('\n')){
      let line='';
      for(const word of paragraph.split(/\s+/)){
        if(line&&ctx.measureText(line+' '+word).width>1040){lines.push(line);line='';}
        line+=(line?' ':'')+word;
      }
      lines.push(line);
    }
    canvas.width=1200;canvas.height=Math.max(600,220+lines.length*48);
    ctx.fillStyle='#fff4e8';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ed2445';ctx.font='32px "Nana Trace UI", sans-serif';
    lines.forEach((line,i)=>ctx.fillText(line,80,110+i*48));
    ctx.font='24px "Nana Trace UI", sans-serif';ctx.fillText('Nana Color Studio',80,canvas.height-50);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    return show(blob,name);
  }
  const style=document.createElement('style');style.textContent=`
    .nana-image-save{box-sizing:border-box;border:0;background:#fff4e8;color:#ed2445;padding:16px;width:min(680px,94vw);max-height:90dvh;overflow:auto;font-family:inherit}
    .nana-image-save::backdrop{background:#24152c99}
    .nana-image-save img{display:block;width:auto;height:auto;max-width:100%;max-height:65dvh;margin:12px auto;-webkit-touch-callout:default;user-select:auto}
    .nana-image-save .nana-image-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
    .nana-image-save button,.nana-image-save a{font:inherit;color:#ed2445;background:#ffe4ec;border:0;padding:10px;cursor:pointer;text-decoration:underline}
    .nana-image-save p{font-size:15px;line-height:1.4}
  `;document.head.append(style);
  window.NanaImageSave={show,textImage};
})();
