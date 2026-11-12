import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../window-bounds.js',import.meta.url),'utf8');
function run({width=1024,layoutWidth=width,height=700,layoutHeight=height,barBottom=46,visual}={}){
  const styles=new Map(),events=new Map(),frames=[];
  const bar={getBoundingClientRect:()=>({bottom:barBottom})};
  let observe;
  const window={innerWidth:width,innerHeight:height,addEventListener:(name,fn)=>events.set(name,fn)};
  if(visual)window.visualViewport={...visual,addEventListener:(name,fn)=>events.set('visual:'+name,fn)};
  const document={documentElement:{clientWidth:layoutWidth,clientHeight:layoutHeight,style:{getPropertyValue:name=>styles.get(name),setProperty:(name,value)=>styles.set(name,value)}},getElementById:id=>id==='menubar'?bar:null};
  vm.runInNewContext(source,{window,document,requestAnimationFrame:fn=>frames.push(fn),ResizeObserver:class{constructor(fn){observe=fn}observe(){}}});
  return {window,document,styles,events,barResize:()=>observe(),setBar:bottom=>{barBottom=bottom},flush:()=>{while(frames.length)frames.shift()()}};
}
test('actual navigation height is reserved, including a taller menu',()=>{
  const page=run();
  assert.equal(page.styles.get('--nana-window-top-safe'),'58px');
  page.setBar(80);page.barResize();page.flush();
  assert.equal(page.styles.get('--nana-window-top-safe'),'92px');
});
test('rotation updates both the mobile margin and the available viewport',()=>{
  const page=run();page.window.innerWidth=740;page.window.innerHeight=360;page.setBar(56);
  page.document.documentElement.clientHeight=360;
  page.document.documentElement.clientWidth=740;
  page.events.get('resize')();page.flush();
  assert.equal(page.styles.get('--nana-window-top-safe'),'64px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'360px');
  assert.equal(page.styles.get('--nana-layout-height'),'360px');
  assert.equal(page.styles.get('--nana-layout-width'),'740px');
});

test('horizontal pinch and panning do not shrink the desktop to the visual viewport',()=>{
  const page=run({width:1024,visual:{scale:1.5,width:682,offsetLeft:130,offsetTop:0,height:460}});
  assert.equal(page.styles.get('--nana-layout-width'),'1024px');
  page.window.visualViewport.width=512;page.window.visualViewport.scale=2;
  page.events.get('visual:resize')();page.flush();
  assert.equal(page.styles.get('--nana-layout-width'),'1024px');
});
test('rotation and restoration replace the previous width in both directions',()=>{
  const page=run({width:820});
  for(const [event,width] of [['orientationchange',1180],['resize',820],['pageshow',1180]]){
    page.window.innerWidth=width;page.document.documentElement.clientWidth=width;
    page.events.get(event)();page.flush();
    assert.equal(page.styles.get('--nana-layout-width'),width+'px');
  }
});
test('overflowing content cannot enlarge navigation or dialog width',()=>{
  const page=run({width:1400,layoutWidth:740});
  assert.equal(page.styles.get('--nana-layout-width'),'740px');
  assert.equal(page.styles.get('--nana-window-top-safe'),'54px');
});
test('a software keyboard uses the visible viewport without double-scaling pinch zoom',()=>{
  const page=run({width:390,height:740,barBottom:56,visual:{scale:1,offsetTop:80,height:300}});
  assert.equal(page.styles.get('--nana-window-top-safe'),'88px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'380px');
  page.window.visualViewport.scale=2;page.events.get('visual:resize')();page.flush();
  assert.equal(page.styles.get('--nana-window-top-safe'),'64px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'740px');
});

test('keyboard opening and dismissal never collapse the desktop into its visible strip',()=>{
  const page=run({width:390,height:740,barBottom:56,visual:{scale:1,offsetTop:0,height:740}});
  page.window.innerHeight=340;
  page.window.visualViewport.height=340;
  page.events.get('visual:resize')();page.flush();
  assert.equal(page.styles.get('--nana-layout-height'),'740px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'340px');
  page.window.innerHeight=740;
  page.window.visualViewport.height=740;
  page.events.get('visual:resize')();page.flush();
  assert.equal(page.styles.get('--nana-layout-height'),'740px');
  assert.equal(page.styles.get('--nana-window-viewport-bottom'),'740px');
});

test('pinch zoom leaves room geometry intact and browser-toolbar expansion is recovered',()=>{
  const page=run({width:390,height:660,visual:{scale:2,offsetTop:90,height:330}});
  assert.equal(page.styles.get('--nana-layout-height'),'660px');
  page.window.visualViewport.scale=1;
  page.window.visualViewport.height=740;
  page.window.innerHeight=740;
  page.events.get('pageshow')();page.flush();
  assert.equal(page.styles.get('--nana-layout-height'),'740px');
});
