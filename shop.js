/* One illustrated shop, one saved selection. No unapproved prices or payment collection. */
(()=>{'use strict';
 window.NanaAnalytics?.record('shop/open',1,true);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const copy={fr:{eyebrow:'les petites choses de Nana',heading:'Un petit bout de ma chambre',subtitle:'Les illustrations, bijoux et histoires de Léna de Firmas, Nana Color Studio.',discoverCharms:'découvrir les bijoux',bag:'mon panier',all:'tout',illustrations:'illustrations',jewelry:'bijoux',tshirt:'t-shirt',collaboration:'collaboration',gabzillaTitle:'Le t-shirt GABZILLA',gabzillaIntro:'Mon illustration de Marseille sur un t-shirt GABZILLA.',discoverGabzilla:'voir la collaboration',gabzillaDescription:'Une illustration de Marseille imaginée par Léna pour la collaboration GABZILLA.',gabzillaWorn:'Le t-shirt porté',gabzillaDesign:'Le motif du t-shirt',gabzillaArt:'L’illustration originale',bookSpotlight:'le livre de Nana',bookIntro:'Un conte écrit et illustré par Léna de Firmas.',discoverBook:'découvrir le livre',seeBookArt:'voir les illustrations du conte',collectionAll:'tout voir',collectionBook:'La Princesse Clown',collectionMarseille:'Marseille',collectionFree:'Au fil des envies',bookArtNote:'Les dessins du conte, à collectionner séparément. Le livre PDF est proposé à part.',bookArtDescription:'Une illustration issue de La Princesse Clown, à collectionner séparément du livre. Les formats et tarifs seront précisés à l’ouverture.',stickers:'stickers',stickerNote:'Des petits bouts de mon univers, à coller partout.',stickerSoon:'bientôt dans la boutique',book:'le livre',charmHint:'Des perles, un prénom, un petit compagnon.',back:'retour à la chambre',preview:'La boutique se prépare. Tu peux composer ton panier ; les prix et les commandes arrivent bientôt.',yourSelection:'tes petites trouvailles',bagNote:'Ta sélection est gardée ici. Les prix et le paiement seront disponibles à l’ouverture de la boutique.',soon:'commandes bientôt disponibles',continue:'continuer la visite',discover:'découvrir',price:'prix à venir',artType:'Illustration · édition à venir',charmType:'Bijou de téléphone · fait main',bookType:'Livre numérique · PDF',add:'garder dans mon panier',added:'dans mon panier',remove:'retirer',empty:'Ton petit sac attend ses premières trouvailles.',notice:'Ajouté à ton petit sac.',available:'Les ventes ne sont pas encore ouvertes.',artDescription:'Une illustration de Léna, pour emporter un petit bout de son univers chez toi. Les formats et tarifs seront précisés à l’ouverture.',charmDescription:'Un bijou de téléphone composé avec les perles dessinées par Léna. La version faite main sera proposée à l’ouverture de la boutique.',customDescription:'Retrouve ici ta composition du jeu de perles, conservée sur cet appareil. Les possibilités de réalisation et le prix seront précisés avant toute commande.',bookDescription:'Un conte illustré écrit et dessiné par Léna. La version numérique de La Princesse Clown sera proposée ici.',lookBag:'voir mon panier',close:'fermer',custom:'Ton bijou',charm:'Petites perles'},en:{eyebrow:'little things by Nana',heading:'A little piece of my room',subtitle:'Illustrations, charms and stories by Léna de Firmas, Nana Color Studio.',discoverCharms:'discover the charms',bag:'my little bag',all:'all',illustrations:'illustrations',jewelry:'charms',tshirt:'t-shirt',collaboration:'collaboration',gabzillaTitle:'The GABZILLA t-shirt',gabzillaIntro:'My Marseille illustration on a GABZILLA t-shirt.',discoverGabzilla:'explore the collaboration',gabzillaDescription:'A Marseille illustration created by Léna for the GABZILLA collaboration.',gabzillaWorn:'The t-shirt in real life',gabzillaDesign:'The t-shirt design',gabzillaArt:'The original illustration',bookSpotlight:'a book by Nana',bookIntro:'A story written and illustrated by Léna de Firmas.',discoverBook:'discover the book',seeBookArt:'explore the story’s illustrations',collectionAll:'view all',collectionBook:'La Princesse Clown',collectionMarseille:'Marseille',collectionFree:'Here and there',bookArtNote:'Drawings from the story, to collect individually. The PDF book is offered separately.',bookArtDescription:'An illustration from La Princesse Clown, to collect separately from the book. Formats and prices will be announced when the shop opens.',stickers:'stickers',stickerNote:'Little pieces of my world, to stick everywhere.',stickerSoon:'coming soon to the shop',book:'the book',charmHint:'A few beads, a name, a little companion.',back:'back to the room',preview:'The shop is getting ready. Save your favourites in your bag; prices and orders are coming soon.',yourSelection:'your little finds',bagNote:'Your selection is saved here. Prices and checkout will be available when the shop opens.',soon:'orders coming soon',continue:'keep exploring',discover:'discover',price:'price coming soon',artType:'Illustration · edition coming soon',charmType:'Phone charm · handmade',bookType:'Digital book · PDF',add:'keep in my bag',added:'in my bag',remove:'remove',empty:'Your little bag is waiting for its first finds.',notice:'Added to your little bag.',available:'Sales are not open yet.',artDescription:'An illustration by Léna, a little piece of her world to take home. Formats and prices will be announced when the shop opens.',charmDescription:'A phone charm composed with Léna’s illustrated beads. A handmade version will be offered when the shop opens.',customDescription:'Here is your design from the bead game, saved on this device. Making options and the price will be confirmed before any order.',bookDescription:'An illustrated story written and drawn by Léna. The French digital edition of La Princesse Clown will be available here.',lookBag:'view my bag',close:'close',custom:'Your charm',charm:'Little beads'}};
const {products:catalogProducts,productSlugs,categorySlugs,categoryRoute,productRoute,canonical}=window.NanaShopCatalog;
const products=[...catalogProducts];
const read=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch(_){return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,value);}catch(_){}};
let hasCustom=false;try{const data=JSON.parse(read('nana-bead-charm-v1','null'));hasCustom=Array.isArray(data?.beads)&&data.beads.some(b=>b&&['heart','flower','star','letter'].includes(b.type)&&Number.isInteger(b.slot)&&b.slot>=0&&b.slot<20);}catch(_){}
if(hasCustom)products.splice(products.findIndex(p=>p.id==='charm')+1,0,{id:'custom',type:'charm',fr:'Ton bijou',en:'Your charm'});
let lang=read('portfolio-language-v2','fr')==='en'?'en':'fr',filter='all',collection='all',current=null;
let wallExpanded=false;
const collections=['all','princesse-clown','marseille','libre'];
const artwork=products.filter(p=>p.type==='art');
// A mixed wall shows the three collections immediately; each filter keeps its full selection.
const groups=['princesse-clown','libre','marseille'].map(c=>artwork.filter(p=>p.collection===c));
const illustrations=[];
while(groups.some(g=>g.length))for(const group of groups)if(group.length)illustrations.push(group.shift());
const visibleIllustrations=()=>illustrations.filter(p=>collection==='all'||p.collection===collection);
const embedded=window.frameElement?.id==='nana-shop-frame';
const listRoute=()=>categoryRoute(filter,collection);
let shownRoute='';
let ids=[];try{const saved=JSON.parse(read('nana-shop-bag-v1','[]'));if(Array.isArray(saved))ids=saved.filter(id=>products.some(p=>p.id===id));}catch(_){}
const bag=new Set(ids),t=key=>copy[lang][key],name=p=>p[lang],type=p=>t(p.type+'Type');
const art=(p,thumbnail=false)=>p.type==='charm'?window.NanaShopCharm.render(p.id==='custom'):`<img src="${thumbnail&&p.thumbnail?p.thumbnail:p.image}" alt="${name(p)}" loading="lazy" decoding="async"${p.width?` width="${p.width}" height="${p.height}"`:''}>`;
function updateWallDisclosure(){
 $('#wall-grid').classList.toggle('expanded',wallExpanded);
 const remaining=Math.max(0,visibleIllustrations().length-6);
 $('#wall-more').hidden=remaining===0;
 $('#wall-more').setAttribute('aria-expanded',String(wallExpanded));
 $('#wall-more').textContent=wallExpanded?(lang==='fr'?'voir moins d’illustrations':'show fewer illustrations'):(lang==='fr'?`voir les ${remaining} autres illustrations`:`see the other ${remaining} illustrations`);
}
function renderWall(){
 const items=visibleIllustrations();
 $('#wall-count').textContent=lang==='fr'?`${items.length} illustrations à découvrir`:`${items.length} illustrations to discover`;
 $('#wall-grid').innerHTML=items.map(p=>`<article class="wall-item"><button class="wall-print" data-product="${p.id}" aria-label="${t('discover')} ${name(p)}"><span class="print-image">${art(p,true)}</span></button><h3><button data-product="${p.id}">${name(p)}</button></h3><p class="price-note">${t('price')}</p></article>`).join('');
 $$('[data-collection]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.collection===collection)));
 $$('[data-collection-count]').forEach(el=>{const c=el.dataset.collectionCount;el.textContent=artwork.filter(p=>c==='all'||p.collection===c).length;});
 $('#book-collection-note').hidden=collection!=='princesse-clown';
 updateWallDisclosure();
}
function renderBoutique(){
 renderWall();
 $('#hanging-charms').innerHTML=[0,1,2].map(n=>`<button class="hanging-charm" data-product="${n===1&&hasCustom?'custom':'charm'}" aria-label="${n===1&&hasCustom?t('custom'):t('charm')}">${window.NanaShopCharm.render(n===1&&hasCustom,n)}${n===1&&hasCustom?`<span>${t('custom')}</span>`:''}</button>`).join('');
 applyFilter();
}
function applyFilter(){
 window.NanaAnalytics?.record('shop/category/'+filter,1,true);
 $('#shop-content').dataset.category=filter;
 $('#illustration-wall').hidden=!['all','art'].includes(filter);
 $('#side-boutique').hidden=!['all','charm','sticker','tshirt'].includes(filter);
 $('#gabzilla-section').hidden=!['all','tshirt'].includes(filter);
 $('#charms-section').hidden=!['all','charm'].includes(filter);
 $('#stickers-section').hidden=!['all','sticker'].includes(filter);
 $('#book-section').hidden=!['all','book'].includes(filter);
 $$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));

}
const gabzillaImages=[['tshirt-porte','gabzillaWorn'],['composition','gabzillaDesign'],['illustration','gabzillaArt']];
function renderProduct(){const p=products.find(p=>p.id===current);if(!p)return;
 if(p.id==='gabzilla'){$('#product-detail').innerHTML=`<div class="detail-layout"><div><div class="detail-image"><img id="gabzilla-detail-image" src="${p.image}" alt="${t('gabzillaWorn')}"></div><div class="gabzilla-thumbnails" role="group" aria-label="GABZILLA">${gabzillaImages.map(([file,label],i)=>`<button data-gabzilla-image="${i}" aria-pressed="${i===0}" aria-label="${t(label)}"><img src="assets/previews/gabzilla/${file}.webp" alt=""></button>`).join('')}</div></div><div class="detail-copy"><p class="eyebrow">${t('collaboration')}</p><h2 id="product-title">${t('gabzillaTitle')}</h2><p>${t('gabzillaDescription')}</p></div></div>`;return;}
 $('#product-detail').innerHTML=`<div class="detail-layout"><div class="detail-image">${art(p)}</div><div class="detail-copy"><p class="eyebrow">${type(p)}</p><h2 id="product-title">${name(p)}</h2><p>${t(p.collection==='princesse-clown'?'bookArtDescription':(p.id==='custom'?'custom':p.type)+'Description')}</p>${p.collection==='princesse-clown'?`<button class="text-button" data-product="book">${t('discoverBook')}</button>`:''}<p class="price-note">${t('price')}</p><button class="shop-frame add" data-add="${p.id}" ${bag.has(p.id)?'disabled':''}>${bag.has(p.id)?t('added'):t('add')}</button><small>${t('available')}</small><button class="text-button" data-open-bag>${t('lookBag')}</button></div></div>`;}
function renderBag(){const items=products.filter(p=>bag.has(p.id));$('#bag-items').innerHTML=items.length?items.map(p=>`<div class="bag-row shop-rule"><div class="product-art">${art(p,true)}</div><div><h3>${name(p)}</h3><p>${t('price')}</p></div><button class="text-button" data-remove="${p.id}" aria-label="${t('remove')} ${name(p)}">${t('remove')}</button></div>`).join(''):`<p class="empty-bag">${t('empty')}</p>`;$$('.bag-count').forEach(el=>el.textContent=bag.size);$$('[data-open-bag]').forEach(el=>el.setAttribute('aria-label',t('bag')+' ('+bag.size+')'));}
function openProduct(id){if(!products.some(p=>p.id===id))return;current=id;window.NanaAnalytics?.record('shop/product/'+id);renderProduct();if(!$('#product-dialog').open)$('#product-dialog').showModal();else $('#product-dialog [data-close]').focus();}
function openBag(){renderBag();if(!$('#bag-dialog').open)$('#bag-dialog').showModal();}
function translate(){document.documentElement.lang=lang;$$('[data-text]').forEach(el=>el.textContent=t(el.dataset.text));$('#language').textContent=lang==='fr'?'EN':'FR';$('#language').setAttribute('aria-label',lang==='fr'?'Switch to English':'Passer en français');$('.shop-header .close').setAttribute('aria-label',t('back'));renderBoutique();renderBag();if(current)renderProduct();$$('[data-share]').forEach(el=>el.textContent=shareLabel());}
// In the room the top-level router owns history. The embedded shop only renders.
function navigate(route) {
 if(embedded){window.parent.NanaDeepLinks.open(route);return;}
 if(!route.startsWith('shop')){location.assign('./#/'+route);return;}
 if(shownRoute!==route)history.pushState(null,'','#/'+route);
 show(route);
}
function show(route) {
 route=canonical(route);
 if(!route||route===shownRoute)return;
 const section=route.split('/');
 let id;
 if(section[1]==='illu'&&section.length===3)id=artwork.find(p=>p.id===section[2])?.id;
 if(section.length===2)id=Object.keys(productSlugs).find(key=>productSlugs[key]===section[1]);
 if(id==='custom'&&!hasCustom)id='charm';
 if(!id && $('#product-dialog').open)$('#product-dialog').close();
 if(route!=='shop/panier' && $('#bag-dialog').open)$('#bag-dialog').close();
 current=null;
 if(id)openProduct(id);
 else if(route==='shop/panier')openBag();
 else{
  const category=section[1]==='categorie'&&Object.keys(categorySlugs).find(key=>categorySlugs[key]===section[2]);
  const nextCollection=section[1]==='collection'&&collections.includes(section[2])?section[2]:'all';
  const nextFilter=nextCollection!=='all'?'art':(category||'all');
  if(filter!==nextFilter||collection!==nextCollection){
   collection=nextCollection;filter=nextFilter;wallExpanded=false;
   renderWall();applyFilter();
  }
 }
 shownRoute=route;
}
// Restore older product/category query links, including the collection behind an open item.
function restoreAddress() {
 const url=new URL(location.href),query=url.searchParams;
 const fragment=url.hash.replace(/^#\/?/,'');
 let route;
 if(fragment==='shop'||fragment.startsWith('shop/'))route=canonical(fragment);
 else if(fragment && fragment!=='shop-content')route=canonical('shop/'+fragment);
 if(!route){
  const group=collections.includes(query.get('collection'))?query.get('collection'):'all';
  route=categoryRoute(group==='all'?query.get('category'):'art',group);
  show(route);
  const product=query.get('product');
  const productPath=product && canonical('shop/'+product);
  if(query.get('bag')==='1')route='shop/panier';
  else if(productPath && (productPath===productRoute('custom')||catalogProducts.some(p=>productRoute(p.id)===productPath)))route=productPath;
 }
 for(const key of ['product','bag','collection','category','view'])query.delete(key);
 url.hash='/'+route;
 if(location.href!==url.href)history.replaceState(null,'',url);
 show(route);
}
const shareLabel=()=>lang==='fr'?'copier le lien':'copy link';
async function share(button) {
 const url=new URL('./',location.href);
 url.hash='/'+shownRoute;
 let copied=false;
 try{await navigator.clipboard.writeText(url.href);copied=true;}catch(_){
  const input=document.createElement('textarea');
  input.value=url.href;input.style.cssText='position:fixed;left:-10000px;top:0';
  (button.closest('dialog')||document.body).append(input);
  input.select();try{copied=document.execCommand('copy');}catch(_){}input.remove();button.focus();
 }
 if(!copied){window.prompt(shareLabel(),url.href);return;}
 button.textContent=lang==='fr'?'lien copié !':'link copied!';
 setTimeout(()=>button.textContent=shareLabel(),1800);
}
let toastTimer;
document.addEventListener('click',e=>{const link=e.target.closest('a');
 if(link?.classList.contains('skip')){e.preventDefault();$('#shop-content').focus();$('#shop-content').scrollIntoView();return;}
 if(embedded && link?.getAttribute('href')==='index.html' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey){e.preventDefault();navigate('room');return;}
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-share')){share(b);return;}
 if(b.id==='wall-more'){wallExpanded=!wallExpanded;updateWallDisclosure();if(!wallExpanded)$('#illustration-wall').scrollIntoView({block:'start'});return;}
 if(b.dataset.collection||b.dataset.showCollection){const next=b.dataset.collection||b.dataset.showCollection;navigate(categoryRoute('art',next));$('#illustration-wall').scrollIntoView({block:'start'});$('[data-collection="'+next+'"]').focus({preventScroll:true});return;}
 if(b.dataset.filter){navigate(categoryRoute(b.dataset.filter,'all'));return;}
 if(b.dataset.gabzillaImage!==undefined){const [file,label]=gabzillaImages[Number(b.dataset.gabzillaImage)];$('#gabzilla-detail-image').src='assets/previews/gabzilla/'+file+'.webp';$('#gabzilla-detail-image').alt=t(label);$$('[data-gabzilla-image]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));return;}
 if(b.dataset.product){navigate(productRoute(b.dataset.product));return;}
 if(b.hasAttribute('data-close')){navigate(listRoute());return;}
 if(b.hasAttribute('data-open-bag')){navigate('shop/panier');return;}
 if(b.dataset.add){bag.add(b.dataset.add);save('nana-shop-bag-v1',JSON.stringify([...bag]));b.disabled=true;b.textContent=t('added');renderBag();clearTimeout(toastTimer);$('#shop-status').textContent=t('notice');toastTimer=setTimeout(()=>$('#shop-status').textContent='',2400);$$('[data-open-bag]').forEach(el=>{el.classList.remove('bag-pop');requestAnimationFrame(()=>el.classList.add('bag-pop'));});return;}
 if(b.dataset.remove){const index=$$('[data-remove]').indexOf(b);bag.delete(b.dataset.remove);save('nana-shop-bag-v1',JSON.stringify([...bag]));renderBag();const buttons=$$('[data-remove]');(buttons[Math.min(index,buttons.length-1)]||$('#bag-dialog [data-close]')).focus();return;}
 if(b.id==='language'){lang=lang==='fr'?'en':'fr';save('portfolio-language-v2',lang);translate();if(embedded)window.parent.postMessage({type:'portfolio-language',language:lang},location.origin);}
});
$$('dialog').forEach(d=>{
 d.addEventListener('cancel',e=>{e.preventDefault();navigate(listRoute());});
 d.addEventListener('click',e=>{
  if(e.target!==d)return;
  const r=d.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)navigate(listRoute());
 });
});
translate();
if(embedded){
 window.NanaShopPage={show};
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='portfolio-language')return;
  const next=event.data.language==='en'?'en':'fr';if(next!==lang){lang=next;translate();}
 });
 window.parent.postMessage({type:'portfolio-language-request'},location.origin);
 // Paint the requested item now, even while the iframe’s images are still loading.
 show(window.parent.NanaShop.current());
}else{
 restoreAddress();
 window.addEventListener('popstate',restoreAddress);
 window.addEventListener('hashchange',restoreAddress);
}
})();
