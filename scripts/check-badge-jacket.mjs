import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
for(const [,attrs,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(attrs.includes('application/json'))JSON.parse(body);else new vm.Script(body)}
const block=html.slice(html.indexOf('const BADGE_KEY='),html.indexOf('function badgeImage('));
const storage=new Map(),earned=new Set(['a','b','c','d','e','f','g']);
const env={progress:{stickers:[...'abcdefgh'].map(id=>({id,earned:()=>earned.has(id)})),isCreator:()=>false},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},slots:{},render(){},toast(){},bilingual:fr=>fr};
vm.createContext(env);vm.runInContext(block,env);
const run=code=>vm.runInContext(code,env);
run("toggleBadge('h')");assert.equal(run('badgeSelection.length'),0,'locked reward rejected');
run("toggleBadge('a')");assert.equal(env.slots.jackets,'jacket-badges');assert.equal(run('wornBadges().length'),1);
run("toggleBadge('a')");assert.equal(run('wornBadges().length'),0,'toggle removes');
run("for(const id of 'abcdefg')toggleBadge(id)");assert.equal(run('badgeSelection.length'),5,'five slots only');
assert.equal(JSON.parse(storage.get('nana-jacket-badges-v1')).length,5,'selection saved');
const other={...env,slots:{}};vm.createContext(other);vm.runInContext(block,other);assert.equal(vm.runInContext('badgeSelection.length',other),5,'reload restores');
earned.delete('a');assert.equal(run('wornBadges().length'),4,'revoked rewards hidden');
run("toggleBadge('b');toggleBadge('g')");assert.equal(run("badgeSelection.includes('g')"),true,'replace selected badge');
console.log('Badge selection, reward gating, persistence, capacity and syntax checks passed.');
