import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
const block=html.slice(html.indexOf('const correctionFile='),html.indexOf('const collarCache'));
const env={slots:{},FITTED:data.fitted,SPRITES:data.sprites};vm.createContext(env);vm.runInContext(block+';this.maps={COAT_CORRECTIONS,YELLOW_SKIRT_CORRECTIONS,HAT_HAIR_CORRECTIONS,BAG_CHARM_FILES,UPDATED_COAT_FILES};this.resolve=correctedSource;',env);
test('all 35 artist exports are mapped to existing items and files',()=>{
 const ns=new Set([23,35]);for(const map of [env.maps.COAT_CORRECTIONS,env.maps.YELLOW_SKIRT_CORRECTIONS,env.maps.HAT_HAIR_CORRECTIONS])for(const [id,n]of Object.entries(map)){assert(data.items[id],id);ns.add(n)}
 for(const [id,src]of Object.entries(env.maps.BAG_CHARM_FILES['bag-crochet'])){assert(data.items[id]);ns.add(Number(src.match(/-(\d+)\.png/)[1]))}
 assert.equal(ns.size,35);for(const n of ns)assert(existsSync(new URL('../assets/dressing-lena/corrections/Illustration_sans_titre-'+n+'.png',import.meta.url)));
});
test('five shortened tops apply only to yellow skirt and revert on every other skirt',()=>{
 for(const [id,n]of Object.entries(env.maps.YELLOW_SKIRT_CORRECTIONS))for(const skirt of Object.keys(data.items).filter(id=>id.startsWith('skirt-'))){env.slots={skirts:skirt};assert.equal(env.resolve(id),skirt==='skirt-princess'?(id==='top-plantasia'?'assets/dressing-lena/IMG_6235.png':`assets/dressing-lena/corrections/Illustration_sans_titre-${n}.png`):data.fitted[id]||data.sprites[id]);}
});
test('19 lower variants apply under all three coats and restore the original afterwards',()=>{
 for(const [id,n]of Object.entries(env.maps.COAT_CORRECTIONS))for(const coat of ['jacket-inspector','jacket-green','jacket-george-sand',null,'jacket-fleece']){env.slots={jackets:coat};assert.equal(env.resolve(id),coat&&coat!=='jacket-fleece'?(env.maps.UPDATED_COAT_FILES[id]||`assets/dressing-lena/corrections/Illustration_sans_titre-${n}.png`):data.fitted[id]||data.sprites[id]);}
});
test('crochet closed-loop charms never replace cushion bag sources',()=>{
 for(const [id,src]of Object.entries(env.maps.BAG_CHARM_FILES['bag-crochet'])){env.slots={bags:'bag-crochet'};assert.equal(env.resolve(id),src);env.slots={bags:'bag-brown'};assert.equal(env.resolve(id),id==='charm-treasures'?'assets/dressing-lena/IMG_6229.png':data.fitted[id]||data.sprites[id]);}
});
