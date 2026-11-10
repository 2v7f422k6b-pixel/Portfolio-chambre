/* Wearing slots are independent of inventory categories. Existing item IDs stay stable. */
(() => {
  'use strict';
  const sweaters=new Set(['top-pullover','top-lime','top-bear','top-bow-knit']);
  const cardigans=new Set(['jacket-blue','jacket-ganni-knit']);
  const vests=new Set(['top-ganni-knit','vest-george-sand','jacket-floral']);
  const sparkles=new Set(['top-sparkle-pink','top-sparkle-charcoal']);
  const buckets=new Set(['head-bucket-beige','head-bucket-blue']);
  const collars=new Set(['top-peter-pan','top-bow-blouse-tucked']);
  const slotFor=(id,items)=>{
    if(sweaters.has(id))return 'sweater';
    if(cardigans.has(id))return 'cardigan';
    if(vests.has(id))return 'vest';
    if(sparkles.has(id))return 'sheer';
    const fixed={'head-inspector-glasses':'glasses','head-headlamp':'headlamp','accessory-pink-gloves':'gloves','accessory-camera':'camera','accessory-phone':'phone','suit-paint':'overalls','jewelry-dj-bracelets':'bracelets'};
    if(fixed[id])return fixed[id];
    if(id.startsWith('head-'))return id==='head-airpods'?'headphones':['head-stars','head-shining-flower'].includes(id)?'clips':'hat';
    if(id.startsWith('jewelry-'))return 'necklace';
    return items[id]?.[1]||null;
  };
  function canWearTop(dress,top){return !dress||dress==='dress-denim'||sparkles.has(top)&&['dress-polka','dress-pink-bustier'].includes(dress);}
  function normalize(s,changed){
    if(s.dresses){s.pants=null;s.skirts=null;s.overalls=null;if(s.tops&&!canWearTop(s.dresses,s.tops))s.tops=null;if(s.sheer&&!canWearTop(s.dresses,s.sheer))s.sheer=null;}
    if(s.overalls){s.dresses=null;s.pants=null;s.skirts=null;}
    if(s.pants)s.skirts=null;
    if(s.sheer&&s.tops&&!['top-pink','top-dj'].includes(s.tops)){
      if(changed==='tops')s.sheer=null;else s.tops=null;
    }
    if(s.sweater&&s.cardigan){if(changed==='cardigan')s.sweater=null;else s.cardigan=null;}
    // The striped coat was specifically requested without another bulky knit underneath.
    if(s.jackets==='jacket-striped-knit'){
      if(changed==='sweater'||changed==='cardigan')s.jackets=null;else{s.sweater=null;s.cardigan=null;}
    }
    if(s.vest==='jacket-floral'&&['jacket-striped-knit','jacket-cardigan'].includes(s.jackets)){
      if(changed==='vest')s.jackets=null;else s.vest=null;
    }
    if(!['bag-brown','bag-crochet'].includes(s.bags))s.bagAccessories=null;
    if(s.hat==='head-sonny-rabbit'){
      if(changed==='clips'||changed==='headlamp'||changed==='headphones')s.hat=null;else{s.clips=null;s.headlamp=null;s.headphones=null;}
    }
    if(buckets.has(s.hat)&&s.headlamp){if(changed==='headlamp')s.hat=null;else s.headlamp=null;}
    if(s.hat&&s.headphones){if(changed==='headphones')s.hat=null;else s.headphones=null;}
    if(s.sweater==='top-bear'&&(s.hat||s.headphones||s.clips||s.headlamp)){
      if(['hat','headphones','clips','headlamp'].includes(changed))s.sweater=null;else{s.hat=null;s.headphones=null;s.clips=null;s.headlamp=null;}
    }
    return s;
  }
  function choose(s,id,items){
    const key=slotFor(id,items);if(!key)return;
    if(key==='makeup'){s.makeup.has(id)?s.makeup.delete(id):s.makeup.add(id);return;}
    s[key]=s[key]===id?null:id;
    if(s[key]){
      if(['tops','sheer'].includes(key)&&s.dresses&&!canWearTop(s.dresses,id))s.dresses=null;
      if(key==='pants'){s.dresses=null;s.overalls=null;s.skirts=null;}
      if(key==='skirts'){s.dresses=null;s.overalls=null;s.pants=null;}
      if(key==='dresses')s.overalls=null;
      if(key==='overalls')s.dresses=null;
      if(key==='bagAccessories'&&!['bag-brown','bag-crochet'].includes(s.bags))s.bags='bag-brown';
    }
    normalize(s,key);
  }
  window.NanaWardrobeRules={sweaters,cardigans,vests,sparkles,buckets,collars,slotFor,normalize,choose,canWearTop};
})();
