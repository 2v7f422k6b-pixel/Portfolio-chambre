/* Shared by Nana’s Little Shop and the room’s directory of shareable links. */
(() => {
'use strict';
const products=[
{id:'swans',type:'art',fr:'Cygnes et lotus',en:'Swans and Lotus',image:'assets/previews/photos/swans-lotus.webp'},
{id:'kitchen',type:'art',fr:'La cuisine',en:'Kitchen',image:'assets/previews/photos/kitchen.webp'},
{id:'marseille',type:'art',fr:'Marseille',en:'Marseille',image:'assets/previews/photos/marseille.webp'},
{id:'blossoms',type:'art',fr:'Fleurs de cerisier',en:'Cherry Blossoms',image:'assets/previews/photos/cherry-blossom.webp'},
{id:'butterflies',type:'art',fr:'Le jardin des papillons',en:'Butterfly Garden',image:'assets/previews/photos/butterflies-grass.webp'},
{id:'studio',type:'art',fr:'Studio',en:'Studio',image:'assets/previews/photos/synth-portrait.webp'},
{"id": "bubblegum", "type": "art", "fr": "Bubblegum", "en": "Bubblegum", "image": "assets/previews/photos/bubblegum.webp"},
{"id": "soap-bubbles", "type": "art", "fr": "Bulles de savon", "en": "Bubbles", "image": "assets/previews/photos/soap-bubbles.webp"},
{"id": "flower-portrait", "type": "art", "fr": "Portrait fleuri", "en": "Floral Portrait", "image": "assets/previews/photos/flower-portrait.webp"},
{"id": "butterfly-back", "type": "art", "fr": "Papillon", "en": "Butterfly", "image": "assets/previews/photos/butterfly-back.webp"},
{"id": "lighter", "type": "art", "fr": "Le briquet", "en": "The Lighter", "image": "assets/previews/photos/lighter.webp"},
{"id": "closeup", "type": "art", "fr": "Gros plan", "en": "Close-up", "image": "assets/previews/photos/closeup.webp"},
{"id": "sunglasses", "type": "art", "fr": "Lunettes de soleil", "en": "Sunglasses", "image": "assets/previews/photos/sunglasses.webp"},
{"id": "clown", "type": "art", "fr": "Clown", "en": "Clown", "image": "assets/previews/photos/clown.webp"},
{"id": "snow-city", "type": "art", "fr": "La ville sous la neige", "en": "Snowy City", "image": "assets/previews/photos/snow-city.webp"},
{"id": "still-life", "type": "art", "fr": "Nature morte", "en": "Still Life", "image": "assets/previews/photos/still-life.webp"},
{"id": "motorbike", "type": "art", "fr": "Moto", "en": "Motorcycle", "image": "assets/previews/photos/motorbike.webp"},
{"id": "marseille-emblem", "type": "art", "fr": "Emblème de Marseille", "en": "Marseille Emblem", "image": "assets/previews/photos/marseille-emblem.webp"},
{id:'gabzilla',type:'tshirt',fr:'Le t-shirt GABZILLA',en:'The GABZILLA t-shirt',image:'assets/previews/gabzilla/tshirt-porte.webp'},
{id:'charm',type:'charm',fr:'Petites perles',en:'Little beads'},
{id:'book',type:'book',fr:'La Princesse Clown',en:'La Princesse Clown',image:'assets/shop/princesse-clown-cover.jpg'}];
for(const p of products){if(p.type==='art')p.collection=p.id==='clown'?'princesse-clown':(['marseille','marseille-emblem'].includes(p.id)?'marseille':'libre');}
products.push(...window.NanaBookIllustrations);
const categorySlugs={art:'illustrations',book:'livre',charm:'bijoux',tshirt:'t-shirts',sticker:'stickers'};
const productSlugs={book:'la-princesse-clown',gabzilla:'gabzilla',charm:'petites-perles',custom:'bijou-personnalise'};
const productRoute=id=>productSlugs[id]?'shop/'+productSlugs[id]:'shop/illu/'+id;
const categoryRoute=(category,group)=>category==='art'&&group!=='all'?'shop/collection/'+group:Object.hasOwn(categorySlugs,category)?'shop/categorie/'+categorySlugs[category]:'shop';

function canonical(route) {
 if(typeof route!=='string')return '';
 const legacyId=/^shop\/(?:product\/)?([^/]+)$/.exec(route)?.[1];
 return legacyId && (legacyId==='custom'||products.some(p=>p.id===legacyId))?productRoute(legacyId):route;
}

const labels={
 art:['Illustrations','Illustrations'],book:['Le livre','The book'],charm:['Bijoux','Charms'],
 tshirt:['T-shirts','T-shirts'],sticker:['Stickers','Stickers'],
 'princesse-clown':['La Princesse Clown','La Princesse Clown'],marseille:['Marseille','Marseille'],libre:['Au fil des envies','Here and there']
};
function entries(language='fr') {
 const lang=language==='en'?'en':'fr';
 const label=key=>labels[key][lang==='en'?1:0];
 const result=[{route:'shop',title:lang==='en'?'Nana’s Little Shop':'La boutique de Nana'}];
 for(const category of Object.keys(categorySlugs)){
  result.push({route:categoryRoute(category,'all'),title:label(category)});
 }
 for(const collection of ['princesse-clown','marseille','libre']){
  result.push({route:categoryRoute('art',collection),title:'Collection · '+label(collection)});
 }
 for(const product of products){
  const suffix=product.id==='book'?(lang==='en'?' · PDF book':' · livre PDF'):'';
  result.push({route:productRoute(product.id),title:product[lang]+suffix});
 }
 return result;
}
window.NanaShopCatalog={products,categorySlugs,productSlugs,productRoute,categoryRoute,canonical,entries};
})();
