(()=>{
function init(){
const toggle=document.getElementById('menu-search'),panel=document.getElementById('global-search-popover'),input=document.getElementById('global-search-input'),results=document.getElementById('global-search-results');if(!toggle||!panel||!input)return;
const items=[
['Illustration','photos','art drawing gallery'],['Animation','motion','video motion'],['Music & Visuals','music','music visuals'],['Writing & Editorial','pages','articles writing'],['Mini Games','mini-games','play interactive'],['La Princesse Clown','book','illustrated book story'],['Coloring Book','coloring','drawing coloring'],['Dress-up','dressup','fashion outfit'],['Latte Lab','latte','coffee'],['Tamagotchi','tamagotchi','pet game'],['My Polaroids','polaroids','photos instax'],['About','about','biography'],['Contact','contact','email'],['GABZILLA','gabzilla','textile collaboration']
];
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function render(){results.replaceChildren();const q=normalize(input.value.trim());if(!q)return;const matches=items.filter(x=>normalize(x.join(' ')).includes(q));if(!matches.length){results.textContent='No matching results.';return}for(const item of matches){const b=document.createElement('button');b.type='button';b.textContent=item[0];b.addEventListener('click',()=>{hide();const el=document.querySelector('[data-open="'+item[1]+'"]');if(el)el.click();else if(typeof window.openApp==='function')window.openApp(item[1])});results.append(b)}}
function hide(){panel.hidden=true;toggle.setAttribute('aria-expanded','false')}
toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){input.value='';results.replaceChildren();input.focus()}});
input.addEventListener('input',render);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!toggle.contains(e.target))hide()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();