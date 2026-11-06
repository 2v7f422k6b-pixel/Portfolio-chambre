import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../room-hover.js', import.meta.url), 'utf8');
function engine() {
  const elements = new Map();
  class Node {
    constructor(tag) {
      this.tag = tag; this.attrs = {}; this.children = [];
      this.style = {setProperty(){}};
      this.classList = {toggle(){}};
    }
    setAttribute(k,v) {this.attrs[k] = v; if(k === 'id') elements.set(v,this);}
    append(...children) {this.children.push(...children);}
    matches() {return false;}
  }
  const scene = new Node('div'), svg = new Node('svg');
  elements.set('play-scene', scene); elements.set('hotspots', svg);
  const document = {head: new Node('head'), getElementById: id => elements.get(id),
    createElementNS: (_,tag) => new Node(tag), createElement(tag) {
      if(tag !== 'canvas') return new Node(tag);
      const canvas = {width:0,height:0,toDataURL:()=> 'data:application/json,' + JSON.stringify({width:canvas.width,height:canvas.height,pixels:[...output]})};
      let input, output;
      canvas.getContext = () => ({drawImage:image=>{input=image},
        getImageData:()=>({data:input.pixels}), putImageData:image=>{output=image.data}});
      return canvas;
    }};
  const window = {};
  vm.runInNewContext(source, {window, document, ImageData:class {constructor(data,w,h){this.data=data;this.width=w;this.height=h}}});
  return window.NanaRoomHover;
}
function picture(w,h,solid) {
  const pixels = new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(solid(x,y))pixels[(y*w+x)*4+3]=255;
  return {pixels};
}
test('silhouettes retain their scene position and exclude transparent margins',()=>{
  const hover=engine(), image=picture(80,60,(x,y)=>x>=20&&x<=35&&y>=10&&y<=25);
  const layer=hover.silhouette(image,{x:100,y:200,width:80,height:60});
  assert.ok(hover.contains(layer,120,210));
  assert.ok(hover.contains(layer,135,225));
  assert.ok(!hover.contains(layer,119,210));
  assert.ok(!hover.contains(layer,136,225));
  assert.ok(!hover.contains(layer,120,209));
  assert.ok(layer.width<80 && layer.height<60);
  assert.equal(hover.maskFor(image),layer);
});
test('enclosed line drawings have one exterior contour, not outlines on every internal detail',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(40,40,(x,y)=>x>=5&&x<=30&&y>=5&&y<=30&&(x<=7||x>=28||y<=7||y>=28)),{x:0,y:0,width:40,height:40});
  assert.ok(hover.contains(layer,18,18));
  assert.ok(!hover.contains(layer,3,18));
});
test('objects touching the image edge do not wrap to another row or lose their edge',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(40,40,(x,y)=>x>=36&&y<=6),{x:0,y:0,width:40,height:40});
  assert.ok(hover.contains(layer,39,0));
  assert.ok(hover.contains(layer,36,6));
  assert.ok(!hover.contains(layer,0,1));
  assert.ok(!hover.contains(layer,35,6));
});
test('empty layers never produce a visible rectangle',()=>{
  assert.equal(engine().silhouette(picture(30,30,()=>false),{x:0,y:0,width:30,height:30}),null);
});

test('open red strokes are recoloured once, without generating white edges on both sides',()=>{
  const hover=engine(), image=picture(40,40,(x,y)=>x===20&&y>=5&&y<=30);
  const layer=hover.silhouette(image,{x:0,y:0,width:40,height:40},{lineArt:true});
  const rendered=JSON.parse(layer.outline.attrs.href.split(',').slice(1).join(','));
  const opacity=(x,y)=>rendered.pixels[((y-layer.y)*rendered.width+x-layer.x)*4+3];
  assert.equal(opacity(20,15),255);
  assert.equal(opacity(19,15),0);
  assert.equal(opacity(21,15),0);
  assert.equal(layer.outline.attrs.filter,'url(#nana-room-hover-ink)');
});
test('line-art display preserves empty interiors while hit-testing still fills them',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(40,40,(x,y)=>x>=5&&x<=30&&y>=5&&y<=30&&(x<=7||x>=28||y<=7||y>=28)),{x:0,y:0,width:40,height:40},{lineArt:true});
  const rendered=JSON.parse(layer.outline.attrs.href.split(',').slice(1).join(','));
  assert.equal(rendered.pixels[((18-layer.y)*rendered.width+18-layer.x)*4+3],0);
  assert.ok(hover.contains(layer,18,18));
});
