import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const manifest=JSON.parse(read('assets/room-compact/manifest.json'));
const html=read('index.html').toString();
test('compact room layers match current originals and preserve SVG registration',()=>{
  assert.equal(manifest.length,20);
  for(const entry of manifest){
    assert.equal(createHash('sha256').update(read(entry.source)).digest('hex'),entry.source_sha256,'Regenerate room crops after replacing '+entry.source);
    const png=read(entry.target);assert.equal(png.readUInt32BE(16),entry.size[0]);assert.equal(png.readUInt32BE(20),entry.size[1]);
    const tag=html.match(/<image\b[^>]*>/g).find(tag=>tag.includes('"'+entry.target+'"'));assert(tag);
    const attr=name=>Number(tag.match(new RegExp('\\s'+name+'="([^"]+)"'))[1]);
    assert(Math.abs(attr('x')-entry.box[0]*1670/3072)<1e-8);assert(Math.abs(attr('y')-entry.box[1]*942/1732)<1e-8);
    assert(Math.abs(attr('width')-entry.size[0]*1670/3072)<1e-8);assert(Math.abs(attr('height')-entry.size[1]*942/1732)<1e-8);
  }
});
