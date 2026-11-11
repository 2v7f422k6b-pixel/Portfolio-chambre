/* Dressing controls, using its existing slots, renderer, tabs and toast. */
window.NanaDressingLooks={init(api){
  'use strict';
  const store=window.NanaLooks,$=s=>document.querySelector(s),t=(fr,en)=>document.documentElement.lang==='en'?en:fr;
  let editingId=null,ready=false,lastJSON='',page=0,category='',storageWarned=false,partial=false;
  document.body.classList.add('has-saved-looks');
  const save=document.createElement('button');save.type='button';save.id='save-personal-look';save.className='action nl-frame';save.setAttribute('data-no-translate','');$('#save').before(save);
  const album=document.createElement('button');album.type='button';album.id='open-my-looks';album.className='action nl-frame';album.setAttribute('data-no-translate','');save.after(album);
  const dialog=document.createElement('dialog');dialog.className='nl-save-dialog nl-frame';dialog.setAttribute('data-no-translate','');dialog.setAttribute('aria-labelledby','nl-save-title');
  dialog.innerHTML='<form><h2 id="nl-save-title"></h2><label for="nl-look-name"></label><div class="nl-frame nl-input"><input id="nl-look-name" maxlength="80" autocomplete="off"></div><p class="nl-save-note"></p><p class="nl-save-error" role="alert"></p><div class="nl-dialog-actions"><button class="action nl-frame" type="submit" value="new"></button><button class="action nl-frame" type="submit" value="update"></button><button class="action nl-frame" type="button" data-cancel></button></div></form>';
  document.body.append(dialog);
  const input=dialog.querySelector('input'),notice=dialog.querySelector('.nl-save-note'),error=dialog.querySelector('[role=alert]');
  function copy(){
    save.textContent=t('Sauvegarder ce look','Save this look');album.textContent=t('Mes looks','My looks');
    dialog.querySelector('h2').textContent=t('Un petit nom pour ce look ?','A little name for this look?');
    dialog.querySelector('label').textContent=t('Nom du look','Look name');input.placeholder=store.defaultName();
    dialog.querySelector('[value=new]').textContent=t(editingId?'Créer un nouveau look':'Sauvegarder',editingId?'Save as a new look':'Save');
    const update=dialog.querySelector('[value=update]');update.hidden=!editingId;update.textContent=t('Enregistrer les modifications','Save changes');
    dialog.querySelector('[data-cancel]').textContent=t('Annuler','Cancel');
    notice.textContent=partial?t('Certaines pièces sont indisponibles. Remplacer ce look enregistrera uniquement la tenue visible. Tu peux aussi en créer un nouveau.','Some pieces are unavailable. Replacing this look will save only the visible outfit. You can also save a new look.'):t('À retrouver dans ton carnet, sur ce navigateur.','Find it in your notebook, in this browser.');
    syncCategories();
  }
  save.addEventListener('click',()=>{if(editingId&&!store.get(editingId))editingId=null;copy();input.value=store.get(editingId)?.name||'';error.textContent='';dialog.showModal();input.focus();input.select();});
  dialog.querySelector('[data-cancel]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=>{event.stopPropagation();});
  dialog.addEventListener('close',()=>save.focus({preventScroll:true}));
  dialog.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();const updating=event.submitter?.value==='update';
    const result=store.save(input.value.trim()||store.defaultName(),api.snapshot(),updating?editingId:null);
    if(!result.ok){error.textContent=result.error==='preview'?t('Les essais en aperçu créatrice ne sont pas enregistrés.','Creator previews are not saved.'):t('La sauvegarde a échoué. Ton ancien look est conservé. Vérifie l’espace ou les autorisations de ce navigateur.','Could not save. Your previous look is safe. Check this browser’s storage or permissions.');return;}
    editingId=result.value.id;partial=false;lastJSON='';changed();dialog.close();api.toast(t('Look glissé dans ton carnet.','Look tucked into your notebook.'));
  });
  album.addEventListener('click',()=>{if(parent!==window&&parent.NanaDeepLinks)parent.NanaDeepLinks.open('carnet/looks');else location.href='index.html#/carnet/looks';});
  // Inventory pages keep the existing garment buttons usable without window scrolling.
  const families=[
    {id:'clothes',fr:'Vêtements',en:'Clothes',keys:['tops','sweaters','pyjamas','underwear','pants','skirts','dresses','jumpsuits','jackets','hosiery']},
    {id:'shoes',fr:'Chaussures',en:'Shoes',keys:['shoes']},
    {id:'accessories',fr:'Accessoires',en:'Accessories',keys:['bags','scarves','headwear','jewelry','bagAccessories','accessories','badges']},
    {id:'beauty',fr:'Beauté',en:'Beauty',keys:['makeup']},
    {id:'outfits',fr:'Tenues',en:'Outfits',keys:['sets']}
  ];
  const remembered={};
  const categoryNav=document.createElement('div');categoryNav.className='nl-category-navigation';categoryNav.setAttribute('data-no-translate','');
  const familyNav=document.createElement('nav');familyNav.className='nl-families';
  const subNav=document.createElement('nav');subNav.className='nl-subcategories';
  categoryNav.append(familyNav,subNav);$('#tabs').before(categoryNav);
  const familyButtons=new Map(),subButtons=new Map();
  for(const family of families){
    const button=document.createElement('button');button.type='button';button.className='tab';button.dataset.family=family.id;
    button.addEventListener('click',()=>api.setCategory(remembered[family.id]||family.keys[0]));
    familyButtons.set(family.id,button);familyNav.append(button);
    for(const key of family.keys){
      const sub=document.createElement('button');sub.type='button';sub.className='tab';sub.dataset.category=key;
      sub.addEventListener('click',()=>api.setCategory(key));subButtons.set(key,sub);subNav.append(sub);
    }
  }
  function syncCategories(){
    const active=api.category(),family=families.find(f=>f.keys.includes(active))||families[0];
    remembered[family.id]=active;
    familyNav.setAttribute('aria-label',t('Familles de vêtements','Wardrobe groups'));
    subNav.setAttribute('aria-label',t('Sous-catégories','Subcategories'));
    for(const f of families){
      const b=familyButtons.get(f.id),selected=f===family;
      b.textContent=t(f.fr,f.en);b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));
    }
    const labels=[...$('#tabs').querySelectorAll('button')];
    for(const [i,[key]] of api.categories.entries()){
      const b=subButtons.get(key);if(!b)continue;
      b.textContent=labels[i]?.textContent||key;
      b.hidden=!family.keys.includes(key);
      b.classList.toggle('active',key===active);b.setAttribute('aria-pressed',String(key===active));
    }
    subNav.hidden=family.keys.length===1;
  }
  const pager=document.createElement('nav');pager.className='nl-inventory-pager';pager.setAttribute('data-no-translate','');$('#inventory').after(pager);
  function paginate(){
    if(api.category()!==category){category=api.category();page=0;}
    syncCategories();
    const target=$('#items'),cards=[...target.children].filter(el=>el.tagName==='BUTTON'),note=target.querySelector('p');
    if(!cards.length){pager.replaceChildren();return;}
    cards.forEach(el=>el.hidden=false);
    const columns=getComputedStyle(target).gridTemplateColumns.split(' ').length;
    const gap=parseFloat(getComputedStyle(target).rowGap)||8;
    const available=$('#inventory').clientHeight-(note?note.offsetHeight+gap:0);
    const height=Math.max(...cards.map(el=>el.getBoundingClientRect().height));
    const size=Math.max(columns,Math.floor((available+gap)/(height+gap))*columns),total=Math.max(1,Math.ceil(cards.length/size));page=Math.min(page,total-1);
    cards.forEach((el,i)=>el.hidden=i<page*size||i>=(page+1)*size);
    pager.innerHTML='<button class="action nl-frame" type="button" data-page="-1" aria-label="'+t('Vêtements précédents','Previous clothes')+'">←</button><span>'+(page+1)+' / '+total+'</span><button class="action nl-frame" type="button" data-page="1" aria-label="'+t('Vêtements suivants','Next clothes')+'">→</button>';
    pager.querySelector('[data-page="-1"]').disabled=page===0;pager.querySelector('[data-page="1"]').disabled=page===total-1;
  }
  pager.addEventListener('click',event=>{const b=event.target.closest('[data-page]');if(b&&!b.disabled){page+=Number(b.dataset.page);paginate();}});
  function changed(){
    paginate();if(!ready)return;
    const outfit=api.snapshot(),json=JSON.stringify([outfit,editingId]);if(json===lastJSON)return;
    const result=store.last(outfit,editingId);if(result.ok){lastJSON=json;storageWarned=false;}else if(!storageWarned){storageWarned=true;api.toast(t('Ce navigateur ne peut pas conserver ta tenue.','This browser cannot keep your outfit.'));}
  }
  const requested=store.takeWear(),saved=requested?store.get(requested):null,last=saved?{outfit:saved.outfit,editingId:saved.id}:store.last();
  if(last){editingId=store.get(last.editingId)?.id||null;const missing=api.restore(last.outfit);partial=missing.length>0;api.render();lastJSON=JSON.stringify([api.snapshot(),editingId]);if(partial)api.toast(t('Certaines pièces sont indisponibles ou à débloquer. Le look original reste dans ton carnet.','Some pieces are unavailable or locked. The original look remains in your notebook.'));}
  ready=true;copy();paginate();
  if(requested&&last)store.last(last.outfit,editingId);
  new ResizeObserver(()=>paginate()).observe($('#inventory'));
  document.addEventListener('portfolio-language-change',()=>{copy();paginate();});
  return {changed,paginate};
}};
