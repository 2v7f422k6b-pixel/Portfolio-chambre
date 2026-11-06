/* Original 128×128 canvases share one coordinate system: never trim a layer. */
'use strict';
const KEY='portfolio-tamagotchi-v2';
const clamp=n=>Math.max(0,Math.min(100,n));
const files={scene:5194,neutral:5195,tired:5196,asleep:5197,surprised:5198,happy:5199,feed:5193,sleep:5192,draw:5230,music:5190,cuddle:5189,cuddleFace:5236,musicFace:5235,emptyBar:5231,status:5200,energyBar:5201,joyBar:5202,hungerBar:5203};
const actions={feed:{delta:[22,0,4],face:'surprised',text:['Miam !','Yum!']},sleep:{delta:[0,25,2],face:'asleep',text:['Bonne nuit !','Good night!']},draw:{delta:[-4,-8,16],face:'happy',text:['Quel joli dessin !','What a lovely drawing!']},music:{delta:[-3,-6,18],face:'musicFace',text:['On danse !',"Let’s dance!"]},cuddle:{delta:[0,2,20],face:'cuddleFace',text:['Câlin !','Hug!']}};
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
let state,art={},activeFace=null,timer,ready=false;
try{state=JSON.parse(localStorage.getItem(KEY));}catch{}
if(!state||typeof state!=='object')state={hunger:70,energy:80,joy:90,last:Date.now()};
for(const key of ['hunger','energy','joy'])state[key]=Number.isFinite(state[key])?clamp(state[key]):75;
const hours=Math.min(48,Math.max(0,(Date.now()-(Number.isFinite(state.last)?state.last:Date.now()))/3600000));
state.hunger=clamp(state.hunger-hours*2);state.energy=clamp(state.energy-hours);state.joy=clamp(state.joy-hours*1.5);
function language(){try{return localStorage.getItem('portfolio-language-v2')==='en'?'en':'fr';}catch{return 'fr';}}
function translate(){const lang=language();document.documentElement.lang=lang;document.title=lang==='en'?'My Tamagotchi':'Mon Tamagotchi';document.querySelectorAll('[data-fr]').forEach(el=>{const text=el.dataset[lang];if(!el.hasAttribute('data-label-only'))el.textContent=text;el.setAttribute('aria-label',text);});}
function restingFace(){return state.energy<30?'tired':state.hunger<25?'surprised':state.joy<35?'neutral':state.joy>=80?'happy':'neutral';}
function paint(){if(!ready)return;const face=activeFace||restingFace();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,128,128);for(const name of ['scene',face,'feed','sleep','draw','music','cuddle','status'])ctx.drawImage(art[name],0,0);
for(const [key,name,y] of [['energy','energyBar',7],['joy','joyBar',16],['hunger','hungerBar',25]]){ctx.save();ctx.beginPath();ctx.rect(78,y+1,Math.round(43*Math.ceil(clamp(state[key])/10)/10),5);ctx.clip();ctx.drawImage(art[name],0,0);ctx.restore();ctx.drawImage(art.emptyBar,0,y-7);}canvas.dataset.expression=face;}
function render(){for(const key of ['hunger','energy','joy'])document.getElementById(key).value=state[key];state.last=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}paint();}
function act(type){const action=actions[type];if(!action)return;['hunger','energy','joy'].forEach((key,i)=>state[key]=clamp(state[key]+action.delta[i]));activeFace=action.face;render();document.getElementById('notice').textContent=action.text[language()==='en'?1:0];clearTimeout(timer);timer=setTimeout(()=>{activeFace=null;document.getElementById('notice').textContent='';paint();},type==='sleep'?4000:1800);}
function closeGame(){clearTimeout(timer);if(window.parent!==window)window.parent.postMessage({type:'close-tamagotchi'},'*');else if(history.length>1)history.back();else window.close();}
/* Remove only border-connected, pure white export background. Enclosed white
   pixels (cat, stars, eye details) remain exactly as Léna drew them. */
async function loadLayer(number){const img=new Image();img.src=`IMG_${number}.png`;await img.decode();const layer=document.createElement('canvas');layer.width=layer.height=128;const c=layer.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(img,0,0);const data=c.getImageData(0,0,128,128),pixels=data.data,seen=new Uint8Array(16384),queue=[];function visit(x,y){if(x<0||x>=128||y<0||y>=128)return;const p=y*128+x,i=p*4;if(seen[p]||pixels[i]!==255||pixels[i+1]!==255||pixels[i+2]!==255)return;seen[p]=1;queue.push(p);}for(let i=0;i<128;i++){visit(i,0);visit(i,127);visit(0,i);visit(127,i);}for(let q=0;q<queue.length;q++){const p=queue[q],x=p%128,y=Math.floor(p/128);pixels[p*4+3]=0;visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}c.putImageData(data,0,0);return layer;}
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>act(button.dataset.action)));
document.querySelector('.close').addEventListener('click',closeGame);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeGame();});
window.addEventListener('storage',event=>{if(event.key==='portfolio-language-v2')translate();});
translate();render();
Promise.all(Object.entries(files).map(async([name,number])=>{art[name]=await loadLayer(number);})).then(()=>{ready=true;paint();}).catch(()=>{document.getElementById('notice').textContent=language()==='en'?'Drawings unavailable. Please reload.':'Dessins indisponibles. Recharge la page.';});
