(()=>{
const projects=[['La Princesse Clown','Illustration & Editorial','book','clown-princess'],['GABZILLA','Illustration','gabzilla','gabzilla'],['Original illustrations','Illustration','photos','illustration'],['Music & Visuals','Music','music','music-visuals']];
function init(){
const grid=document.querySelector('#work-desktop .folder-grid');if(!grid)return;
const extras=document.createElement('div');extras.className='desk-extras';
const panel=document.createElement('div');panel.className='desk-panel';panel.hidden=true;
const title=document.createElement('h3'),content=document.createElement('div'),close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','Close');close.onclick=()=>panel.hidden=true;panel.append(close,title,content);
const show=name=>{title.textContent=name;content.replaceChildren();panel.hidden=false};
const line=value=>{const p=document.createElement('p');p.textContent=value;content.append(p)};
const projectButton=p=>{const b=document.createElement('button');b.className='desk-project-link';b.textContent=p[0]+' · '+p[1];b.onclick=()=>{panel.hidden=true;const target=document.querySelector('[data-open="'+p[2]+'"]');target?.click()};content.append(b)};
const entries=[
['✎','Currently working on…',()=>{show('Currently working on…');line('A place for work in progress. New updates coming soon.');projectButton(projects[0])}],
['▧','Latest additions',()=>{show('Latest additions');line('Selected creations currently available in the portfolio.');projects.slice(0,3).forEach(projectButton)}],
['ⓘ','Get Info',()=>{show('Get Info');line('Select a project to see its category and related work.');projects.forEach(p=>{const b=document.createElement('button');b.className='desk-project-link';b.textContent=p[0];b.onclick=()=>{show(p[0]);line('Category: '+p[1]);line('Project: '+p[3]);projectButton(p);(window.portfolioRelated?.(p[3])||[]).filter(x=>x.title!==p[0]).forEach(x=>line('Related: '+x.title))};content.append(b)})}],
['▤','Scrapped Ideas',()=>{show('Scrapped Ideas');line('Sketches, unfinished experiments and ideas to revisit.');line('This archive is waiting for its first entries.')}] ];
for(const [icon,name,action] of entries){if(name==='Latest additions'||name==='Get Info')continue;const b=document.createElement('button');b.className='desk-extra';b.dataset.object=name==='Currently working on…'?'postit':'trash';b.innerHTML='<span class="desk-extra-icon">'+(b.dataset.object==='trash'?'<img class="custom-trash-art" src="assets/corbeille.png" alt="">':icon)+'</span><span>'+name+'</span>';b.onclick=action;extras.append(b)}
// Custom art replaces, rather than overlays, the legacy trash glyph.
const css=document.createElement('style');
css.textContent='#work-desktop .desk-extra[data-object="trash"] .desk-extra-icon{background:none!important;background-image:none!important;border:0!important;box-shadow:none!important;filter:none!important;font-size:0!important}#work-desktop .desk-extra[data-object="trash"] .desk-extra-icon::before,#work-desktop .desk-extra[data-object="trash"] .desk-extra-icon::after,#work-desktop .desk-extra[data-object="trash"]::before,#work-desktop .desk-extra[data-object="trash"]::after{content:none!important;display:none!important}#work-desktop .desk-extra[data-object="trash"] .custom-trash-art{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important}';
document.head.append(css);
const layout=document.createElement('div');layout.className='work-desk-layout';grid.parentNode.insertBefore(layout,grid);layout.append(extras,grid);layout.after(panel);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();