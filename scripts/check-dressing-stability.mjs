import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
test('inventory keeps existing image sources during repeated selection pagination',()=>{
 const source=readFileSync(new URL('../nana-dressing-looks.js',import.meta.url),'utf8');
 const start=source.indexOf('for(const card of cards.filter');
 const code=source.slice(start,source.indexOf('    pager.innerHTML=',start));
 let writes=0;const images=['resourceHref','resourceSrc'].map(key=>({dataset:{[key]:'art.png'},attrs:{},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v;writes++}}));
 const env={cards:[{hidden:false,querySelectorAll:()=>images}]};
 vm.runInNewContext(code,env);assert.equal(writes,2);
 vm.runInNewContext(code,env);assert.equal(writes,2,'unchanged SVG href/src must not restart painting');
});
test('old avatar remains intact until the next outfit is loaded and decoded',async()=>{
 let releaseReady,releaseDecode;
 const ready=new Promise(r=>releaseReady=r),decoded=new Promise(r=>releaseDecode=r);
 const visible={children:['previous'],setAttribute(){},removeAttribute(){},replaceChildren(...nodes){this.children=nodes}};
 const image={tagName:'IMG',dataset:{},style:{},addEventListener(){},decode:()=>decoded};
 const node={childNodes:[],appendChild(n){this.childNodes.push(n)},querySelectorAll:()=>[image]};
 const env={avatarRevision:0,$:()=>visible,slots:{},geometry:{ready:()=>ready,process:()=>[{src:'new.png',z:1}]},
  outfitLayers:()=>[],editorSlots:()=>({}),COLLAR_PATHS:{},badgeCarrier:()=>null,
  document:{createElement:()=>node,documentElement:{lang:'fr'}},overlayImage:()=>image,
  lookPreview:true,presets:[],allSlots:[]};
 const code=html.slice(html.indexOf('async function renderAvatar(){'),html.indexOf('// Show the artwork bounds'));
 vm.runInNewContext(code,env);const render=env.renderAvatar();
 assert.deepEqual(visible.children,['previous']);releaseReady();
 await new Promise(r=>setImmediate(r));assert.deepEqual(visible.children,['previous']);
 releaseDecode();await render;assert.equal(visible.children[0],image);
});
test('old pastel shoe ID migrates to corrected heels and all glasses are in jewellery',()=>{
 const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
 assert(!data.items['shoes-pastel-sneakers']);assert.equal(data.aliases['shoes-pastel-sneakers'],'shoes-blue-heels');
 for(const id of ['head-inspector-glasses','head-oval-glasses','head-pink-glasses'])assert.equal(data.items[id][1],'jewelry');
});
