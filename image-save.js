/* Save visitor-created images through the native photo or image menu. */
(() => {
  'use strict';
  const t=(fr,en)=>document.documentElement.lang.startsWith('en')?en:fr;
  async function show(source,name='nana-souvenir.png'){
    const blob=source instanceof Blob?source:await (await fetch(source)).blob();
    if(!blob.type.startsWith('image/'))throw new Error('Expected an image');

    const file=new File([blob],name,{type:blob.type});
    const shareData={files:[file]};
    const canShare=typeof navigator.share==='function' && navigator.canShare?.(shareData);
    const dialog=document.createElement('dialog');
    dialog.setAttribute('aria-label',t('Enregistrer l’image','Save image'));
    dialog.style.cssText='width:min(600px,88vw);max-height:88dvh;padding:16px;border:2px solid #ed2445;border-radius:10px;background:#fff4e8;color:#b71332;text-align:center;box-sizing:border-box';
    const hint=document.createElement('p');
    const imageHint=t('Appuie longuement sur l’image ou fais un clic droit pour l’enregistrer.','Touch and hold the image or right-click it to save it.');
    hint.textContent=canShare?t('Ouvre le menu de partage, puis choisis « Enregistrer l’image ».','Open the share menu, then choose “Save Image”.'):imageHint;
    const url=URL.createObjectURL(blob);
    const image=document.createElement('img');
    image.src=url;
    image.alt=t('Aperçu de ton image','Preview of your image');
    image.style.cssText='display:block;max-width:100%;max-height:58dvh;object-fit:contain;margin:0 auto 12px;-webkit-touch-callout:default';
    const share=document.createElement('button');
    share.type='button';
    share.textContent=t('Enregistrer l’image','Save image');
    share.hidden=!canShare;
    share.onclick=async()=>{
      share.disabled=true;
      try{await navigator.share(shareData);}
      catch(error){
        if(error.name!=='AbortError'){share.hidden=true;hint.textContent=imageHint;}
      }finally{share.disabled=false;}
    };
    const close=document.createElement('button');
    close.type='button';
    close.textContent=t('Fermer','Close');
    close.onclick=()=>dialog.close();
    dialog.append(hint,image,share,close);
    dialog.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
    dialog.addEventListener('close',()=>{dialog.remove();URL.revokeObjectURL(url);},{once:true});
    document.body.append(dialog);
    dialog.showModal();
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
  window.NanaImageSave={show,textImage};
})();
