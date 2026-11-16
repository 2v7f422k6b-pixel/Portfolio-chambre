/* Wearing slots are independent of inventory categories. Existing item IDs stay stable. */
(() => {
  'use strict';
  const sweaters=new Set(['top-pullover','top-lime','top-bear','top-bow-knit']);
  const cardigans=new Set(['jacket-amelie','jacket-miffy-knit','jacket-green-bolero','jacket-blue','jacket-ganni-knit','jacket-blue-open','jacket-pink-button','jacket-red-button']);
  const vests=new Set(['top-mononoke-tabard','top-ganni-knit','vest-george-sand','jacket-floral']);
  const sparkles=new Set(['top-sparkle-pink','top-sparkle-charcoal']);
  const buckets=new Set(['head-bucket-beige','head-bucket-blue']);
  const hairlessHeads=new Set(['head-clown-wig','head-sonny-rabbit','head-pink-hood','head-preacher-dog']);
  const hoods=new Set(['head-sonny-rabbit','head-pink-hood','head-preacher-dog']);
  const collars=new Set(['top-peter-pan','top-bow-blouse-tucked']);
  const slotFor=(id,items)=>{
    if(id==='cape-mononoke')return 'cape';
    if(id==='top-mononoke-tabard')return 'vest';
    if(id==='head-mononoke-band')return 'clips';
    if(id==='jewelry-mononoke-earrings')return 'earrings';
    if(id==='jewelry-mononoke-ashitaka')return 'pendant';
    if(id==='jewelry-mononoke-armbands')return 'bracelets';
    if(id==='accessory-sakura-gloves')return 'gloves';
    if(id==='accessory-sakura-wings')return 'wings';
    if(id==='hosiery-sakura-main')return 'socks';
    if(id==='jewelry-olive-wristbands')return 'bracelets';
    if(id==='accessory-gokinjo-gloves')return 'gloves';
    if(id==='head-gokinjo-bobbles')return 'clips';
    if(id==='top-hachi-turtleneck')return 'sheer';
    if(id==='hosiery-hachi-stripes')return 'socks';
    if(id==='hosiery-hachi-legwarmers')return 'legwarmers';
    if(['jewelry-hachi-belt','jewelry-paprika-belt','jewelry-nana-belt'].includes(id))return 'belt';
    if(['jewelry-coffee-lanyard','jewelry-piano-lanyard'].includes(id))return 'bagAccessories';
    if(id==='jewelry-flower-long')return 'bags';
    if(['hosiery-dj','hosiery-blue-lace'].includes(id))return 'hosieryOverlay';
    if(['hosiery-cherry-socks','shoes-pink-lace','hosiery-cafe','hosiery-shining','hosiery-pink-knee','hosiery-brown-stripes'].includes(id))return 'socks';
    if(sweaters.has(id))return 'sweater';
    if(cardigans.has(id))return 'cardigan';
    if(vests.has(id))return 'vest';
    if(sparkles.has(id))return 'sheer';
    const fixed={'jacket-yukata':'wrap','head-inspector-glasses':'glasses','head-headlamp':'headlamp','accessory-preacher-gloves':'gloves','head-preacher-goggles':'glasses','accessory-pink-gloves':'gloves','accessory-camera':'camera','accessory-phone':'phone','suit-paint':'overalls','jewelry-dj-bracelets':'bracelets'};
    if(fixed[id])return fixed[id];
    if(id.startsWith('held-'))return 'handObject';
    if(['head-oval-glasses','head-pink-glasses','head-olive-glasses'].includes(id))return 'glasses';
    if(id==='head-miffy-clips')return 'clips';
    if(['head-star-headphones','head-cassette-green'].includes(id))return 'headphones';
    if(id.startsWith('head-'))return id==='head-airpods'?'headphones':['head-stars','head-shining-flower'].includes(id)?'clips':'hat';
    if(id.startsWith('jewelry-'))return 'necklace';
    return items[id]?.[1]||null;
  };
  function canWearTop(dress,top){return !dress||['dress-denim','dress-gokinjo'].includes(dress)||sparkles.has(top)&&['dress-polka','dress-pink-bustier'].includes(dress);}
  function normalize(s,changed){
    const conflict=s.clips&&(hairlessHeads.has(s.hat)||s.clips==='head-miffy-clips'&&(s.headlamp||['head-cap','head-george-sand','head-band-white','head-band-pink','head-band-blue'].includes(s.hat)));
    if(conflict){if(changed==='clips'){s.hat=null;s.headlamp=null;}else s.clips=null;}
    const matchingGloveGrip=s.handObject==='held-sakura-scepter'&&s.gloves==='accessory-sakura-gloves';
    if(s.handObject&&(s.phone||(s.gloves&&!matchingGloveGrip))){if(changed==='gloves'||changed==='phone')s.handObject=null;else{s.gloves=null;s.phone=null;}}
    if(s.dresses){s.pants=null;s.skirts=null;s.overalls=null;if(s.tops&&!canWearTop(s.dresses,s.tops))s.tops=null;if(s.sheer&&!canWearTop(s.dresses,s.sheer))s.sheer=null;}
    if(s.overalls){s.dresses=null;s.pants=null;s.skirts=null;if(!s.underwear)s.underwear='bra-blue';}
    if(s.pants)s.skirts=null;
    if(s.sheer&&s.sheer!=='top-hachi-turtleneck'&&s.tops&&!['top-pink','top-dj'].includes(s.tops)){
      if(changed==='tops')s.sheer=null;else s.tops=null;
    }
    // Only one outer knit. The inspector turtleneck is the sole knit base.
    const knitSlots=['sweater','cardigan',...(s.vest==='top-ganni-knit'||s.vest==='vest-george-sand'?['vest']:[])];
    const wornKnits=knitSlots.filter(k=>s[k]);
    const keepKnit=wornKnits.includes(changed)?changed:wornKnits[0];
    for(const k of wornKnits)if(k!==keepKnit)s[k]=null;
    // George Sand's tailored waistcoat only layers with this collection.
    if(s.vest==='vest-george-sand'){
      const incompatible=['tops','sheer','sweater','cardigan','dresses','overalls','jackets','wrap'].filter(k=>s[k]&&!s[k].endsWith('george-sand'));
      if(incompatible.includes(changed))s.vest=null;
      else for(const k of incompatible)s[k]=null;
    }
    // The striped coat was specifically requested without another bulky knit underneath.
    if(s.jackets==='jacket-striped-knit'){
      if(changed==='sweater'||changed==='cardigan')s.jackets=null;else{s.sweater=null;s.cardigan=null;}
    }
    if(s.vest==='jacket-floral'&&['jacket-striped-knit','jacket-cardigan'].includes(s.jackets)){
      if(changed==='vest')s.jackets=null;else s.vest=null;
    }
    if(s.wrap&&s.jackets&&s.jackets!=='jacket-striped-knit'){
      if(changed==='jackets')s.wrap=null;else s.jackets=null;
    }
    if(s.scarves&&['jewelry-clown-ruff','jewelry-miffy-ruff','jewelry-george-sand','jewelry-sakura-bow'].includes(s.necklace)){
      if(changed==='necklace')s.scarves=null;else s.necklace=null;
    }
    if(!s.bags||!['jewelry-coffee-lanyard','jewelry-piano-lanyard'].includes(s.bagAccessories)&&!['bag-brown','bag-crochet'].includes(s.bags))s.bagAccessories=null;
    if(hoods.has(s.hat)){
      if(changed==='clips'||changed==='headlamp'||changed==='headphones')s.hat=null;else{s.clips=null;s.headlamp=null;s.headphones=null;}
    }
    if(buckets.has(s.hat)&&s.headlamp){if(changed==='headlamp')s.hat=null;else s.headlamp=null;}
    if(s.hat&&s.headphones){if(changed==='headphones')s.hat=null;else s.headphones=null;}
    if(s.sweater==='top-bear'){
      const conflicts=['jackets','wrap'].filter(k=>s[k]&&s[k]!=='jacket-green');
      if(conflicts.includes(changed))s.sweater=null;
      else for(const k of conflicts)s[k]=null;
    }
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
      if(key==='bagAccessories'&&(!s.bags||!['jewelry-coffee-lanyard','jewelry-piano-lanyard'].includes(id)&&!['bag-brown','bag-crochet'].includes(s.bags)))s.bags='bag-brown';
    }
    normalize(s,key);
  }
  window.NanaWardrobeRules={sweaters,cardigans,vests,sparkles,buckets,collars,hairlessHeads,hoods,slotFor,normalize,choose,canWearTop};
})();



