/* One action: download the generated PNG, without an extra dialog or share menu. */
(() => {
  'use strict';
  const t=(fr,en)=>document.documentElement.lang.startsWith('en')?en:fr;
  async function show(source,name='nana-souvenir.png'){
    const blob=source instanceof Blob?source:await (await fetch(source)).blob();
    if(!blob.type.startsWith('image/'))throw new Error('Expected an image');
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
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
