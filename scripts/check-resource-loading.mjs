import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const {createQueue,matchesView}=createRequire(import.meta.url)('../resource-loading.js');
const source=readFileSync(new URL('../resource-loading.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('welcome, Work and day mode never require the inactive room or night variant',()=>{
  const day={mode:'play',theme:'day'},night={mode:'play',theme:'night'};
  assert.equal(matchesView(day,null,'day'),false);
  assert.equal(matchesView(day,'work','day'),false);
  assert.equal(matchesView(day,'play','day'),true);
  assert.equal(matchesView(night,'play','day'),false);
  assert.equal(matchesView({mode:'play'},'play','night'),true);
});
test('secondary jobs wait for the active view, stay bounded and pause across navigation',async()=>{
  let mode=null,ready=false,active=0,max=0;
  const scheduled=[],done=[],started=[];
  const queue=createQueue({eligible:m=>m===mode&&ready,schedule:cb=>scheduled.push(cb)});
  for(let i=0;i<5;i++)queue.add('play',()=>new Promise(resolve=>{
    started.push(i);max=Math.max(max,++active);done.push(()=>{active--;resolve();});
  }));
  assert.equal(scheduled.length,0);
  mode='work';ready=true;queue.wake();assert.equal(scheduled.length,0);
  mode='play';ready=false;queue.wake();assert.equal(scheduled.length,0);
  ready=true;queue.wake();scheduled.shift()();await tick();assert.deepEqual(started,[0,1]);
  mode='work';done.shift()();done.shift()();await tick();assert.equal(scheduled.length,0);
  mode='play';queue.wake();scheduled.shift()();await tick();assert.deepEqual(started,[0,1,2,3]);
  done.shift()();await tick();scheduled.shift()();await tick();assert.deepEqual(started,[0,1,2,3,4]);
  done.splice(0).forEach(f=>f());await tick();assert.equal(max,2);
});
test('a failed secondary asset releases its slot for subsequent jobs',async()=>{
  const scheduled=[],ran=[];
  const queue=createQueue({eligible:()=>true,schedule:cb=>scheduled.push(cb),limit:1});
  queue.add('play',()=>Promise.reject(new Error('offline')));
  queue.add('play',()=>ran.push('next'));
  scheduled.shift()();await tick();scheduled.shift()();await tick();assert.deepEqual(ran,['next']);
});

function browser(){
  const nodes=[],observers=[];
  const dataName=key=>'data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
  class Element{
    constructor(tag='img'){
      this.localName=tag;this.attrs=new Map();this.isConnected=true;this.parentElement=null;
      this.rect={left:0,top:0,right:80,bottom:80,width:80,height:80};
      this.style={setProperty:(key,value)=>this.attrs.set('style:'+key,value)};
      this.dataset=new Proxy({},{get:(_,key)=>this.attrs.get(dataName(key)),set:(_,key,value)=>{this.attrs.set(dataName(key),value);return true;}});
      nodes.push(this);
    }
    getAttribute(key){return this.attrs.get(key)||null;}
    setAttribute(key,value){this.attrs.set(key,String(value));}
    hasAttribute(key){return this.attrs.has(key);}
    getBoundingClientRect(){return this.rect;}
    closest(selector){return (selector.includes('hidden')&&this.hidden)||(selector.includes('load-ignore')&&this.ignore)?this:null;}
  }
  const document={documentElement:{dataset:{}},hidden:false,addEventListener(){},contains:node=>node.isConnected,
    querySelectorAll:()=>nodes.filter(node=>['resourceSrc','resourceHref','resourceBackground'].some(key=>node.dataset[key]))};
  const window={};
  class IntersectionObserver{
    constructor(callback){this.callback=callback;this.observed=new Set();observers.push(this);}
    observe(node){this.observed.add(node);}
    unobserve(node){this.observed.delete(node);}
  }
  vm.runInNewContext(source,{window,document,IntersectionObserver,innerWidth:400,innerHeight:600,setTimeout,clearTimeout,
    getComputedStyle:element=>element.computed||{display:'block',overflow:'visible',overflowX:'visible',overflowY:'visible'}});
  return {api:window.NanaResources,Element,observer:observers[0],document};
}
test('dynamic room sources stay deferred until selection; returning retains the same originals',()=>{
  const {api,Element}=browser(),day=new Element(),night=new Element();
  api.setSource(day,'original-day.png',{theme:'day'});api.setSource(night,'original-night.png',{theme:'night'});
  assert.equal(day.getAttribute('src'),null);assert.equal(night.getAttribute('src'),null);
  api.activate('work','day');assert.equal(day.getAttribute('src'),null);
  api.activate('play','day');assert.equal(day.getAttribute('src'),'original-day.png');assert.equal(night.getAttribute('src'),null);
  api.activate('play','night');assert.equal(night.getAttribute('src'),'original-night.png');assert.equal(api.required(day),false);
  api.activate(null);api.activate('play','day');assert.equal(day.getAttribute('src'),'original-day.png');
});
test('only the chosen Work wallpaper receives a CSS image URL',()=>{
  const {api,Element}=browser(),day=new Element('div'),night=new Element('div');
  for(const [node,theme] of [[day,'day'],[night,'night']]){
    Object.assign(node.dataset,{resourceMode:'work',resourceTheme:theme,resourceBackground:`original-${theme}.png`});
  }
  api.activate('play','day');assert.equal(day.getAttribute('style:--nana-work-background'),null);
  api.activate('work','night');assert.equal(day.getAttribute('style:--nana-work-background'),null);
  assert.equal(night.getAttribute('style:--nana-work-background'),'url("original-night.png")');
});
test('a cold or failed theme uses the loading gate instead of a short snapshot deadline',()=>{
  const {api,Element}=browser(),night=new Element();
  api.setSource(night,'night.png',{theme:'night'});
  assert.equal(api.themeReady('play','night'),false);
  api.activate('play','night');night.complete=true;night.naturalWidth=0;
  assert.equal(api.themeReady('play','night'),false);
  night.naturalWidth=3072;assert.equal(api.themeReady('play','night'),true);
});
test('catalogue SVGs fetch their unchanged source only as their crop approaches the viewport',()=>{
  const {api,Element,observer}=browser(),svg=new Element('svg'),image=new Element('image');
  svg.setAttribute('viewBox','613 708 738 830');
  api.lazySource(image,'original-2048x3072.png',svg);
  api.activate('play');assert.equal(image.getAttribute('href'),null);
  observer.callback([{target:svg,isIntersecting:false}]);assert.equal(image.getAttribute('href'),null);
  observer.callback([{target:svg,isIntersecting:true}]);assert.equal(image.getAttribute('href'),'original-2048x3072.png');
  assert.equal(svg.getAttribute('viewBox'),'613 708 738 830');assert.equal(observer.observed.size,0);
});
test('opening a gallery waits for visible thumbnails, not hidden pages or clipped rows',()=>{
  const {api,Element,document}=browser(),first=new Element('image'),offscreen=new Element('image'),hidden=new Element('image');
  const pane=new Element('div');pane.rect={left:0,top:0,right:200,bottom:100,width:200,height:100};
  pane.computed={display:'block',overflow:'auto',overflowX:'auto',overflowY:'auto'};
  offscreen.parentElement=pane;offscreen.rect={left:0,top:130,right:80,bottom:210,width:80,height:80};hidden.hidden=true;
  for(const [i,node] of [first,offscreen,hidden].entries())api.lazySource(node,`item-${i}.png`);
  api.loadVisible(document);assert.equal(first.getAttribute('href'),'item-0.png');
  assert.equal(offscreen.getAttribute('href'),null);assert.equal(hidden.getAttribute('href'),null);
});
test('switching catalogue category releases observers for removed thumbnails',()=>{
  const {api,Element,observer}=browser(),image=new Element('image');
  api.lazySource(image,'old-category.png');assert.equal(observer.observed.size,1);
  image.isConnected=false;api.pruneLazy();assert.equal(observer.observed.size,0);assert.equal(image.getAttribute('href'),null);
});
