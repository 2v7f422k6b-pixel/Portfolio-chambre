/* Nana's Little Café — recipe, soft drawing tools and a note to Léna. */
(() => {
  'use strict';
  const $ = q => document.querySelector(q);
  const $$ = q => Array.from(document.querySelectorAll(q));
  const canvas = $('#art-canvas'), ctx = canvas.getContext('2d', {willReadFrequently:true});
  const paintArea = new Path2D();
  paintArea.ellipse(242,232,145,158,0,0,Math.PI*2);
  let step=0, steam=0, poured=0, milk='Oat', tool='foam', size=12;
  let drawing=false, last=null, pointer=null, undo=[], redo=[], hasArt=false, sending=false, sent=false;

  function goto(n) {
    step=n;
    if(n===5)window.NanaProgress?.feat('latte-made');
    $$('[data-step]').forEach(el => el.classList.toggle('active',Number(el.dataset.step)===n));
    $$('[data-progress]').forEach(el => {
      const i=Number(el.dataset.progress);
      el.classList.toggle('done',i<n);
      el.classList.toggle('current',i===n && n<5);
    });
    canvas.classList.toggle('visible',n>=4);
    canvas.classList.toggle('enabled',n===4);
    // On small screens the cup and tools share a scroll area. Bring the new
    // controls into view without jumping around while the visitor is drawing.
    const title=$('[data-step="'+n+'"] .step-title');
    title.tabIndex=-1;
    title.focus({preventScroll:true});
  }

  function chooseMilk(kind) {
    milk=kind;
    $$('[data-milk]').forEach(el => {
      const on=el.dataset.milk===kind;
      el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));
    });
    $('#milk-light').setAttribute('stop-color',kind==='Oat'?'#ecce9f':'#f6e8cf');
    $('#milk-dark').setAttribute('stop-color',kind==='Oat'?'#bb9066':'#cfaf8c');
    $('#milk').style.filter=kind==='Oat'?'none':'brightness(1.12) saturate(.65)';
    $('#cream-ring').style.filter=kind==='Oat'?'none':'brightness(1.08)';
  }
  $('#espresso-btn').addEventListener('click',() => {
    $('#espresso').setAttribute('opacity','1');goto(1);
  });
  $('#vanilla-btn').addEventListener('click',() => {
    $('#vanilla-swirl').setAttribute('opacity','1');goto(2);
  });
  $$('[data-milk]').forEach(el => el.addEventListener('click',() => chooseMilk(el.dataset.milk)));
  $('#steam-btn').addEventListener('click',() => {
    if(steam>=3)return;
    steam++;
    $$('#steam-meter i').forEach((el,i) => el.classList.toggle('active',i<steam));
    $('#steam-btn').textContent='Steam milk · '+steam+'/3';
    if(steam===3){$('#steam-btn').disabled=true;goto(3);}
  });
  function updatePour() {
    poured=Math.max(0,Math.min(160,Number($('#pour').value)||0));
    const amount=poured/160;
    $('#pour-count').textContent=poured+' ml';
    $('#milk').setAttribute('opacity',String(.94*Math.sqrt(amount)));
    $('#cream-ring').setAttribute('opacity',String(amount*.68));
    $('#vanilla-swirl').setAttribute('opacity',String(1-amount));
  }
  $('#pour').addEventListener('input',updatePour);
  $('#pour-next').addEventListener('click',() => goto(4));

  function point(e) {
    const r=canvas.getBoundingClientRect();
    if(!r.width||!r.height)return null;
    const p={x:(e.clientX-r.left)*500/r.width,y:(e.clientY-r.top)*500/r.height};
    return ((p.x-242)/145)**2+((p.y-232)/158)**2<=1?p:null;
  }
  function updateArt() {
    const pixels=ctx.getImageData(0,0,500,500).data;
    hasArt=false;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]){hasArt=true;break;}
    $('#undo-art').disabled=!undo.length;$('#redo-art').disabled=!redo.length;
    $('#clear-art').disabled=!hasArt;
  }
  function snapshot() {
    if(undo.length===20)undo.shift();
    undo.push(ctx.getImageData(0,0,500,500));redo=[];
  }
  function dab(p,radius) {
    if(tool==='cocoa') {
      // Individual grains, with air between them, instead of a brown line.
      for(let i=0;i<30;i++) {
        const angle=Math.random()*Math.PI*2, distance=Math.sqrt(Math.random())*radius;
        const grain=.35+Math.random()*.9;
        ctx.fillStyle='rgba(91,48,29,'+(.16+Math.random()*.45)+')';
        ctx.beginPath();ctx.arc(p.x+Math.cos(angle)*distance,p.y+Math.sin(angle)*distance,grain,0,Math.PI*2);ctx.fill();
      }
      return;
    }
    if(tool==='erase') {
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();return;
    }
    // A creamy centre fading into the coffee, with tiny irregular bubbles.
    const r=radius*(.91+Math.random()*.18);
    const gradient=ctx.createRadialGradient(p.x-r*.15,p.y-r*.18,0,p.x,p.y,r);
    gradient.addColorStop(0,'rgba(255,253,241,.64)');
    gradient.addColorStop(.58,'rgba(255,250,231,.55)');
    gradient.addColorStop(.84,'rgba(255,248,227,.23)');
    gradient.addColorStop(1,'rgba(255,248,227,0)');
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
    for(let i=0;i<3;i++) {
      const a=Math.random()*Math.PI*2,d=Math.random()*r*.8;
      ctx.strokeStyle='rgba(255,255,248,.22)';ctx.lineWidth=.5;
      ctx.beginPath();ctx.arc(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,.45+Math.random()*.8,0,Math.PI*2);ctx.stroke();
    }
  }
  function paint(from,to) {
    ctx.save();ctx.clip(paintArea);
    ctx.globalCompositeOperation=tool==='erase'?'destination-out':'source-over';
    const radius=size*500/300/2;
    if(from) {
      const length=Math.hypot(to.x-from.x,to.y-from.y),count=Math.max(1,Math.ceil(length/Math.max(1,radius*.35)));
      for(let i=1;i<=count;i++)dab({x:from.x+(to.x-from.x)*i/count,y:from.y+(to.y-from.y)*i/count},radius);
    } else dab(to,radius);
    ctx.restore();
  }
  canvas.addEventListener('pointerdown',e => {
    if(step!==4||drawing||e.button>0)return;
    const p=point(e);if(!p)return;
    snapshot();drawing=true;pointer=e.pointerId;last=p;
    canvas.setPointerCapture(e.pointerId);paint(null,p);e.preventDefault();
  });
  canvas.addEventListener('pointermove',e => {
    if(!drawing||e.pointerId!==pointer)return;
    const points=e.getCoalescedEvents?e.getCoalescedEvents():[];
    for(const event of points.length?points:[e]) {
      const p=point(event);if(!p){last=null;continue;}
      paint(last,p);last=p;
    }
    e.preventDefault();
  });
  function finish(e) {
    if(!drawing||(e&&e.pointerId!==pointer))return;
    drawing=false;pointer=null;last=null;updateArt();
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,finish));
  $$('[data-tool]').forEach(el => el.addEventListener('click',() => {
    tool=el.dataset.tool;
    $$('[data-tool]').forEach(b => {const on=b===el;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  }));
  $('#brush-size').addEventListener('input',function(){size=Number(this.value);$('#size-label').textContent=size;});
  $('#undo-art').addEventListener('click',() => {
    if(!undo.length)return;
    redo.push(ctx.getImageData(0,0,500,500));ctx.putImageData(undo.pop(),0,0);updateArt();
  });
  $('#redo-art').addEventListener('click',() => {
    if(!redo.length)return;
    undo.push(ctx.getImageData(0,0,500,500));ctx.putImageData(redo.pop(),0,0);updateArt();
  });
  $('#clear-art').addEventListener('click',() => {
    if(!hasArt)return;snapshot();ctx.clearRect(0,0,500,500);updateArt();
  });
  $('#serve-btn').addEventListener('click',() => goto(5));

  const form=$('#latte-message'),sendButton=$('#send-latte'),status=$('#send-status');
  form.addEventListener('submit',async e => {
    e.preventDefault();
    if(step!==5||sending||sent||!form.reportValidity())return;
    if(form.elements._gotcha.value)return;
    sending=true;sendButton.disabled=true;$('#restart-btn').disabled=true;
    status.hidden=false;status.textContent='Sending your latte…';
    const data=new FormData();
    data.set('_subject','Un nouveau latte pour Léna — Nana’s Little Café');
    data.set('name',$('#visitor-name').value.trim()||'Anonyme');
    data.set('message',$('#visitor-message').value.trim()||'Un latte pour te dire bonjour !');
    data.set('recette','Double expresso + 15 ml de sirop de vanille + '+poured+' ml de '+(milk==='Oat'?'lait d’avoine':'lait entier'));
    data.set('dessin',hasArt?'Latte décoré à la main':'Latte sans dessin');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try {
      const response=await fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal});
      if(!response.ok)throw new Error('Submission failed');
      sent=true;status.textContent='Your latte and note have been sent to Léna ♡';
      sendButton.hidden=true;
      $('#visitor-message').readOnly=true;$('#visitor-name').readOnly=true;
    } catch(_) {
      status.textContent='Your latte could not be sent. Your note is still here — please try again.';
    } finally {
      clearTimeout(timeout);sending=false;sendButton.disabled=sent;$('#restart-btn').disabled=false;
    }
  });
  $('#restart-btn').addEventListener('click',() => {
    if(sending)return;
    steam=0;poured=0;hasArt=false;drawing=false;last=null;pointer=null;undo=[];redo=[];sent=false;
    ctx.clearRect(0,0,500,500);
    ['espresso','milk','cream-ring','vanilla-swirl'].forEach(id=>$('#'+id).setAttribute('opacity','0'));
    $('#pour').value='0';$('#pour-count').textContent='0 ml';
    $('#steam-btn').disabled=false;$('#steam-btn').textContent='Steam milk · 0/3';
    $$('#steam-meter i').forEach(el=>el.classList.remove('active'));
    chooseMilk('Oat');size=12;$('#brush-size').value='12';$('#size-label').textContent='12';
    tool='foam';$$('[data-tool]').forEach(el=>{const on=el.dataset.tool==='foam';el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));});
    form.reset();$('#visitor-message').readOnly=false;$('#visitor-name').readOnly=false;
    status.hidden=true;status.textContent='';sendButton.hidden=false;sendButton.disabled=false;
    updateArt();goto(0);
  });
  $('#close').addEventListener('click',() => {
    if(window.parent!==window)window.parent.postMessage({type:'close-latte'},window.location.origin);
  });
})();
