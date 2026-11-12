/* Dependency-free checks for the GitHub Pages source, including inline scripts. */
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n');
const pages=new Set(['index.html','creations.html','shop.html','dreamlab.html','about-me.html','latte/index.html','tamagotchi/index.html','coloring-book/index.html','polaroids/index.html','apercu-recompense.html']);
const failures=[];
let scripts=0,references=0,json=0;
function checkScript(source,name){
  try{new vm.Script(source,{filename:name});scripts++;}
  catch(error){failures.push(`${name}: ${error.message}`);}
}
function checkLocal(url,file){
  if(!url||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url))return;
  const clean=decodeURIComponent(url.split(/[?#]/)[0]);
  const target=resolve(root,dirname(file),clean);
  references++;
  if(!existsSync(target))failures.push(`${file}: missing ${relative(root,target)}`);
}
for(const file of files){
  if(!/\.(?:js|html|css|json)$/.test(file))continue;
  const source=readFileSync(resolve(root,file),'utf8');
  if(file.endsWith('.js'))checkScript(source,file);
  if(file.endsWith('.json')){
    try{JSON.parse(source);json++;}catch(error){failures.push(`${file}: ${error.message}`);}
  }
  if(file.endsWith('.css')){
    for(const match of source.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g))checkLocal(match[2],file);
  }
  if(!file.endsWith('.html'))continue;
  let count=0;
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(!/\bsrc\s*=/.test(match[1])&&!/application\//.test(match[1]))checkScript(match[2],`${file}:inline-${++count}`);
  }
  if(!pages.has(file))continue;
  const markup=source.replace(/<!--[^]*?-->/g,'').replace(/<(script|style)\b[^>]*>[^]*?<\/\1>/gi,'');
  const ids=new Set(),imports=new Set();
  for(const match of markup.matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)){
    if(ids.has(match[2]))failures.push(`${file}: duplicate id ${match[2]}`);
    ids.add(match[2]);
  }
  for(const match of source.matchAll(/<(script|link)\b[^>]*\b(?:src|href)\s*=\s*(["'])(.*?)\2[^>]*>/gi)){
    const key=match[1]+':'+match[3].split(/[?#]/)[0];
    // A preload and a stylesheet/script can legitimately share a URL.
    if(/\brel\s*=\s*["']preload/.test(match[0]))continue;
    if(imports.has(key))failures.push(`${file}: duplicate import ${match[3]}`);
    imports.add(key);checkLocal(match[3],file);
  }
  for(const match of markup.matchAll(/<(?:img|image|iframe|audio|video|source)\b[^>]*\b(?:src|href)\s*=\s*(["'])(.*?)\1[^>]*>/gi))checkLocal(match[2],file);
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`Source OK: ${scripts} scripts, ${json} JSON files, ${references} local references; no duplicate page IDs or imports.`);
