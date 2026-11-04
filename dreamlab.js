(() => {
  "use strict";
  const $ = (q, scope=document) => scope.querySelector(q);
  const $$ = (q, scope=document) => Array.from(scope.querySelectorAll(q));
  const pads = [
    {fr:"grosse caisse",en:"kick",short:"kick"}, {fr:"clap",en:"clap",short:"clap"},
    {fr:"charleston",en:"hi-hat",short:"hat"}, {fr:"basse",en:"bass",short:"bass"},
    {fr:"arpège",en:"arpeggio",short:"arp"}, {fr:"nappe",en:"dream pad",short:"pad"},
    {fr:"paillettes",en:"sparkles",short:"shine"}, {fr:"percussion",en:"percussion",short:"perc"}
  ];
  const knobs = [
    {id:"tone",fr:"filtre",en:"filter",value:66},
    {id:"edge",fr:"réson.",en:"reson.",value:22},
    {id:"attack",fr:"attaque",en:"attack",value:18},
    {id:"release",fr:"relâche",en:"release",value:36},
    {id:"echo",fr:"écho",en:"echo",value:28},
    {id:"wobble",fr:"vibrato",en:"vibrato",value:10},
    {id:"tempo",fr:"tempo",en:"tempo",value:36},
    {id:"sparkle",fr:"éclat",en:"sparkle",value:50}
  ];
  const faders = [
    {id:"synth",fr:"clavier",en:"keys",value:75},
    {id:"drums",fr:"rythme",en:"drums",value:68},
    {id:"texture",fr:"textures",en:"textures",value:65},
    {id:"master",fr:"sortie",en:"master",value:78}
  ];
  const settings = Object.fromEntries([...knobs,...faders].map(x=>[x.id,x.value]));
  const moodRoots = {dreamy:48,melancholic:45,strange:50,joyful:53};
  const moodIntervals = {dreamy:[0,4,7,11,14],melancholic:[0,3,7,10,14],strange:[0,3,6,9,14],joyful:[0,4,7,9,12]};
  const moodIcons = {dreamy:["✧","✦","⋆","♡"],melancholic:["☾","✧","·","✦"],strange:["✳","✴","✧","◇"],joyful:["♡","✿","✧","✦"]};
  const names = ["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
  const physical = ["a","w","s","e","d","f","t","g","y","h","u","j","k","o","l","p",";","'","z","x","c","v","b","n","m"];
  const midiToFreq = n => 440 * Math.pow(2,(n-69)/12);
  const padOn = Array(8).fill(false);
  const keyNodes = new Map(),activeVoices = new Map(),heldKeys = new Set();
  let lang = new URLSearchParams(location.search).get("lang")==="en"?"en":"fr";
  let mood = "dreamy",ctx,master,synthBus,drumBus,textureBus,filter,echoSend,echoDelay,echoFeedback,recDest,noiseBuffer;
  let isLooping=false,ticker=null,nextStepTime=0,currentStep=0;
  let keyMode="single",arpClock=null;
  // Each key starts a root-position chord. The mood defines the chord colour.
  // Four pitches keep a single-key gesture musically rich but approachable.
  const chords={
    dreamy:{intervals:[0,4,7,11],suffix:"maj7"},
    melancholic:{intervals:[0,3,7,10],suffix:"m7"},
    strange:{intervals:[0,3,6,9],suffix:"dim7"},
    joyful:{intervals:[0,4,7,9],suffix:"6"}
  };
  const chordNotes=root=>chords[mood].intervals.map(interval=>root+interval);
  const modeDescriptions={
    single:{fr:"1 touche = 1 note",en:"1 key = 1 note"},
    chord:{fr:"1 touche = 1 accord",en:"1 key = 1 chord"},
    arp:{fr:"1 touche = 1 arpège · maintiens pour répéter",en:"1 key = 1 arpeggio · hold to repeat"}
  };
  function updateModeDescription(){
    const t=modeDescriptions[keyMode];
    $("#dl-play-mode-description").textContent=t[lang];
  }
  let recorder=null,recordChunks=[],recordStart=0,recordClock=null,renderedBlob=null,renderedUrl=null,renderedExt="wav";
  const playback = $("#dl-playback");
  function say(fr,en){$("#dl-status").textContent=lang==="en"?en:fr}
  function translate(){
    document.documentElement.lang=lang;
    $$("[data-fr][data-en]").forEach(el=>el.textContent=el.dataset[lang]);
    $("#dl-language").textContent=lang==="fr"?"EN":"FR";
    $("#dl-loop-toggle span").textContent=isLooping?(lang==="fr"?"arrêter la boucle":"stop loop"):(lang==="fr"?"lancer la boucle":"start loop");
    $("#dl-record").querySelector("[data-fr]").textContent=recorder&&recorder.state==="recording"?(lang==="fr"?"en cours…":"recording…"):(lang==="fr"?"enregistrer":"record");
    $$(".dl-pad").forEach((el,i)=>el.querySelector("span").textContent=lang==="fr"?pads[i].fr:pads[i].en);
    $$(".dl-knob-cell").forEach((el,i)=>el.querySelector("label").textContent=lang==="fr"?knobs[i].fr:knobs[i].en);
    $(".dl-fader-cell").forEach((el,i)=>el.querySelector("label").textContent=lang==="fr"?faders[i].fr:faders[i].en);
    updateModeDescription();
  }
  $("#dl-language").addEventListener("click",()=>{lang=lang==="fr"?"en":"fr";translate()});
  $(".dl-play-mode").forEach(btn=>btn.addEventListener("click",()=>{
    if(keyMode===btn.dataset.playMode)return;
    stopAllNotes();
    keyMode=btn.dataset.playMode;
    $(".dl-play-mode").forEach(el=>{
      const selected=el===btn;
      el.classList.toggle("active",selected);
      el.setAttribute("aria-pressed",String(selected));
    });
    updateModeDescription();
    $("#dl-stage-text").textContent=lang==="fr"?
      (keyMode==="chord"?"un accord au bout des doigts":keyMode==="arp"?"fais danser les notes":"joue une note pour commencer"):
      (keyMode==="chord"?"a chord at your fingertips":keyMode==="arp"?"let the notes dance":"play a note to begin");
    say(
      keyMode==="chord"?"une touche joue un accord complet.":keyMode==="arp"?"une touche lance un arpège ; maintiens-la pour le répéter.":"joue librement, note par note.",
      keyMode==="chord"?"one key plays a full chord.":keyMode==="arp"?"one key plays an arpeggio; hold it to repeat.":"play freely, one note at a time."
    );
  }));
  $(".dl-mood").forEach(btn=>btn.addEventListener("click",()=>{
    stopAllNotes();
    mood=btn.dataset.mood;
    document.body.dataset.mood=mood;
    $$(".dl-mood").forEach(el=>{const selected=el===btn;el.classList.toggle("active",selected);el.setAttribute("aria-pressed",String(selected))});
    $("#dl-stage-text").textContent=lang==="fr"?"un nouvel univers sonore":"a new sound world";
    scatter(6);
    say("ambiance modifiée. joue quelques notes !","mood changed. play a few notes!");
  }));
  function createUI(){
    const pg=$("#dl-pads");
    pads.forEach((p,i)=>{
      const b=document.createElement("button");
      b.type="button";b.className="dl-pad";b.setAttribute("aria-pressed","false");b.setAttribute("aria-label",(i+1)+" "+p.fr);
      b.innerHTML='<b>' + String(i+1).padStart(2,"0") + '</b><span></span>';
      b.addEventListener("click",()=>togglePad(i));pg.append(b);
    });
    const kg=$("#dl-knobs");
    knobs.forEach(k=>{
      const cell=document.createElement("div");cell.className="dl-knob-cell";
      const b=document.createElement("button");b.type="button";b.className="dl-knob";b.setAttribute("role","slider");
      b.setAttribute("aria-valuemin","0");b.setAttribute("aria-valuemax","100");b.setAttribute("aria-label",k.fr);b.title=k.fr;
      let originY,originValue;
      b.addEventListener("pointerdown",e=>{if(e.button!==0&&e.pointerType==="mouse")return;originY=e.clientY;originValue=settings[k.id];b.setPointerCapture(e.pointerId);e.preventDefault()});
      b.addEventListener("pointermove",e=>{if(originY===undefined||!b.hasPointerCapture(e.pointerId))return;setKnob(k.id,originValue+Math.round((originY-e.clientY)*.65),b)});
      const end=()=>{originY=undefined};b.addEventListener("pointerup",end);b.addEventListener("pointercancel",end);
      b.addEventListener("keydown",e=>{if(["ArrowUp","ArrowRight","ArrowDown","ArrowLeft","Home","End"].includes(e.key)){e.preventDefault();const v=e.key==="Home"?0:e.key==="End"?100:settings[k.id]+(["ArrowUp","ArrowRight"].includes(e.key)?4:-4);setKnob(k.id,v,b)}});
      b.addEventListener("dblclick",()=>setKnob(k.id,k.value,b));
      const l=document.createElement("label");l.textContent=k.fr;cell.append(b,l);kg.append(cell);setKnob(k.id,k.value,b);
    });
    const fg=$("#dl-faders");
    faders.forEach(f=>{
      const cell=document.createElement("div");cell.className="dl-fader-cell";
      const l=document.createElement("label");l.textContent=f.fr;
      const input=document.createElement("input");input.type="range";input.min="0";input.max="100";input.value=f.value;input.setAttribute("aria-label",f.fr);
      input.addEventListener("input",()=>{settings[f.id]=+input.value;applyAudioSettings()});
      cell.append(l,input);fg.append(cell);
    });
    const keys=$("#dl-keys");let whites=0;
    for(let midi=48;midi<=72;midi++){
      const pitch=midi%12;const black=[1,3,6,8,10].includes(pitch);
      const b=document.createElement("button");b.type="button";b.className="dl-key "+(black?"black":"white");
      b.dataset.midi=midi;b.setAttribute("aria-label",names[pitch]+(Math.floor(midi/12)-1));
      if(black){b.style.left=((whites/15)*100)+"%";b.style.transform="translateX(-50%)"}
      else{b.style.left=((whites/15)*100)+"%";whites++}
      const legend=physical[midi-48];if(legend&&midi<65){const k=document.createElement("kbd");k.textContent=legend.toUpperCase();b.append(k)}
      b.addEventListener("pointerdown",e=>{if(e.button!==0&&e.pointerType==="mouse")return;e.preventDefault();b.setPointerCapture(e.pointerId);noteOn(midi)});
      b.addEventListener("pointerup",()=>noteOff(midi));
      b.addEventListener("pointercancel",()=>noteOff(midi));
      b.addEventListener("lostpointercapture",()=>noteOff(midi));
      keys.append(b);keyNodes.set(midi,b);
    }
  }
  function setKnob(name,v,b){
    const n=Math.max(0,Math.min(100,Math.round(v)));settings[name]=n;
    b.style.setProperty("--turn",(n*2.6)+"deg");b.style.setProperty("--angle",(-130+n*2.6)+"deg");
    b.setAttribute("aria-valuenow",String(n));applyAudioSettings();
    if(name==="tempo")$("#dl-bpm-value").textContent=tempo();
  }
  function tempo(){return Math.round(65+settings.tempo*1.0)}
  function ensureAudio(){
    if(ctx){if(ctx.state==="suspended")ctx.resume().catch(()=>{});return true}
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){say("ce navigateur ne prend pas en charge Web Audio.","this browser does not support Web Audio.");return false}
    ctx=new AC();
    master=ctx.createGain();synthBus=ctx.createGain();drumBus=ctx.createGain();textureBus=ctx.createGain();
    filter=ctx.createBiquadFilter();filter.type="lowpass";
    synthBus.connect(filter);filter.connect(master);drumBus.connect(master);textureBus.connect(master);
    echoSend=ctx.createGain();echoDelay=ctx.createDelay(1);echoFeedback=ctx.createGain();
    filter.connect(echoSend);textureBus.connect(echoSend);echoSend.connect(echoDelay);echoDelay.connect(master);
    echoDelay.connect(echoFeedback);echoFeedback.connect(echoDelay);echoDelay.delayTime.value=.32;echoFeedback.gain.value=.19;
    // The same stereo master feeds both speakers and the local recorder.
    master.connect(ctx.destination);recDest=ctx.createMediaStreamDestination();master.connect(recDest);
    noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.8),ctx.sampleRate);
    const d=noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);
    applyAudioSettings();return true;
  }
  function applyAudioSettings(){
    if(!ctx)return;
    const t=ctx.currentTime;
    filter.frequency.setTargetAtTime(250*Math.pow(40,settings.tone/100),t,.02);
    filter.Q.setTargetAtTime(.3+settings.edge*.095,t,.02);
    synthBus.gain.setTargetAtTime(settings.synth/100*.48,t,.015);
    drumBus.gain.setTargetAtTime(settings.drums/100*.70,t,.015);
    textureBus.gain.setTargetAtTime(settings.texture/100*.38,t,.015);
    master.gain.setTargetAtTime(settings.master/100*.78,t,.015);
    echoSend.gain.setTargetAtTime(settings.echo/100*.45,t,.03);
  }
  function makeTone(midi,at,length=0.35,volume=.5,bus=null,style=null){
    if(!ctx)return null;
    const output=bus||synthBus;
    const wave=style||({dreamy:"sine",melancholic:"triangle",strange:"sawtooth",joyful:"triangle"}[mood]);
    const osc=ctx.createOscillator(),o2=ctx.createOscillator(),gain=ctx.createGain();
    const attack=Math.min(.006+Math.pow(settings.attack/100,2)*.4,length*.40);
    const release=.045+Math.pow(settings.release/100,1.7)*1.3;
    const freq=midiToFreq(midi),end=at+length;
    osc.type=wave;osc.frequency.setValueAtTime(freq,at);
    o2.type=wave==="sawtooth"?"square":"sine";o2.frequency.setValueAtTime(freq,at);
    o2.detune.setValueAtTime(2+settings.wobble*.22,at);
    const g=Math.max(.001,volume);
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(g,at+attack);
    gain.gain.setValueAtTime(g,end);gain.gain.exponentialRampToValueAtTime(.0001,end+release);
    const mix=ctx.createGain();mix.gain.value=.28;
    osc.connect(gain);o2.connect(mix);mix.connect(gain);gain.connect(output);
    osc.start(at);o2.start(at);osc.stop(end+release+.025);o2.stop(end+release+.025);
    osc.onended=()=>{try{osc.disconnect();o2.disconnect();mix.disconnect();gain.disconnect()}catch(_){}};
    return {osc,o2,gain,attack,release,volume:g,startAt:at,releaseAt:end,stopAt:end+release};
  }
  function releaseVoice(v){
    if(!v||!ctx)return;
    const t=Math.max(ctx.currentTime,v.startAt+.001);
    // Avoid gain jumps when a held chord or note is released early.
    if(typeof v.gain.gain.cancelAndHoldAtTime==="function"){
      v.gain.gain.cancelAndHoldAtTime(t);
    }else{
      const held=v.volume*Math.min(1,Math.max(.02,(t-v.startAt)/Math.max(.001,v.attack)));
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setValueAtTime(Math.max(.0001,held),t);
    }
    v.gain.gain.exponentialRampToValueAtTime(.0001,t+v.release);
    try{v.osc.stop(t+v.release+.02);v.o2.stop(t+v.release+.02)}catch(_){}
  }
  function updateKeyboardLamp(){
    const active=[...activeVoices.values()].some(v=>v.type!=="arp"||v.held);
    $("#dl-activity-led").classList.toggle("lit",active);
  }
  function sweepArps(){
    if(!ctx)return;
    const lookAhead=ctx.currentTime+.045;
    const stepTime=60/tempo()/4; // sixteenth notes; follows the existing BPM knob
    for(const [midi,v] of activeVoices){
      if(v.type!=="arp")continue;
      // A tap plays at least one full 4-note phrase. Holding repeats it.
      while(v.nextTime<lookAhead&&(v.held||v.steps<v.notes.length)){
        const note=v.notes[v.steps%v.notes.length];
        makeTone(note,v.nextTime,Math.min(.34,stepTime*.85),.32);
        v.steps++;
        v.nextTime+=stepTime;
      }
      if(!v.held&&v.steps>=v.notes.length)activeVoices.delete(midi);
    }
    if(![...activeVoices.values()].some(v=>v.type==="arp")){
      clearInterval(arpClock);arpClock=null;
    }
    updateKeyboardLamp();
  }
  function noteOn(midi){
    const previous=activeVoices.get(midi);
    if(previous){
      if(previous.type==="arp"&&!previous.held)activeVoices.delete(midi);
      else return;
    }
    if(!ensureAudio())return;
    const t=ctx.currentTime+.003;
    const rootName=names[midi%12]+(Math.floor(midi/12)-1);
    keyNodes.get(midi)?.classList.add("pressed");
    if(keyMode==="chord"){
      const voices=chordNotes(midi).map(note=>makeTone(note,t,20,.18));
      activeVoices.set(midi,{type:"chord",voices});
      $("#dl-note-name").textContent=rootName+" "+chords[mood].suffix;
      $("#dl-stage-text").textContent=lang==="fr"?"un accord prend forme":"a chord takes shape";
      scatter(4);
    }else if(keyMode==="arp"){
      // Do not allow dozens of overlapping phrases on touch devices.
      const existing=[...activeVoices.entries()].filter(([,entry])=>entry.type==="arp");
      if(existing.length>=4){
        const [oldMidi]=existing[0];activeVoices.delete(oldMidi);
        keyNodes.get(oldMidi)?.classList.remove("pressed");
      }
      activeVoices.set(midi,{
        type:"arp",notes:chordNotes(midi),held:true,steps:0,nextTime:t
      });
      if(!arpClock)arpClock=setInterval(sweepArps,20);
      sweepArps();
      $("#dl-note-name").textContent=rootName+" "+chords[mood].suffix+" ↗";
      $("#dl-stage-text").textContent=lang==="fr"?"les notes se suivent comme des étoiles":"notes follow one another like stars";
      scatter(4);
    }else{
      const voice=makeTone(midi,t,20,.39);
      activeVoices.set(midi,{type:"single",voices:[voice]});
      $("#dl-note-name").textContent=rootName;
      $("#dl-stage-text").textContent=lang==="fr"?"une petite mélodie apparaît":"a little melody is born";
      scatter(2);
    }
    updateKeyboardLamp();
  }
  function noteOff(midi){
    const entry=activeVoices.get(midi);
    if(!entry)return;
    keyNodes.get(midi)?.classList.remove("pressed");
    if(entry.type==="arp"){
      // The minimum four-step phrase continues after a short tap.
      entry.held=false;
      sweepArps();
    }else{
      entry.voices.forEach(releaseVoice);
      activeVoices.delete(midi);
    }
    updateKeyboardLamp();
  }
  function stopAllNotes(){
    for(const [midi,entry] of activeVoices){
      keyNodes.get(midi)?.classList.remove("pressed");
      if(entry.voices)entry.voices.forEach(releaseVoice);
    }
    activeVoices.clear();
    heldKeys.clear();
    if(arpClock){clearInterval(arpClock);arpClock=null}
    updateKeyboardLamp();
  }
  function noiseHit(at,duration,volume,highpass=1000){
    const src=ctx.createBufferSource();src.buffer=noiseBuffer;
    const f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=highpass;
    const g=ctx.createGain();g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
    src.connect(f);f.connect(g);g.connect(drumBus);src.start(at);src.stop(at+duration+.005);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect()};
  }
  function kick(at){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";
    o.frequency.setValueAtTime(155,at);o.frequency.exponentialRampToValueAtTime(43,at+.17);
    g.gain.setValueAtTime(.85,at);g.gain.exponentialRampToValueAtTime(.0001,at+.24);
    o.connect(g);g.connect(drumBus);o.start(at);o.stop(at+.25);o.onended=()=>{o.disconnect();g.disconnect()};
  }
  function perc(at,midi=77){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";
    o.frequency.setValueAtTime(midiToFreq(midi),at);o.frequency.exponentialRampToValueAtTime(midiToFreq(midi-11),at+.14);
    g.gain.setValueAtTime(.22,at);g.gain.exponentialRampToValueAtTime(.0001,at+.17);
    o.connect(g);g.connect(drumBus);o.start(at);o.stop(at+.18);o.onended=()=>{o.disconnect();g.disconnect()};
  }
  function scheduledPads(step,at){
    const root=moodRoots[mood],ints=moodIntervals[mood];
    if(padOn[0]&&step%4===0)kick(at);
    if(padOn[1]&&(step===4||step===12))noiseHit(at,.16,.32,800);
    if(padOn[2]&&step%2===0)noiseHit(at,.065,step%4===0?.095:.065,6000);
    if(padOn[3]&&(step===0||step===6||step===8||step===14))makeTone(root-12+(step===14?7:0),at,.22,.42,textureBus,"triangle");
    if(padOn[4]&&step%2===0)makeTone(root+ints[Math.floor(step/2)%ints.length]+12,at,.16,.26,textureBus,"sine");
    if(padOn[5]&&step===0){[0,ints[1],ints[2]].forEach(interval=>makeTone(root+interval,at,1.55,.19,textureBus,"sine"))}
    if(padOn[6]&&(step===3||step===11))makeTone(root+24+ints[2],at,.12,.2*settings.sparkle/100,textureBus,"sine");
    if(padOn[7]&&(step===7||step===15))perc(at,step===15?83:77);
  }
  function tick(){
    if(!ctx||!isLooping)return;
    while(nextStepTime<ctx.currentTime+.11){
      scheduledPads(currentStep,nextStepTime);
      if(currentStep%4===0)$("#dl-activity-led").classList.add("lit");
      if(currentStep%4===2&&!activeVoices.size)$("#dl-activity-led").classList.remove("lit");
      currentStep=(currentStep+1)%16;
      nextStepTime+=60/tempo()/4;
    }
  }
  function startLoop(){
    if(isLooping||!ensureAudio())return;
    isLooping=true;currentStep=0;nextStepTime=ctx.currentTime+.04;
    ticker=setInterval(tick,25);tick();
    $("#dl-loop-toggle").setAttribute("aria-pressed","true");translate();
  }
  function stopLoop(){
    isLooping=false;clearInterval(ticker);ticker=null;
    $("#dl-loop-toggle").setAttribute("aria-pressed","false");translate();
  }
  function togglePad(i){
    padOn[i]=!padOn[i];const b=$$(".dl-pad")[i];
    b.classList.toggle("active",padOn[i]);b.setAttribute("aria-pressed",String(padOn[i]));
    scatter(3);
    if(padOn[i]&&!isLooping)startLoop();
    if(!padOn.some(Boolean)&&isLooping)stopLoop();
  }
  $("#dl-loop-toggle").addEventListener("click",()=>isLooping?stopLoop():startLoop());
  function scatter(count=2){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const box=$("#dl-particles"),icons=moodIcons[mood];
    if(box.childElementCount>30)return;
    for(let i=0;i<count;i++){
      const span=document.createElement("span");span.className="dl-particle";
      span.textContent=icons[Math.floor(Math.random()*icons.length)];
      span.style.setProperty("--x",(15+Math.random()*70)+"%");
      span.style.setProperty("--y",(45+Math.random()*45)+"%");
      span.style.setProperty("--drift",(-60+Math.random()*120)+"px");
      span.style.setProperty("--size",(17+Math.random()*34)+"px");
      span.addEventListener("animationend",()=>span.remove(),{once:true});box.append(span);
      setTimeout(()=>span.remove(),2100);
    }
  }
  let level=0;
  setInterval(()=>{
    level=Math.max(0,level-.11);
    if(activeVoices.size)level=Math.min(1,level+.25);
    if(isLooping&&padOn.some(Boolean))level=Math.min(1,level+.26);
    $$("#dl-meter i").forEach((bar,i)=>{
      const h=8+Math.max(0,level)*(9+((i*17)%30));
      bar.style.height=Math.round(h)+"px";
    });
  },130);
  document.addEventListener("keydown",e=>{
    if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.target.closest("input,select,textarea,[contenteditable],button"))return;
    const idx=physical.indexOf(e.key.toLowerCase());if(idx<0)return;
    e.preventDefault();if(heldKeys.has(e.code))return;heldKeys.add(e.code);noteOn(48+idx);
  });
  document.addEventListener("keyup",e=>{
    const idx=physical.indexOf(e.key.toLowerCase());if(idx<0)return;
    heldKeys.delete(e.code);noteOff(48+idx);
  });
  window.addEventListener("blur",()=>{heldKeys.clear();[...activeVoices.keys()].forEach(noteOff)});
  const padButtons=()=>$$(".dl-pad");
  function updateClock(){
    const seconds=Math.floor((performance.now()-recordStart)/1000);
    $("#dl-timer").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
  }
  function chooseMime(){
    if(!window.MediaRecorder)return "";
    return ["audio/webm;codecs=opus","audio/mp4","audio/ogg;codecs=opus","audio/webm"].find(x=>MediaRecorder.isTypeSupported(x))||"";
  }
  function encodeWave(audio){
    const channels=Math.min(2,audio.numberOfChannels),rate=audio.sampleRate,length=audio.length;
    const bytes=new ArrayBuffer(44+length*channels*2),view=new DataView(bytes);
    const put=(off,str)=>{for(let i=0;i<str.length;i++)view.setUint8(off+i,str.charCodeAt(i))};
    put(0,"RIFF");view.setUint32(4,36+length*channels*2,true);put(8,"WAVE");put(12,"fmt ");
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);
    view.setUint32(24,rate,true);view.setUint32(28,rate*channels*2,true);
    view.setUint16(32,channels*2,true);view.setUint16(34,16,true);put(36,"data");view.setUint32(40,length*channels*2,true);
    let offset=44;const data=Array.from({length:channels},(_,i)=>audio.getChannelData(i));
    for(let i=0;i<length;i++)for(let c=0;c<channels;c++){
      const sample=Math.max(-1,Math.min(1,data[c][i]));
      view.setInt16(offset,sample<0?sample*0x8000:sample*0x7fff,true);offset+=2;
    }
    return new Blob([bytes],{type:"audio/wav"});
  }
  async function finishRecording(){
    const mime=recorder?.mimeType||"audio/webm";
    const original=new Blob(recordChunks,{type:mime});
    if(original.size===0){say("aucun son n'a été capturé.","no sound was captured.");return}
    try{
      const decoded=await ctx.decodeAudioData(await original.arrayBuffer());
      renderedBlob=encodeWave(decoded);renderedExt="wav";
      say("ton morceau est prêt ! téléchargement au format WAV.","your song is ready! download it as a WAV.");
    }catch(_){
      renderedBlob=original;renderedExt=mime.includes("mp4")?"m4a":mime.includes("ogg")?"ogg":"webm";
      say("ton morceau est prêt ! téléchargement audio disponible.","your song is ready! audio download is available.");
    }
    if(renderedUrl)URL.revokeObjectURL(renderedUrl);
    renderedUrl=URL.createObjectURL(renderedBlob);
    playback.src=renderedUrl;playback.hidden=false;
    $("#dl-replay").disabled=false;$("#dl-download").disabled=false;
  }
  $("#dl-record").addEventListener("click",()=>{
    if(!ensureAudio())return;
    if(!window.MediaRecorder){say("l'enregistrement n'est pas compatible avec ce navigateur.","recording is not supported in this browser.");return}
    if(recorder&&recorder.state==="recording")return;
    if(renderedUrl){URL.revokeObjectURL(renderedUrl);renderedUrl=null}
    renderedBlob=null;playback.pause();playback.removeAttribute("src");playback.hidden=true;
    $("#dl-replay").disabled=true;$("#dl-download").disabled=true;recordChunks=[];
    try{
      const mime=chooseMime();
      recorder=new MediaRecorder(recDest.stream,mime?{mimeType:mime}:{});
      recorder.ondataavailable=e=>{if(e.data&&e.data.size)recordChunks.push(e.data)};
      recorder.onstop=()=>{clearInterval(recordClock);finishRecording().catch(()=>say("erreur lors de l'export.","export failed."));translate()};
      recorder.onerror=()=>say("l'enregistrement audio a échoué.","audio recording failed.");
      recorder.start(250);recordStart=performance.now();updateClock();recordClock=setInterval(updateClock,500);
      $("#dl-stop").disabled=false;$("#dl-record").disabled=true;$("#dl-record").classList.add("is-recording");
      translate();say("enregistrement en cours. joue et active tes boucles !","recording. play notes and build your loops!");
    }catch(_){say("impossible de démarrer l'enregistrement sur ce navigateur.","could not start recording in this browser.")}
  });
  $("#dl-stop").addEventListener("click",()=>{
    if(!recorder||recorder.state!=="recording")return;
    recorder.stop();$("#dl-stop").disabled=true;$("#dl-record").disabled=false;$("#dl-record").classList.remove("is-recording");
    say("préparation du fichier audio…","preparing your audio file…");
  });
  $("#dl-replay").addEventListener("click",()=>{
    if(!renderedUrl)return;playback.hidden=false;playback.currentTime=0;playback.play().catch(()=>{})
  });
  $("#dl-download").addEventListener("click",()=>{
    if(!renderedUrl)return;
    const a=document.createElement("a");a.href=renderedUrl;
    a.download="nana-dreamlab-"+new Date().toISOString().slice(0,10)+"."+renderedExt;
    document.body.append(a);a.click();a.remove();
  });
  window.addEventListener("pagehide",()=>{
    if(recorder&&recorder.state==="recording")recorder.stop();
    if(isLooping)stopLoop();
    stopAllNotes();
    if(ctx)ctx.close().catch(()=>{});
  });
  createUI();translate();
})();