import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../window-bounds.js',import.meta.url),'utf8');
function run({width=1024,height=700,barBottom=46,visual}={}){
  const styles=new Map(),events=new Map(),frames=[];
  const bar={getBoundingClientRect:()=>({bottom:barBottom})};
  let observe;
  const window={innerWidth:width,innerHeight:height,addEventListener:(name,fn)=>events.set(name,fn)};
  if(visual)window.visualViewport={...visual,addEventListener:(name,fn)=>events.set('visual:'+name,fn)};
  const document={documentElement:{style:{getPropertyValue:name=>styles.get(name),setProperty:(name,value)=>styles.set(name,value)}},getElementById:id=>id==='menubar'?bar:null};
  vm.runInNewContext(source,{window,document,requestAnimationFrame:fn=>frames.push(fn),ResizeObserver:class{constructor(fn){observe=fn}observe(){}}});
  return {window,styles,events,barResize:()=>observe(),setBar:bottom=>{barBottom=bottom},flush:()=>{while(frames.length)frames.shift()()}};
}
test('actual navigation height is reserved, including a taller menu',()=>{
  const page=run();
  assert.equal(page.styles.get('--nana-window-top-safe'),'58px');
  page.setBar(80);page.barResize();page.flush();
  assert.equal(page.styles.get('--nana-window-top-safe'),'92px');
});
test('rotation updates both the mobile margin and the available viewport',()=>{
  const page=run();page.window.innerWidth=740;page.window.innerHeight=360;page.setBar(56);
  page.events.get('resize')();page.flush();
  assert.equal(page.styles.get('--nana-window-top-safe'),'64px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'360px');
});
test('a software keyboard uses the visible viewport without double-scaling pinch zoom',()=>{
  const page=run({width:390,height:740,barBottom:56,visual:{scale:1,offsetTop:80,height:300}});
  assert.equal(page.styles.get('--nana-window-top-safe'),'88px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'380px');
  page.window.visualViewport.scale=2;page.events.get('visual:resize')();page.flush();
  assert.equal(page.styles.get('--nana-window-top-safe'),'64px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'740px');
});
