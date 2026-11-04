(() => {
  "use strict";
  const engine=window.NanaDreamLabEngine;
  if(!engine)return;
  const $=id=>document.getElementById(id);
  const lanes=Array.from({length:5},()=>({audio:null,volume:85,mute:false}));
  let selected=0,recorder=null,recording=-1,processing=false,unloading=false;
  let chunks=[],clock=null,started=0,monitor=[],mixBlob=null,mixUrl=null;
  const player=$("dl-playback");
  const en=()=>document.documentElement.lang==="en";
  const word=(fr,english)=>en()?english:fr;
  const time=sec=>{
    const s=Math.max(0,Math.round(sec));
    return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  };
  const status=(fr,english)=>$("dl-status").textContent=word(fr,english);
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
  function draw(){
    const list=$("dl-track-list");
    list.replaceChildren();
    lanes.forEach((lane,i)=>{
      const row=el("div","dl-track"+(selected===i?" is-selected":"")+(recording===i?" is-recording":""));
      row.setAttribute("role","group");
      row.setAttribute("aria-label",word("Piste ","Track ")+(i+1));
      const info=el("div","dl-track-info");
      const number=el("span","dl-track-number",String(i+1).padStart(2,"0"));
      const labels=el("div","dl-track-label");
      const name=el("strong","",word("piste ","track ")+(i+1));
      const detail=el("span","dl-track-meta",recording===i?word("● en cours","● recording"):
        lane.audio?time(lane.audio.duration):word("vide","empty"));
      labels.append(name,detail);info.append(number,labels);

      const level=el("div","dl-track-level");
      const levelLabel=el("label","",word("vol. ","vol. ")+lane.volume+"%");
      const slider=el("input");
      slider.type="range";slider.min="0";slider.max="100";slider.step="1";slider.value=String(lane.volume);
      slider.disabled=!lane.audio||recording!==-1||processing;
      slider.setAttribute("aria-label",word("Volume de la piste ","Volume for track ")+(i+1));
      slider.addEventListener("input",()=>{
        lane.volume=Number(slider.value);
        levelLabel.textContent="vol. "+lane.volume+"%";
        invalidateMix();
      });
      level.append(levelLabel,slider);

      const actions=el("div","dl-track-actions");
      const choose=el("button","dl-track-select",selected===i?word("choisie","selected"):word("choisir","select"));
      choose.type="button";choose.setAttribute("aria-pressed",String(selected===i));
      choose.disabled=!!lane.audio||recording!==-1||processing;
      choose.addEventListener("click",()=>{selected=i;draw()});

      const mute=el("button","dl-track-mute",lane.mute?word("réactiver","unmute"):"mute");
      mute.type="button";mute.disabled=!lane.audio||recording!==-1||processing;
      mute.setAttribute("aria-pressed",String(lane.mute));
      mute.addEventListener("click",()=>{lane.mute=!lane.mute;invalidateMix();draw()});

      const del=el("button","dl-track-delete","×");
      del.type="button";del.disabled=!lane.audio||recording!==-1||processing;
      del.title=word("effacer la piste","delete track");
      del.setAttribute("aria-label",word("Effacer piste ","Delete track ")+(i+1));
      del.addEventListener("click",()=>{
        if(!window.confirm(word("Effacer la piste ","Delete track ")+(i+1)+" ?"))return;
        lane.audio=null;lane.volume=85;lane.mute=false;
        selected=i;invalidateMix();draw();
        status("piste effacée. tu peux l'enregistrer à nouveau.","track deleted. you can record it again.");
      });
      actions.append(choose,mute,del);
      row.append(info,level,actions);list.append(row);
    });

    const count=lanes.filter(t=>t.audio).length;
    const audible=lanes.some(t=>t.audio&&!t.mute&&t.volume>0);
    $("dl-track-count").textContent=count+" / 5";
    $("dl-record-target").textContent=selected<0?"—":String(selected+1).padStart(2,"0");
    $("dl-record").disabled=selected<0||!!lanes[selected]?.audio||recording!==-1||processing;
    $("dl-stop").disabled=recording===-1||processing;
    $("dl-replay").disabled=!audible||recording!==-1||processing;
    $("dl-download").disabled=count===0||recording!==-1||processing;
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
      invalidateMix();selected=firstEmpty();
      if(selected===-1)status("tes 5 pistes sont prêtes ! écoute puis télécharge ton mix.","all 5 tracks are ready! listen and download your mix.");
      else status("piste "+(index+1)+" enregistrée. tu peux ajouter la suivante.","track "+(index+1)+" saved. you can add another.");
    }catch(_){
      if(!unloading)status("impossible de sauvegarder cette prise. réessaie.","could not save this take. please try again.");
    }finally{
      recording=-1;processing=false;recorder=null;chunks=[];
      if(!unloading)draw();
    }
  }
  $("dl-record").addEventListener("click",()=>{
    if(processing||recording!==-1||selected<0||lanes[selected].audio)return;
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
      link.href=mixUrl;link.download="nana-dreamlab-mix-"+new Date().toISOString().slice(0,10)+".wav";
      document.body.append(link);link.click();link.remove();
      status("ton mix est téléchargé !","your mix was downloaded!");
    }catch(_){status("impossible de générer le fichier WAV.","could not generate the WAV file.")}
  });
  $("dl-language").addEventListener("click",draw);
  window.addEventListener("pagehide",()=>{
    unloading=true;clearClock();stopMonitoring();
    if(recorder&&recorder.state==="recording")recorder.stop();
    invalidateMix();
  });
  draw();
})();
