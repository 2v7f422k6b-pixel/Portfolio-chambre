import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../latte/game.js',import.meta.url),'utf8');
function game(respond=async()=>({ok:true})) {
  function element(dataset={}) {
    const classes=new Set();
    return {dataset,value:'',textContent:'',hidden:false,disabled:false,readOnly:false,style:{},attrs:{},events:{},
      classList:{toggle(name,on){on?classes.add(name):classes.delete(name);},remove(name){classes.delete(name);},contains(name){return classes.has(name);}},
      addEventListener(name,handler){this.events[name]=handler;},setAttribute(name,value){this.attrs[name]=value;},
      focus(){},reportValidity(){return true;},reset(){},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:500,height:500};}};
  }
  const els=new Map(),groups=new Map(),requests=[];
  const get=q=>{if(!els.has(q))els.set(q,element());return els.get(q);};
  groups.set('[data-step]',Array.from({length:6},(_,step)=>element({step:String(step)})));
  groups.set('[data-progress]',Array.from({length:5},(_,progress)=>element({progress:String(progress)})));
  groups.set('[data-milk]',['Oat','Whole'].map(milk=>element({milk})));
  groups.set('[data-tool]',['foam','cocoa','erase'].map(tool=>element({tool})));
  groups.set('#steam-meter i',Array.from({length:3},()=>element()));
  let art=false;
  const ctx={getImageData(){return {data:new Uint8ClampedArray([0,0,0,art?255:0])};},putImageData(image){art=!!image.data[3];},clearRect(){art=false;},save(){},restore(){},clip(){},beginPath(){},arc(){},fill(){art=true;},stroke(){art=true;},createRadialGradient(){return {addColorStop(){}};}};
  get('#art-canvas').getContext=()=>ctx;
  get('#latte-message').action='https://formspree.io/f/mbggaaqo';
  get('#latte-message').elements={_gotcha:{value:''}};
  get('#latte-message').reset=()=>{get('#visitor-name').value='';get('#visitor-message').value='';};
  const context={document:{querySelector:get,querySelectorAll:q=>groups.get(q)||[]},window:{location:{origin:'https://example.test'}},Path2D:class {ellipse(){}},FormData,AbortController,setTimeout,clearTimeout,
    fetch:async(url,options)=>{requests.push({url,options});return respond(url,options);}};
  vm.runInNewContext(source,context);
  const click=selector=>get(selector).events.click();
  function prepare(amount,milk='Oat') {
    click('#espresso-btn');click('#vanilla-btn');
    groups.get('[data-milk]').find(el=>el.dataset.milk===milk).events.click();
    for(let i=0;i<3;i++)click('#steam-btn');
    get('#pour').value=String(amount);get('#pour').events.input();click('#pour-next');
  }
  const submit=()=>get('#latte-message').events.submit({preventDefault(){}});
  return {get,groups,requests,click,prepare,submit};
}

test('any selected amount can reach drawing and is sent with the selected milk',async()=>{
  for(const amount of [0,40,80,160])for(const milk of ['Oat','Whole']){
    const g=game();g.prepare(amount,milk);
    assert.ok(g.groups.get('[data-step]')[4].classList.contains('active'));
    assert.equal(g.get('#pour-count').textContent,amount+' ml');
    g.click('#serve-btn');await g.submit();
    assert.equal(g.requests.length,1);
    assert.equal(g.requests[0].options.body.get('name'),'Anonyme');
    assert.equal(g.requests[0].options.body.get('recette'),'Double expresso + 15 ml de sirop de vanille + '+amount+' ml de '+(milk==='Oat'?'lait d’avoine':'lait entier'));
  }
});
test('drawing stays visible on the message page and undo/redo remain usable',()=>{
  const g=game();g.prepare(80);
  g.get('#art-canvas').events.pointerdown({clientX:242,clientY:232,pointerId:1,button:0,preventDefault(){}});
  g.get('#art-canvas').events.pointerup({pointerId:1});
  assert.equal(g.get('#undo-art').disabled,false);
  g.click('#undo-art');assert.equal(g.get('#clear-art').disabled,true);
  g.click('#redo-art');assert.equal(g.get('#clear-art').disabled,false);
  g.click('#serve-btn');
  assert.ok(g.get('#art-canvas').classList.contains('visible'));
  assert.equal(g.get('#art-canvas').classList.contains('enabled'),false);
});
test('a signed note is only sent once while pending or after success',async()=>{
  let complete;const g=game(()=>new Promise(resolve=>{complete=resolve;}));
  g.prepare(60);g.click('#serve-btn');
  g.get('#visitor-name').value='  Nana  ';g.get('#visitor-message').value='  Coucou ♡  ';
  const pending=g.submit();await g.submit();
  assert.equal(g.requests.length,1);assert.equal(g.get('#restart-btn').disabled,true);
  complete({ok:true});await pending;await g.submit();
  assert.equal(g.requests.length,1);assert.equal(g.requests[0].options.body.get('message'),'Coucou ♡');
  assert.equal(g.requests[0].options.body.get('name'),'Nana');assert.equal(g.get('#send-latte').hidden,true);
});
test('failed submissions keep the note and allow a deliberate retry',async()=>{
  let fail=true;const g=game(async()=>({ok:!fail}));
  g.prepare(90);g.click('#serve-btn');g.get('#visitor-message').value='Still here';
  await g.submit();assert.equal(g.get('#visitor-message').value,'Still here');
  assert.equal(g.get('#send-latte').disabled,false);assert.match(g.get('#send-status').textContent,/could not/);
  fail=false;await g.submit();assert.equal(g.requests.length,2);assert.equal(g.get('#send-latte').hidden,true);
  g.click('#restart-btn');assert.equal(g.get('#visitor-message').value,'');assert.equal(g.get('#send-latte').hidden,false);
  assert.equal(g.get('#art-canvas').classList.contains('visible'),false);
});
test('incomplete games and honeypot entries cannot send',async()=>{
  const g=game();await g.submit();assert.equal(g.requests.length,0);
  g.prepare(50);g.click('#serve-btn');g.get('#latte-message').elements._gotcha.value='bot';await g.submit();assert.equal(g.requests.length,0);
});
