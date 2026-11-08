/* Original 128×128 canvases share one coordinate system: never trim a layer. */
'use strict';
const KEY='portfolio-tamagotchi-v2';
const clamp=n=>Math.max(0,Math.min(100,n));
const files={scene:5194,neutral:5195,tired:5196,asleep:5197,surprised:5198,happy:5199,feed:5193,sleep:5192,draw:5230,music:5190,cuddle:5189,cuddleFace:5236,musicFace:5235,emptyBar:5231,status:5200,energyBar:5201,joyBar:5202,hungerBar:5203};
const actions={feed:{delta:[22,0,4],face:'surprised',text:['Miam !','Yum!']},sleep:{delta:[0,25,2],face:'asleep',text:['Bonne nuit !','Good night!']},draw:{delta:[-4,-8,16],face:'happy',text:['Quel joli dessin !','What a lovely drawing!']},music:{delta:[-3,-6,18],face:'musicFace',text:['On danse !',"Let’s dance!"]},cuddle:{delta:[0,2,20],face:'cuddleFace',text:['Câlin !','Hug!']}};
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
let state,art={},outlines={},activeFace=null,timer,ready=false;
const activityOrder=['feed','sleep','draw','music','cuddle'];
let selected=0,hop=false,moodAction=null;
const moods={feed:['des nouilles !','noodles!'],sleep:['encore cinq\nminutes…','five more\nminutes…'],draw:['des idées\nplein la tête !','so many\nideas!'],music:['on danse ?','shall we\ndance?'],cuddle:['reste un peu ♥','stay a little ♥']};
function updateMood(){const key=moodAction||(state.hunger<25?'feed':state.energy<30?'sleep':state.joy<35?'cuddle':'music');document.getElementById('mood').textContent=moods[key][language()==='en'?1:0];}
function selectActivity(index){selected=(index+activityOrder.length)%activityOrder.length;document.querySelectorAll('[data-action]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.action===activityOrder[selected])));paint();}

try{state=JSON.parse(localStorage.getItem(KEY));}catch{}
if(!state||typeof state!=='object')state={hunger:70,energy:80,joy:90,last:Date.now()};
for(const key of ['hunger','energy','joy'])state[key]=Number.isFinite(state[key])?clamp(state[key]):75;
const hours=Math.min(48,Math.max(0,(Date.now()-(Number.isFinite(state.last)?state.last:Date.now()))/3600000));
state.hunger=clamp(state.hunger-hours*2);state.energy=clamp(state.energy-hours);state.joy=clamp(state.joy-hours*1.5);
function language(){try{return localStorage.getItem('portfolio-language-v2')==='en'?'en':'fr';}catch{return 'fr';}}
function translate(){const lang=language();document.documentElement.lang=lang;document.title=lang==='en'?'My Tamagotchi':'Mon Tamagotchi';document.querySelectorAll('[data-fr]').forEach(el=>{const text=el.dataset[lang];if(!el.hasAttribute('data-label-only'))el.textContent=text;el.setAttribute('aria-label',text);});}
function restingFace(){return state.energy<30?'tired':state.hunger<25?'surprised':state.joy<35?'neutral':state.joy>=80?'happy':'neutral';}
function paint(){if(!ready)return;const face=activeFace||restingFace();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,128,128);for(const name of ['scene',face,'feed','sleep','draw','music','cuddle','status']){const chosen=name===activityOrder[selected],y=chosen&&hop?-2:0;if(chosen)ctx.drawImage(outlines[name],0,y);ctx.drawImage(art[name],0,y);}
for(const [key,name,y] of [['energy','energyBar',7],['joy','joyBar',16],['hunger','hungerBar',25]]){ctx.save();ctx.beginPath();ctx.rect(78,y+1,Math.round(43*Math.ceil(clamp(state[key])/10)/10),5);ctx.clip();ctx.drawImage(art[name],0,0);ctx.restore();ctx.drawImage(art.emptyBar,0,y-7);}canvas.dataset.expression=face;}
function render(){for(const key of ['hunger','energy','joy'])document.getElementById(key).value=state[key];state.last=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}paint();}
function act(type){const action=actions[type];if(!action)return;window.NanaProgress?.feat('care-'+type);['hunger','energy','joy'].forEach((key,i)=>state[key]=clamp(state[key]+action.delta[i]));activeFace=action.face;moodAction=type;selectActivity(activityOrder.indexOf(type));render();updateMood();document.getElementById('notice').textContent=action.text[language()==='en'?1:0];clearTimeout(timer);timer=setTimeout(()=>{activeFace=null;document.getElementById('notice').textContent='';paint();},type==='sleep'?4000:1800);}
function closeGame(){clearTimeout(timer);if(window.parent!==window)window.parent.postMessage({type:'close-tamagotchi'},'*');else if(history.length>1)history.back();else window.close();}
/* Remove only border-connected, pure white export background. Enclosed white
   pixels (cat, stars, eye details) remain exactly as Léna drew them. */
async function loadLayer(number){const img=new Image();img.src=`IMG_${number}.png`;await img.decode();const layer=document.createElement('canvas');layer.width=layer.height=128;const c=layer.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(img,0,0);const data=c.getImageData(0,0,128,128),pixels=data.data,seen=new Uint8Array(16384),queue=[];function visit(x,y){if(x<0||x>=128||y<0||y>=128)return;const p=y*128+x,i=p*4;if(seen[p]||pixels[i]!==255||pixels[i+1]!==255||pixels[i+2]!==255)return;seen[p]=1;queue.push(p);}for(let i=0;i<128;i++){visit(i,0);visit(i,127);visit(0,i);visit(127,i);}for(let q=0;q<queue.length;q++){const p=queue[q],x=p%128,y=Math.floor(p/128);pixels[p*4+3]=0;visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}c.putImageData(data,0,0);return layer;}
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>act(button.dataset.action)));
document.getElementById('previous').addEventListener('click',()=>selectActivity(selected-1));
document.getElementById('next').addEventListener('click',()=>selectActivity(selected+1));
document.getElementById('confirm').addEventListener('click',()=>act(activityOrder[selected]));
document.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectActivity(selected+(event.key==='ArrowLeft'?-1:1));}else if(event.key==='Enter'&&event.target===document.body){event.preventDefault();act(activityOrder[selected]);}});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
setInterval(()=>{if(document.hidden||reducedMotion.matches){if(hop){hop=false;paint();}return;}hop=!hop;paint();},450);
document.querySelector('.close').addEventListener('click',closeGame);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeGame();});
window.addEventListener('storage',event=>{if(event.key==='portfolio-language-v2'){translate();updateMood();}});
translate();render();selectActivity(0);updateMood();
Promise.all(Object.entries(files).map(async([name,number])=>{art[name]=await loadLayer(number);})).then(()=>{for(const name of activityOrder){const mask=document.createElement('canvas');mask.width=mask.height=128;const m=mask.getContext('2d');m.drawImage(art[name],0,0);m.globalCompositeOperation='source-in';m.fillStyle='#fff3a3';m.fillRect(0,0,128,128);const outline=document.createElement('canvas');outline.width=outline.height=128;const o=outline.getContext('2d');for(const [x,y] of [[-1,0],[1,0],[0,-1],[0,1]])o.drawImage(mask,x,y);outlines[name]=outline;}ready=true;paint();}).catch(()=>{document.getElementById('notice').textContent=language()==='en'?'Drawings unavailable. Please reload.':'Dessins indisponibles. Recharge la page.';});
