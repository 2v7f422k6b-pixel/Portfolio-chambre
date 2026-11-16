import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../room-object-motion.js',import.meta.url),'utf8');
function setup({reducedMotion=false}={}){
  const animations=[],events={},documentEvents={};
  class Element{
    constructor(tag='g'){this.tag=tag;this.attrs={};this.style={};this.children=[];}
    setAttribute(k,v){this.attrs[k]=String(v);}
    getAttribute(k){return this.attrs[k]??null;}
    removeAttribute(k){delete this.attrs[k];}
    append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
    prepend(node){node.parent=this;this.children.unshift(node);}
    remove(){this.parent.children=this.parent.children.filter(x=>x!==this);}
    cloneNode(){const clone=new Element(this.tag);clone.attrs={...this.attrs};clone.style={...this.style};return clone;}
    querySelector(tag){return this.children.find(x=>x.tag===tag);}
    getBBox(){return{x:381,y:512,width:142,height:82};}
    animate(frames,options){const animation={el:this,frames,options,cancelled:false,cancel(){if(this.cancelled)return;this.cancelled=true;this.oncancel?.();}};animations.push(animation);return animation;}
  }
  const berry=new Element(),van=new Element(),scene=new Element(),hit=new Element('polygon');
  for(const theme of ['day','night']){const image=new Element('image');Object.assign(image.attrs,{x:'381',y:'512',width:'142',height:'82',href:theme+'.png'});berry.append(image);}
  const originals=berry.children.slice();
  const document={head:new Element('head'),hidden:false,createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag),getElementById:id=>({'happy-berry-art':berry,'volkswagen-visual':van,'play-scene':scene})[id],addEventListener:(type,fn)=>{documentEvents[type]=fn;}};
  const media={matches:reducedMotion,addEventListener(type,fn){this.changed=fn;}};
  const window={matchMedia:()=>media,addEventListener:(type,fn)=>{events[type]=fn;}};
  vm.runInNewContext(source,{window,document});
  return{play:window.NanaRoomObjectMotion.play,berry,van,hit,scene,originals,animations,events,documentEvents,document,media};
}
test('Happy Berry can replay without accumulating drawings or reloading room images',()=>{
  const s=setup();
  s.play('happy-berry',s.hit);
  assert.equal(s.originals[0].style.visibility,'hidden');
  const parts=s.berry.children.find(x=>x.getAttribute('data-berry-flight-parts')!==null);
  assert.equal(parts.getAttribute('data-nana-load-ignore'),'','Temporary image copies must not restart the room loader');
  const count=s.animations.length;
  s.play('happy-berry',s.hit);assert.equal(s.animations.length,count,'Repeated taps do not restart or stack a flight');
  s.animations[0].onfinish();
  assert.deepEqual(s.berry.children,s.originals);assert.equal(s.originals[0].style.visibility,undefined);
  assert.equal(s.scene.getAttribute('data-berry-flying'),null);
  s.play('happy-berry',s.hit);assert.equal(s.animations.length,count*2);
  s.events.hashchange();assert.deepEqual(s.berry.children,s.originals);assert(s.animations.every(x=>x.cancelled));
});
test('Van returns to its exact resting position, including when navigation interrupts the trip',()=>{
  const s=setup();s.van.style.transformOrigin='old-origin';s.hit.style.transformOrigin='old-hit-origin';
  s.play('volkswagen',s.hit);
  assert.deepEqual(s.animations[0].frames[0].transform,s.animations[0].frames.at(-1).transform);
  s.document.hidden=true;s.documentEvents.visibilitychange();
  assert.equal(s.van.style.transformOrigin,'old-origin');assert.equal(s.hit.style.transformOrigin,'old-hit-origin');
  assert.equal(s.van.getAttribute('data-motion-playing'),null);
  s.play('volkswagen',s.hit);assert.equal(s.animations.length,4);
});
test('Reduced motion skips both journeys and cancels a flight cleanly if enabled mid-animation',()=>{
  const s=setup({reducedMotion:true});
  assert.equal(s.play('happy-berry',s.hit),false);assert.equal(s.play('volkswagen',s.hit),false);assert.equal(s.animations.length,0);
  s.media.matches=false;s.play('happy-berry',s.hit);s.media.matches=true;s.media.changed();
  assert.deepEqual(s.berry.children,s.originals);assert(s.animations.every(x=>x.cancelled));
});
