/* A fashion album inside the existing notebook leaves and page-turn system. */
window.NanaJournalLooks={create({dialog,content,t,h,button,heading,paginate,render,navigate}){
  const store=window.NanaLooks;
  let selected=null,mode='',message='';
  const date=look=>new Date(look.createdAt).toLocaleDateString(document.documentElement.lang==='en'?'en-GB':'fr-FR',{day:'numeric',month:'short',year:'numeric'});
  const photo=look=>'<span class="nl-photo" data-look-preview="'+h(look.id)+'"><span class="nl-photo-wait">'+t('Le Polaroid se révèle…','The Polaroid is developing…')+'</span></span>';
  const frame=look=>photo(look)+'<span class="nl-photo-name">'+h(look.name)+'</span><time datetime="'+h(look.createdAt)+'">'+h(date(look))+'</time>';
  const localNote=()=>'<p class="nj-bottom-note nl-local-note">'+t('Tes looks restent sur ce navigateur. Ils ne sont pas synchronisés entre appareils.','Your looks stay in this browser. They do not sync across devices.')+'</p>';
  function page(){
    const looks=store.list(),look=looks.find(x=>x.id===selected);
    if(look){
      const actions=mode==='delete'?'<p>'+t('Retirer ce Polaroid du carnet ?','Remove this Polaroid from your notebook?')+'</p>'+button(t('Oui, supprimer','Yes, delete'),'data-look-delete-confirm','nl-frame')+button(t('Garder ce look','Keep this look'),'data-look-cancel','nl-frame'):
        mode==='rename'?'<form class="nl-rename"><label for="nl-rename-name">'+t('Nom du look','Look name')+'</label><div class="nl-input nl-frame"><input id="nl-rename-name" maxlength="80" value="'+h(look.name)+'" placeholder="'+h(store.defaultName())+'"></div><button type="submit" class="nj-button nl-frame">'+t('Enregistrer','Save')+'</button>'+button(t('Annuler','Cancel'),'data-look-cancel','nl-frame')+'</form>':
        button(t('Porter ce look','Wear this look'),'data-look-wear','nl-frame')+button(t('Renommer','Rename'),'data-look-rename','nl-frame')+button(t('Supprimer','Delete'),'data-look-delete','nl-frame');
      return '<article class="nl-polaroid nl-large">'+frame(look)+'</article><div class="nl-look-details">'+heading(t('Une tenue, un souvenir','An outfit, a memory'),look.name)+'<p class="nl-look-warning" role="status"></p><div class="nl-look-actions">'+actions+'</div><p class="nl-error" role="alert">'+h(message)+'</p>'+button(t('Retour à mes looks','Back to my looks'),'data-look-back','nl-frame')+'</div>';
    }
    selected=null;mode='';
    const intro=heading(t('Mes looks','My looks'),store.status()?t('Ce navigateur ne permet pas de lire les looks enregistrés.','This browser cannot read saved looks.'):t('Des petits bouts de toi, à porter et à garder.','Little pieces of you, to wear and to keep.'));
    if(!looks.length)return intro+'<div class="nl-empty"><span aria-hidden="true">♡</span><p>'+t('La première page t’attend. Compose une tenue et glisse-la ici.','The first page is waiting. Make an outfit and tuck it in here.')+'</p>'+button(t('À mon dressing','To my wardrobe'),'data-look-dressing','nl-frame')+'</div>'+localNote();
    return intro+paginate(looks,(look,i)=>'<button type="button" class="nl-polaroid" data-look-open="'+h(look.id)+'" style="--look-tilt:'+([-2,1.5,1,-1.5][i%4])+'deg" aria-label="'+h(look.name+' · '+date(look))+'">'+frame(look)+'</button>',{size:matchMedia('(max-width:760px)').matches?2:4,cls:'nj-grid nl-album'})+localNote();
  }
  function hydrate(){
    for(const host of content.querySelectorAll('[data-look-preview]')){
      const look=store.get(host.dataset.lookPreview);if(!look)continue;
      store.preview(look.outfit).then(result=>{
        if(!host.isConnected)return;
        const image=document.createElement('img');image.src=result.url;image.alt=look.name;image.draggable=false;host.replaceChildren(image);
        if(result.unavailable.length){
          const text=t('Certaines pièces sont indisponibles ou à débloquer. Ton look est conservé.','Some pieces are unavailable or locked. Your look is preserved.');
          if(selected===look.id){const warning=content.querySelector('.nl-look-warning');if(warning)warning.textContent=text;}
          else{const note=document.createElement('span');note.className='nl-photo-status';note.textContent=t('Pièces indisponibles','Pieces unavailable');host.append(note);}
        }
      }).catch(()=>{if(host.isConnected){host.textContent=t('Aperçu indisponible. Le look est conservé.','Preview unavailable. Your look is safe.');const retry=document.createElement('button');retry.type='button';retry.className='nj-button nl-frame';retry.dataset.lookRetry='';retry.textContent=t('Réessayer','Try again');if(selected===look.id)content.querySelector('.nl-look-warning')?.append(retry);}});
    }
  }
  function fail(){message=t('La modification n’a pas pu être enregistrée. Ton look est conservé.','Could not save the change. Your look is safe.');render();}
  function handle(target){
    if(target.dataset.lookOpen){selected=target.dataset.lookOpen;mode='';message='';render();content.querySelector('[data-look-wear]')?.focus({preventScroll:true});}
    else if(target.hasAttribute('data-look-back')){selected=null;mode='';render();}
    else if(target.hasAttribute('data-look-rename')){mode='rename';render();content.querySelector('input')?.focus({preventScroll:true});}
    else if(target.hasAttribute('data-look-delete')){mode='delete';render();content.querySelector('[data-look-cancel]')?.focus({preventScroll:true});}
    else if(target.hasAttribute('data-look-cancel')){mode='';message='';render();}
    else if(target.hasAttribute('data-look-delete-confirm')){const result=store.remove(selected);if(result.ok){selected=null;mode='';render();}else fail();}
    else if(target.hasAttribute('data-look-wear')){store.requestWear(selected);navigate('jeu/dressing');}
    else if(target.hasAttribute('data-look-dressing'))navigate('jeu/dressing');
    else if(target.hasAttribute('data-look-retry'))render();
    else return false;
    return true;
  }
  dialog.addEventListener('submit',event=>{if(!event.target.matches('.nl-rename'))return;event.preventDefault();const name=event.target.querySelector('input').value.trim()||store.defaultName();const result=store.rename(selected,name);if(result.ok){mode='';message='';render();}else fail();});
  return {page,hydrate,handle,reset:()=>{selected=null;mode='';message='';}};
}};
