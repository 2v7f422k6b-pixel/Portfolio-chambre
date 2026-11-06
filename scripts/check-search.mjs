import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function catalog() {
  const opened=[];
  const window={
    openApp:(...args)=>opened.push(args),
    openMotionAt:file=>opened.push(['video',file]),
    portfolioArtworkIndex:file=>file==='swans-lotus.jpg'?18:-1
  };
  vm.runInNewContext(readFileSync(new URL('../portfolio-catalog.js',import.meta.url),'utf8'),{
    window,document:{querySelectorAll:()=>[]},fetch:async()=>({ok:false})
  });
  return {search:window.NanaPortfolioSearch,window,opened};
}

test('either search opens the selected illustration, including the last artwork',()=>{
  const {search,opened}=catalog();
  search.openItem({title:'Swans and Lotus',project:'swans-lotus.jpg',open:'photos'});
  assert.deepEqual(opened,[['artwork',18]]);
});

test('unknown images fall back to their section instead of opening artwork -1',()=>{
  const {search,opened}=catalog();
  search.openItem({project:'unknown.jpg',open:'photos'});
  assert.deepEqual(opened,[['photos']]);
});

test('videos retain their direct player destination',()=>{
  const {search,opened}=catalog();
  search.openItem({project:'animation.mov',category:'Animation',video:'assets/animation.mov',open:'motion'});
  assert.deepEqual(opened,[['video','animation.mov']]);
});

test('accented queries and catalog items without tags remain searchable',()=>{
  const {search}=catalog();
  assert.equal(search.matches({title:'Éditorial'},search.normalize('EDITORIAL')),true);
  assert.equal(search.matches({title:'Illustration',tags:['été']},search.normalize('ete')),true);
  assert.equal(search.matches({title:'Illustration'},search.normalize('music')),false);
});

test('mini-games and ordinary folders use the same public app router',()=>{
  const {search,opened}=catalog();
  search.openItem({open:'coloring'});
  search.openItem({open:'mini-games'});
  search.openItem({});
  assert.deepEqual(opened,[['coloring'],['mini-games'],['finder']]);
});
