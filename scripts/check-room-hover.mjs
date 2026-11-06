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

function renderedMask(layer) {
  const rendered = JSON.parse(layer.outline.attrs.href.split(',').slice(1).join(','));
  return (x,y) => x < layer.x || y < layer.y || x >= layer.x + rendered.width || y >= layer.y + rendered.height
    ? 0 : rendered.pixels[((y-layer.y)*rendered.width+x-layer.x)*4+3];
}
test('the displayed mask fills a character with internal details before drawing its exterior ring',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(60,60,(x,y)=>{
    const outline=x>=5&&x<=50&&y>=5&&y<=50&&(x<=7||x>=48||y<=7||y>=48);
    const eyes=(x===20||x===35)&&y>=18&&y<=22;
    const clothes=y===35&&x>=15&&x<=40;
    return outline||eyes||clothes;
  }),{x:0,y:0,width:60,height:60});
  const opacity=renderedMask(layer);
  for(let y=8;y<=47;y++)for(let x=8;x<=47;x++)assert.equal(opacity(x,y),255);
  assert.equal(opacity(3,25),0);
  assert.equal(layer.outline.attrs.filter,'url(#nana-room-hover-ring)');
  assert.equal(layer.outline.attrs.href,layer.filledHref);
});
test('small gaps in hand-drawn boundaries cannot expose internal details to the halo',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(60,60,(x,y)=>{
    const outline=x>=5&&x<=50&&y>=5&&y<=50&&(x===5||x===50||y===5||y===50);
    const gap=y===5&&x>=25&&x<=27;
    return (outline&&!gap)||(x===25&&y>=20&&y<=30);
  }),{x:0,y:0,width:60,height:60});
  const opacity=renderedMask(layer);
  assert.equal(opacity(24,24),255);
  assert.equal(opacity(26,24),255);
  assert.ok(hover.contains(layer,30,30));
  assert.equal(opacity(30,3),0);
});
test('concave exterior boundaries and disconnected parts stay distinct',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(70,60,(x,y)=>{
    const u=x>=5&&x<=35&&y>=5&&y<=45&&(x<=10||x>=30||y>=40);
    const separate=x>=50&&x<=60&&y>=20&&y<=30;
    return u||separate;
  }),{x:0,y:0,width:70,height:60});
  const opacity=renderedMask(layer);
  assert.equal(opacity(20,20),0);
  assert.equal(opacity(43,25),0);
  assert.equal(opacity(55,25),255);
  assert.ok(!hover.contains(layer,43,25));
});
test('line-art halos contain no pixels on interior features or either side of them',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(60,60,(x,y)=>{
    const outline=x>=5&&x<=50&&y>=5&&y<=50&&(x<=7||x>=48||y<=7||y>=48);
    return outline||(x===20&&y>=20&&y<=30)||(y===35&&x>=15&&x<=40);
  }),{x:100,y:200,width:60,height:60},{lineArt:true});
  const opacity=renderedMask(layer);
  for(let y=208;y<=247;y++)for(let x=108;x<=147;x++)assert.equal(opacity(x,y),0);
  assert.equal(opacity(104,225),255);
  assert.equal(opacity(105,225),0);
  assert.equal(layer.outline.attrs.filter,'none');
  assert.ok(hover.contains(layer,125,225));
});
test('wide interruptions close the silhouette without drawing a new line across the gap',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(80,80,(x,y)=>{
    const outline=x>=5&&x<=70&&y>=5&&y<=70&&(x===5||x===70||y===5||y===70);
    const gap=y===70&&x>=29&&x<=47;
    return (outline&&!gap)||(x===38&&y>=20&&y<=40);
  }),{x:0,y:0,width:80,height:80},{lineArt:true,gapRadius:12});
  const opacity=renderedMask(layer);
  assert.ok(hover.contains(layer,38,50));
  assert.equal(opacity(37,30),0);
  assert.equal(opacity(39,30),0);
  assert.ok(opacity(38,71)<16);
  assert.equal(opacity(10,71),255);
});
test('art cropped at the room edge still has a filled interior and no invented cut line',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(80,80,(x,y)=>{
    return x>=5&&y>=5&&y<=70&&(x===5||y===5||y===70)||(x===40&&y>=30&&y<=40);
  }),{x:0,y:0,width:80,height:80},{lineArt:true});
  const opacity=renderedMask(layer);
  assert.ok(hover.contains(layer,79,30));
  assert.equal(opacity(39,35),0);
  assert.equal(opacity(41,35),0);
  assert.equal(opacity(80,30),0);
  assert.equal(opacity(4,30),255);
});
test('right and bottom room contours include their halo without a position-dependent SVG filter',()=>{
  const hover=engine();
  const layer=hover.silhouette(picture(60,60,(x,y)=>x>=10&&x<=40&&y>=10&&y<=40),
    {x:1600,y:880,width:60,height:60},{lineArt:true});
  const opacity=renderedMask(layer);
  assert.equal(layer.outline.attrs.filter,'none');
  assert.equal(opacity(1641,905),255);
  assert.equal(opacity(1625,921),255);
  assert.ok(opacity(1644,905)>0 && opacity(1644,905)<255);
  assert.ok(opacity(1625,924)>0 && opacity(1625,924)<255);
  assert.equal(opacity(1625,905),0);
});
test('shelf contact removes the bottom line and halo while preserving sides and the hit area',()=>{
  const hover=engine(), image=picture(80,80,(x,y)=>x>=10&&x<=60&&y>=10&&y<=50+x/5);
  const box={x:100,y:200,width:80,height:80};
  const uncut=hover.silhouette(image,box,{lineArt:true});
  const cut=hover.silhouette(image,box,{lineArt:true,supportLine:[100,250,180,266]});
  const opacity=renderedMask(cut);
  assert.deepEqual([...cut.alpha],[...uncut.alpha]);
  assert.equal(opacity(109,230),255);
  assert.equal(opacity(130,209),255);
  for(let y=200;y<280;y++)for(let x=100;x<180;x++) {
    if(y>=250+(x-100)/5-1) assert.equal(opacity(x,y),0,`shelf spill at ${x},${y}`);
  }
});
