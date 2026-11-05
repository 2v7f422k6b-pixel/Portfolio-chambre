import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../game-i18n.js',import.meta.url),'utf8');
function translator(){
  const context={window:{addEventListener(){}},document:{title:'Latte Lab ♡',readyState:'loading',addEventListener(){}},localStorage:{getItem(){return 'fr'}}};
  const end=source.lastIndexOf('})();');
  vm.runInNewContext(source.slice(0,end)+'globalThis.api={translated,translateHeartLabel,setLanguage(value){language=value}};'+source.slice(end),context);
  return context.api;
}
function label(value,{trace=true,control=false}={}){
  const text=value=>({nodeType:3,nodeValue:value});
  const heart=()=>({nodeType:1,classList:{contains:name=>name==='lena-heart'},matches:()=>false});
  const svg={nodeType:1,classList:{contains:()=>false},matches:selector=>selector==='svg.latte-trace-svg[aria-hidden="true"]'};
  const childNodes=[];
  value.split(/[♥♡]/).forEach((part,i)=>{if(i)childNodes.push(heart());if(part)childNodes.push(text(part))});
  if(trace)childNodes.push(svg);
  if(control)childNodes.push({nodeType:1,classList:{contains:()=>false},matches:()=>false});
  const element={childNodes,get children(){return childNodes.filter(n=>n.nodeType===1)},closest:()=>null,
    ownerDocument:{createTextNode:text},appendChild(node){childNodes.push(node)},
    insertBefore(node,before){childNodes.splice(childNodes.indexOf(before),0,node)}};
  return {element,svg,value:()=>childNodes.map(n=>n.nodeType===3?n.nodeValue:n.classList.contains('lena-heart')?'♥':'').join('').trim()};
}

test('drawn button borders do not prevent translating labels around heart icons',()=>{
  const api=translator(),button=label('Pull 2 shots ♥');
  assert.equal(api.translateHeartLabel(button.element),true);
  assert.equal(button.value(),'Préparer 2 expressos ♥');
  assert.ok(button.element.childNodes.includes(button.svg));
  api.setLanguage('en');api.translateHeartLabel(button.element);
  assert.equal(button.value(),'Pull 2 shots ♥');
  api.setLanguage('fr');api.translateHeartLabel(button.element);
  assert.equal(button.value(),'Préparer 2 expressos ♥');
});
test('recipe notes with a heart in the middle keep both translated text fragments',()=>{
  const api=translator(),note=label("THANK YOU ♥ for visiting Nana's little café.");
  api.translateHeartLabel(note.element);
  assert.equal(note.value(),'MERCI ♥ d’être passé·e au petit café de Nana.');
});
test('both milk receipts translate after heart decoration and preserve custom names',()=>{
  for(const milk of ['oat','whole'])for(const name of ['your original latte art','"Mon nuage ♥"']){
    const api=translator(),english=`Double espresso + 15 ml vanilla syrup + 160 ml ${milk} milk + ${name}. Made by you, with love ♥`;
    const receipt=label(english,{trace:false});
    assert.equal(api.translateHeartLabel(receipt.element),true);
    assert.ok(receipt.value().includes(milk==='oat'?'lait d’avoine':'lait entier'));
    assert.ok(receipt.value().includes(name.startsWith('"')?name:'ton dessin original'));
    assert.ok(receipt.value().endsWith('Préparé avec amour ♥'));
    api.setLanguage('en');api.translateHeartLabel(receipt.element);
    assert.equal(receipt.value(),english);
  }
});
test('steaming and pouring counters stay localized as their values change',()=>{
  const api=translator();
  assert.equal(api.translated('Steam milk · 2/3','fr'),'Faire mousser · 2/3');
  assert.equal(api.translated('Slow and steady… 80 ml poured.','fr'),'Doucement… 80 ml versés.');
});
test('nested interactive content is never rewritten as a single label',()=>{
  const api=translator(),mixed=label('Pull 2 shots ♥',{control:true});
  assert.equal(api.translateHeartLabel(mixed.element),false);
  assert.equal(mixed.value(),'Pull 2 shots ♥');
});
