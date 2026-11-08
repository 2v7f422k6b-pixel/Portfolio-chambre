(() => {
  "use strict";
  const engine=window.NanaDreamLabEngine;
  if(!engine)return;
  const $=id=>document.getElementById(id);
  const lanes=Array.from({length:5},()=>({audio:null,volume:85,mute:false}));
  let selected=0,recorder=null,recording=-1,processing=false,unloading=false;
  let chunks=[],clock=null,started=0,monitor=[],mixBlob=null,mixUrl=null;
  let undoTake=null;
  const player=$("dl-playback");
  window.NanaProgress?.visit("jeu/mimilab");
  function containsMusic(audio){
    for(let c=0;c<audio.numberOfChannels;c++){
      const samples=audio.getChannelData(c);
      for(let i=0;i<samples.length;i++)if(Math.abs(samples[i])>.001)return true;
    }
    return false;
  }
  const en=()=>document.documentElement.lang==="en";
  const word=(fr,english)=>en()?english:fr;
  const time=sec=>{
    const s=Math.max(0,Math.round(sec));
    return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  };
  const status=(fr,english)=>{const node=$("dl-status");node.dataset.fr=fr;node.dataset.en=english;node.textContent=word(fr,english)};
  const firstEmpty=()=>lanes.findIndex(t=>!t.audio);

  function invalidateMix(){
    mixBlob=null;
    player.pause();player.hidden=true;player.removeAttribute("src");
    if(typeof player.load==="function")player.load();
    if(mixUrl){URL.revokeObjectURL(mixUrl);mixUrl=null}
  }
  function el(tag,cls,text){
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function waveform(buffer){
    const canvas=el("canvas","dl-waveform");canvas.width=320;canvas.height=42;
    canvas.setAttribute("aria-hidden","true");
    const ctx=canvas.getContext("2d"),samples=buffer.getChannelData(0);
    ctx.strokeStyle="#c52844";ctx.lineWidth=2;ctx.beginPath();
    for(let x=0;x<320;x++){
      const a=Math.floor(x*samples.length/320),b=Math.min(samples.length,Math.floor((x+1)*samples.length/320));
      let peak=0;for(let k=a;k<b;k+=Math.max(1,Math.floor((b-a)/10)))peak=Math.max(peak,Math.abs(samples[k]));
      const h=Math.max(1,peak*19);ctx.moveTo(x,21-h);ctx.lineTo(x,21+h);
    }
    ctx.stroke();return canvas;
  }
  function draw(){
    const list=$("dl-track-list");list.replaceChildren();
    const count=lanes.filter(t=>t.audio).length;
    const active=recording!==-1;
    const visible=Math.min(5,Math.max(1,count+(count<5?1:0)));
    lanes.forEach((lane,i)=>{
      if(i>=visible&&!lane.audio&&recording!==i)return;
      const row=el("div","dl-track"+(selected===i?" is-selected":"")+(recording===i?" is-recording":""));
      row.setAttribute("role","group");row.setAttribute("aria-label",word("Piste ","Track ")+(i+1));
      row.tabIndex=0;
      row.addEventListener("click",e=>{if(e.target.closest("button,input"))return;if(!active&&!processing){selected=i;draw()}});
      row.addEventListener("keydown",e=>{if(e.target!==row)return;if((e.key==="Enter"||e.key===" ")&&!active&&!processing){e.preventDefault();selected=i;draw()}});
      const info=el("div","dl-track-info");
      const number=el("span","dl-track-number",String(i+1).padStart(2,"0"));
      const labels=el("div","dl-track-label");
      labels.append(el("strong","",word("piste ","track ")+(i+1)),
        el("span","dl-track-meta",recording===i?word("● enregistrement…","● recording…"):lane.audio?time(lane.audio.duration):word("joue quelques notes pour commencer","play a few notes to begin")));
      info.append(number,labels);
      if(lane.audio)info.append(waveform(lane.audio));
      const actions=el("div","dl-track-actions");
      if(lane.audio){
        const mute=el("button","dl-track-mute",lane.mute?word("réactiver","unmute"):word("couper","mute"));
        mute.type="button";mute.disabled=active||processing;mute.setAttribute("aria-pressed",String(lane.mute));
        mute.addEventListener("click",()=>{lane.mute=!lane.mute;invalidateMix();draw()});
        const volume=el("input","dl-track-volume");volume.type="range";volume.min="0";volume.max="100";volume.value=String(lane.volume);
        volume.disabled=active||processing;volume.setAttribute("aria-label",word("Volume piste ","Track volume ")+(i+1));
        volume.addEventListener("input",()=>{lane.volume=Number(volume.value);invalidateMix()});
        const del=el("button","dl-track-delete","×");del.type="button";del.disabled=active||processing;
        del.setAttribute("aria-label",word("Supprimer piste ","Delete track ")+(i+1));
        del.addEventListener("click",()=>{undoTake={index:i,audio:lane.audio,volume:lane.volume,mute:lane.mute};lane.audio=null;lane.volume=85;lane.mute=false;selected=i;invalidateMix();draw();status("piste supprimée.","track deleted.")});
        actions.append(mute,volume,del);
      }
      row.append(info,actions);list.append(row);
    });
    $("dl-track-count").textContent=count+" / 5";
    const recordBtn=$("dl-record"),recordText=recordBtn.querySelector("[data-fr]");
    if(recordText){recordText.dataset.fr=processing?"préparation…":active?"arrêter":"enregistrer";recordText.dataset.en=processing?"preparing…":active?"stop":"record";recordText.textContent=word(recordText.dataset.fr,recordText.dataset.en)}
    $("dl-record-target").textContent=active?String(recording+1).padStart(2,"0"):"";
    recordBtn.classList.toggle("is-recording",active&&!processing);
    recordBtn.disabled=processing||(!active&&(selected<0||!!lanes[selected]?.audio));
    $("dl-stop").disabled=!active||processing;
    $("dl-replay").disabled=!lanes.some(t=>t.audio&&!t.mute&&t.volume>0)||active||processing;
    $("dl-download").disabled=count===0||active||processing;
    const extra=$("dl-daw-extra");
    if(extra){
      extra.replaceChildren();
      if(undoTake){
        const undo=el("button","dl-daw-undo",word("annuler la suppression","undo delete"));
        undo.disabled=active||processing;
        undo.onclick=()=>{if(recording!==-1||processing)return;const t=lanes[undoTake.index];Object.assign(t,{audio:undoTake.audio,volume:undoTake.volume,mute:undoTake.mute});selected=undoTake.index;undoTake=null;invalidateMix();draw();status("piste restaurée.","track restored.")};extra.append(undo);
      }
      if(!active&&!processing&&count){
        const redo=el("button","dl-daw-redo",word("refaire","redo"));
        redo.onclick=()=>{const i=selected>=0&&lanes[selected].audio?selected:lanes.findIndex(t=>t.audio);if(i<0)return;undoTake={index:i,...lanes[i]};lanes[i].audio=null;selected=i;invalidateMix();draw();status("prête à refaire la piste.","ready to redo the track.")};extra.append(redo);
        if(count<5){
          const add=el("button","dl-daw-add",word("+ ajouter une piste","+ add a track"));
          add.onclick=()=>{selected=firstEmpty();draw();status("prête à enregistrer. les pistes précédentes joueront pendant la prise.","ready to record. previous tracks will play during your take.")};extra.append(add);
        }
      }
    }
  }
  function stopMonitoring(){
    for(const {source,gain} of monitor){
      try{source.stop()}catch(_){}
      try{source.disconnect();gain.disconnect()}catch(_){}
    }
    monitor=[];
  }
  function monitorPrevious(){
    stopMonitoring();
    const context=engine.context();
    // Playback goes directly to the speakers; only the new performance enters
    // the MediaRecorder stream. This preserves true separate track layers.
    const at=context.currentTime+.035;
    lanes.forEach(lane=>{
      if(!lane.audio||lane.mute||lane.volume===0)return;
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=lane.audio;gain.gain.value=lane.volume/100;
      source.connect(gain);gain.connect(context.destination);
      source.start(at);monitor.push({source,gain});
    });
  }
  function clearClock(){
    clearInterval(clock);clock=null;
  }
  function updateClock(){
    $("dl-timer").textContent=time((performance.now()-started)/1000);
  }
  function makeMix(){
    if(mixBlob)return mixBlob;
    const existing=lanes.filter(t=>t.audio);
    if(!existing.length)return null;
    const ctx=engine.context();
    const frames=Math.max(...existing.map(t=>t.audio.length));
    const out=ctx.createBuffer(2,frames,ctx.sampleRate);
    const left=out.getChannelData(0),right=out.getChannelData(1);
    for(const track of existing){
      if(track.mute||track.volume===0)continue;
      const buf=track.audio,l=buf.getChannelData(0),r=buf.numberOfChannels>1?buf.getChannelData(1):l;
      const amp=track.volume/100;
      for(let i=0;i<buf.length;i++){
        left[i]+=l[i]*amp;right[i]+=r[i]*amp;
      }
    }
    let peak=0;
    for(let i=0;i<frames;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
    if(peak>.98){
      const attenuation=.98/peak;
      for(let i=0;i<frames;i++){left[i]*=attenuation;right[i]*=attenuation}
    }
    mixBlob=engine.encodeWave(out);
    mixUrl=URL.createObjectURL(mixBlob);
    return mixBlob;
  }
  async function storeTake(index,typedBlob){
    try{
      if(unloading)return;
      if(!typedBlob.size)throw Error("Empty recording");
      const audio=await engine.context().decodeAudioData(await typedBlob.arrayBuffer());
      if(unloading)return;
      if(!audio.length||!audio.duration)throw Error("Empty decoded audio");
      lanes[index].audio=audio;
      lanes[index].volume=85;lanes[index].mute=false;
      invalidateMix();undoTake=null;selected=firstEmpty();
      if(selected===-1)status("tes 5 pistes sont prêtes ! écoute puis télécharge ton mix.","all 5 tracks are ready! listen and download your mix.");
      else status("piste "+(index+1)+" enregistrée. tu peux ajouter la suivante.","track "+(index+1)+" saved. you can add another.");
      if(containsMusic(audio)){
        const progress=window.NanaProgress,already=progress?.unlockedOutfit("dj");
        progress?.feat("minilab-composed");
        if(!already&&progress?.unlockedOutfit("dj"))status("piste enregistrée · ta tenue DJ est débloquée dans le dressing !","track saved · your DJ outfit is unlocked in the wardrobe!");
      }
    }catch(_){
      if(!unloading)status("impossible de sauvegarder cette prise. réessaie.","could not save this take. please try again.");
    }finally{
      recording=-1;processing=false;recorder=null;chunks=[];
      if(!unloading)draw();
    }
  }
  $("dl-record").addEventListener("click",()=>{
    if(processing)return;
    if(recording!==-1){
      $("dl-stop").click();
      return;
    }
    if(selected<0||lanes[selected].audio)return;
    if(!engine.ensureAudio())return;
    if(!window.MediaRecorder){
      status("ce navigateur ne prend pas en charge l'enregistrement audio.","this browser does not support audio recording.");return;
    }
    invalidateMix();
    chunks=[];player.pause();
    const index=selected;
    try{
      const mime=engine.chooseMime();
      const capture=new MediaRecorder(engine.stream(),mime?{mimeType:mime}:{});
      recorder=capture;
      capture.ondataavailable=event=>{if(event.data&&event.data.size)chunks.push(event.data)};
      capture.onstop=()=>{
        clearClock();stopMonitoring();
        if(unloading)return;
        const blob=new Blob(chunks,{type:capture.mimeType||mime||"audio/webm"});
        storeTake(index,blob);
      };
      capture.onerror=()=>{
        status("une erreur s'est produite pendant l'enregistrement.","something went wrong during recording.");
      };
      capture.start(250);
      recording=index;
      monitorPrevious();
      started=performance.now();updateClock();clock=setInterval(updateClock,400);
      $("dl-record").classList.add("is-recording");
      draw();
      status("piste "+(index+1)+" en cours. joue sur le clavier et les pads !",
        "recording track "+(index+1)+". play the keyboard and pads!");
    }catch(_){
      stopMonitoring();recording=-1;recorder=null;
      $("dl-record").classList.remove("is-recording");
      draw();
      status("impossible de commencer l'enregistrement.","could not start recording.");
    }
  });
  $("dl-stop").addEventListener("click",()=>{
    if(recording===-1||!recorder||recorder.state!=="recording"||processing)return;
    processing=true;
    clearClock();stopMonitoring();
    recorder.stop();
    $("dl-record").classList.remove("is-recording");
    draw();
    status("préparation de la piste audio…","preparing your audio track…");
  });
  $("dl-replay").addEventListener("click",async()=>{
    if(processing||recording!==-1)return;
    try{
      if(!makeMix())return;
      player.src=mixUrl;player.hidden=false;player.currentTime=0;
      await player.play();
    }catch(_){status("impossible de lire le mix sur cet appareil.","could not play the mix on this device.")}
  });
  $("dl-download").addEventListener("click",()=>{
    if(processing||recording!==-1)return;
    try{
      if(!makeMix())return;
      const link=document.createElement("a");
      link.href=mixUrl;link.download="nana-mimilab-3-mix-"+new Date().toISOString().slice(0,10)+".wav";
      document.body.append(link);link.click();link.remove();
      status("ton mix est téléchargé !","your mix was downloaded!");
    }catch(_){status("impossible de générer le fichier WAV.","could not generate the WAV file.")}
  });
  $("dl-language").addEventListener("click",draw);
  player.addEventListener("play",()=>status("écoute du morceau…","playing your song…"));
  player.addEventListener("ended",()=>status("prête à enregistrer.","ready to record."));
  window.addEventListener("pagehide",()=>{
    unloading=true;clearClock();stopMonitoring();
    if(recorder&&recorder.state==="recording")recorder.stop();
    invalidateMix();
  });
  draw();
})();


