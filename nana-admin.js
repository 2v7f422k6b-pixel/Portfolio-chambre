/* Nana's editing hub. A frontend passcode only hides the controls;
   real write authorization is enforced by GitHub through a short-lived,
   user-provided, repository-scoped token when publishing. */
(() => {
  'use strict';
  const SESSION = 'nana-admin-session-v1';
  const REPO = '2v7f422k6b-pixel/Portfolio-chambre';
  const FILE = 'nana-site-settings.js';
  const TOOL_FLAGS = ['posterEdit','lampEdit','starsEdit','cookieEdit','ipadClockEdit','zones'];
  const SETTINGS = [
    'nana-poster-alignment-v1',
    'nana-poster-collection-v1',
    'nana-wall-mirror-perspective-v1',
    'nana-wall-lamp-perspective-v1',
    'nana-wall-stars-layout-v1',
    'nana-fortune-cookie-position-v2',
    'nana-ipad-clock-placement-v1',
    'nana-ribbon-per-artwork-v2'
  ];
  const SALT = 'ncoLvsCGvPz8g4p96QUO7g==';
  const HASH = '1Ps6jDfdyidhOO66fOAhLfRS98iRHp7ktX4Zvjkr1BQ=';
  const ITERATIONS = 200000;
  const entry = document.getElementById('nana-admin-trigger');
  if (!entry) return;

  const isUnlocked = () => {
    try { return sessionStorage.getItem(SESSION) === '1'; } catch (_) { return false; }
  };
  if (isUnlocked()) document.documentElement.classList.add('nana-admin-session');

  const dialog = document.createElement('dialog');
  dialog.id = 'nana-admin-dialog';
  dialog.setAttribute('aria-label', 'Atelier de modification Nana Color Studio');
  document.body.appendChild(dialog);

  function heading() {
    return '<div class="nana-admin-top"><h2>Le petit atelier de Nana</h2><button type="button" class="nana-admin-close" aria-label="Fermer">×</button></div>';
  }
  function wireClose() {
    dialog.querySelector('.nana-admin-close')?.addEventListener('click',()=>dialog.close());
  }
  function decode64(s) { return Uint8Array.from(atob(s), c=>c.charCodeAt(0)); }
  async function validPassword(password) {
    if (!window.crypto?.subtle) throw new Error('La vérification du code nécessite une connexion HTTPS.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({
      name:'PBKDF2',hash:'SHA-256',salt:decode64(SALT),iterations:ITERATIONS
    },key,256));
    const expected=decode64(HASH);
    let difference=bits.length ^ expected.length;
    for(let i=0;i<expected.length;i++)difference|=(bits[i]||0)^expected[i];
    return difference===0;
  }

  function showLogin() {
    dialog.innerHTML = heading() +
      '<p>Cette porte est réservée à la personne qui entretient la chambre.</p>' +
      '<form id="nana-admin-login-form"><label for="nana-admin-pass">Code secret</label>' +
      '<input type="password" id="nana-admin-pass" name="password" autocomplete="off" required>' +
      '<div class="nana-admin-actions"><button class="nana-admin-action nana-admin-primary" type="submit">Entrer dans l’atelier</button></div>' +
      '<p class="nana-admin-error" id="nana-admin-login-error" role="alert"></p></form>' +
      '<p class="nana-admin-footer">Les modifications du site ne peuvent être publiées que par un compte GitHub autorisé.</p>';
    wireClose();
    const form=dialog.querySelector('form'),input=dialog.querySelector('input'),error=dialog.querySelector('#nana-admin-login-error');
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      const button=form.querySelector('[type=submit]');
      button.disabled=true;error.textContent='Vérification du code…';
      try {
        if (!await validPassword(input.value)) {
          input.value='';error.textContent='Ce n’est pas le bon code.';input.focus();return;
        }
        try { sessionStorage.setItem(SESSION,'1'); } catch (_) {}
        document.documentElement.classList.add('nana-admin-session');
        showTools();
      } catch(e) {error.textContent=e.message||'Impossible de vérifier le code.';}
      finally {button.disabled=false;}
    });
    setTimeout(()=>input.focus(),0);
  }

  function changeTool(flag) {
    const url = new URL(location.href);
    TOOL_FLAGS.forEach(name=>url.searchParams.delete(name));
    if(flag)url.searchParams.set(flag,'1');
    location.assign(url.pathname+url.search+url.hash);
  }
  function readSettings() {
    const result={};
    for(const key of SETTINGS){
      try {
        const raw=localStorage.getItem(key);
        if(raw!==null){result[key]=JSON.parse(raw);continue;}
      }catch(_){}
      if(Object.prototype.hasOwnProperty.call(window.NANA_PUBLISHED_SETTINGS||{},key))
        result[key]=window.NANA_PUBLISHED_SETTINGS[key];
    }
    return result;
  }
  async function downloadSettings() {
    let photos=photoDraft;
    try {
      if(!photos) {
        const saved=localStorage.getItem(PHOTO_DRAFT);
        if(saved) photos=JSON.parse(saved);
      }
      if(!photos) {
        const response=await fetch('content/polaroids.json',{cache:'no-store'});
        if(!response.ok) throw new Error('Chargement des photos impossible.');
        photos=(await response.json()).photos;
      }
      if(!Array.isArray(photos)) throw new Error('Format des photos invalide.');
    } catch(error) {
      alert('Export interrompu : '+error.message+' Les photos doivent être incluses dans la sauvegarde.');
      return;
    }
    const payload={version:1,exportedAt:new Date().toISOString(),repository:REPO,settings:readSettings(),polaroids:{photos}};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='nana-reglages-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function encodedBase64(string) {
    const bytes=new TextEncoder().encode(string);
    let chars='';
    for(let i=0;i<bytes.length;i+=4096)
      chars+=String.fromCharCode(...bytes.subarray(i,i+4096));
    return btoa(chars);
  }
  function publishedSource(settings) {
    return '/* Public placement configuration; updated by authorized GitHub commits. Never store secrets here. */\n' +
      'window.NANA_PUBLISHED_SETTINGS = '+JSON.stringify(settings,null,2)+';\n' +
      '(() => {\n' +
      '  let isEditing=false;\n' +
      '  try { isEditing=sessionStorage.getItem("nana-admin-session-v1")==="1"; } catch (_) {}\n' +
      '  if (isEditing) return;\n' +
      '  for(const [key,value] of Object.entries(window.NANA_PUBLISHED_SETTINGS)){\n' +
      '    if(!key.startsWith("nana-")) continue;\n' +
      '    try { localStorage.setItem(key,JSON.stringify(value)); } catch (_) {}\n' +
      '  }\n' +
      '})();\n';
  }
  async function publish(token, status, button) {
    const endpoint='https://api.github.com/repos/'+REPO+'/contents/'+FILE;
    const headers={
      'Authorization':'Bearer '+token,
      'Accept':'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28'
    };
    button.disabled=true;status.textContent='Vérification des droits GitHub…';
    try {
      const existing=await fetch(endpoint,{headers,cache:'no-store'});
      if(!existing.ok)throw new Error('GitHub refuse l’accès au dépôt ('+existing.status+'). Vérifie le jeton et ses droits Contents.');
      const old=await existing.json();
      await publishPolaroids(headers,status);
      const settings=readSettings();
      const update=await fetch(endpoint,{
        method:'PUT',
        headers:{...headers,'Content-Type':'application/json'},
        body:JSON.stringify({
          message:'Publish Nana room editor placement settings',
          content:encodedBase64(publishedSource(settings)),
          sha:old.sha,
          branch:'main'
        })
      });
      if(!update.ok){
        const info=await update.json().catch(()=>null);
        throw new Error('Publication refusée ('+update.status+'): '+(info?.message||'vérifie les permissions.'));
      }
      const result=await update.json();
      window.NANA_PUBLISHED_SETTINGS=settings;
      status.textContent='Photos, textes et réglages envoyés à GitHub. La mise en ligne suivra le déploiement GitHub Pages.';
      if(result?.commit?.html_url) {
        const a=document.createElement('a');a.href=result.commit.html_url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Voir le commit GitHub';
        status.append(' ',a);
      }
    } catch(error) {status.textContent=error.message||'La publication a échoué.';}
    finally {button.disabled=false;}
  }
  function photoCropStyle(photo) {
    const crop=photo.crop;
    if(!crop) return '';
    const number=(value,fallback,min,max)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
    const x=number(crop.x,50,0,100),y=number(crop.y,50,0,100),zoom=number(crop.zoom,1,1,3);
    return 'object-fit:'+(crop.fit==='contain'?'contain':'cover')+';object-position:'+x+'% '+y+'%;transform:scale('+zoom+');transform-origin:'+x+'% '+y+'%;';
  }
  const PHOTO_DRAFT = 'nana-polaroids-draft-v1';
  let photoDraft = null;
  async function editPolaroids() {
    if (!photoDraft) {
      try {
        const saved = localStorage.getItem(PHOTO_DRAFT);
        const response = saved ? null : await fetch('content/polaroids.json', {cache:'no-store'});
        if (response && !response.ok) throw new Error('Chargement des photos impossible.');
        photoDraft = saved ? JSON.parse(saved) : (await response.json()).photos;
        if (!Array.isArray(photoDraft)) throw new Error('Format des photos invalide.');
      } catch (error) { alert(error.message); return; }
    }
    dialog.innerHTML = heading() + '<h3>Polaroïds</h3><p>Ajoute tes photos et écris au dos. Enregistre le brouillon, puis utilise « Publier sur le site » dans l’atelier pour les rendre visibles par tous.</p><label>Ajouter des photos<input id="nana-photo-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><div id="nana-photo-list"></div><p id="nana-photo-status" role="status"></p><div class="nana-admin-actions"><button class="nana-admin-action" id="nana-photo-save">Enregistrer le brouillon</button><button class="nana-admin-action" id="nana-photo-back">Retour à l’atelier</button></div>';
    wireClose();
    const status = dialog.querySelector('#nana-photo-status');
    function save() {
      try { localStorage.setItem(PHOTO_DRAFT, JSON.stringify(photoDraft)); status.textContent='Brouillon enregistré dans ce navigateur. Il reste à le publier.'; return true; }
      catch (_) { status.textContent='Le navigateur manque de place. Garde cette fenêtre ouverte et publie depuis l’atelier.'; return false; }
    }
    function render() {
      const list = dialog.querySelector('#nana-photo-list'); list.replaceChildren();
      photoDraft.forEach((photo, index) => {
        const card=document.createElement('div'); card.className='nana-photo-editor';
        const preview=document.createElement('div'); preview.className='nana-photo-crop-preview';
        const image=document.createElement('img'); image.src=photo.src.startsWith('../')?photo.src.slice(3):photo.src; image.alt=photo.alt||photo.title||'Photo'; preview.append(image); card.append(preview);
        const crop=photo.crop?{...photo.crop}:{fit:'contain',zoom:1,x:50,y:50};
        const cropFields=document.createElement('fieldset'); cropFields.className='nana-photo-crop-controls';
        const legend=document.createElement('legend'); legend.textContent='Recadrer dans le polaroïd'; cropFields.append(legend);
        const fitLabel=document.createElement('label'); fitLabel.textContent='Affichage';
        const fit=document.createElement('select');
        for(const [value,text] of [['contain','Photo entière'],['cover','Remplir le cadre']]) { const option=document.createElement('option');option.value=value;option.textContent=text;fit.append(option); }
        fit.value=crop.fit==='contain'?'contain':'cover';fitLabel.append(fit);cropFields.append(fitLabel);
        const sliders=[];
        function updateCrop() { photo.crop={...crop};image.style.cssText=photoCropStyle(photo);status.textContent='Recadrage modifié : enregistre le brouillon, puis publie-le.'; }
        fit.addEventListener('change',()=>{crop.fit=fit.value;updateCrop();save();});
        for(const [key,title,min,max,step] of [['zoom','Zoom',1,3,0.01],['x','Position horizontale',0,100,1],['y','Position verticale',0,100,1]]) {
          const label=document.createElement('label');label.textContent=title;
          const output=document.createElement('output');const slider=document.createElement('input');slider.type='range';slider.min=min;slider.max=max;slider.step=step;slider.value=crop[key]??(key==='zoom'?1:50);
          const refresh=()=>{output.value=Math.round(Number(slider.value)*(key==='zoom'?100:1))+' %';};refresh();
          slider.addEventListener('input',()=>{crop[key]=Number(slider.value);refresh();updateCrop();});
          slider.addEventListener('change',save);label.append(output,slider);cropFields.append(label);sliders.push({key,slider,refresh});
        }
        const reset=document.createElement('button');reset.type='button';reset.className='nana-admin-action';reset.textContent='Réinitialiser le recadrage';
        reset.onclick=()=>{Object.assign(crop,{fit:'contain',zoom:1,x:50,y:50});fit.value='contain';for(const item of sliders){item.slider.value=crop[item.key];item.refresh();}updateCrop();save();};
        cropFields.append(reset);card.append(cropFields);image.style.cssText=photoCropStyle(photo);
        for (const [key,label] of [['title','Titre'],['date','Date'],['note','Texte au dos'],['alt','Description de la photo (accessibilité)']]) {
          const field=document.createElement('label'); field.textContent=label;
          const input=document.createElement(key==='note'?'textarea':'input'); input.value=photo[key]||'';
          input.addEventListener('input',()=>{photo[key]=input.value; status.textContent='Modifications à enregistrer.';});
          input.addEventListener('change',save);
          field.append(input); card.append(field);
        }
        const controls=document.createElement('div'); controls.className='nana-admin-actions';
        for (const [label,offset] of [['Monter',-1],['Descendre',1],['Supprimer',0]]) {
          const button=document.createElement('button'); button.className='nana-admin-action'; button.textContent=label;
          button.disabled=offset!==0 && !photoDraft[index+offset];
          button.onclick=()=>{if(offset) [photoDraft[index],photoDraft[index+offset]]=[photoDraft[index+offset],photoDraft[index]]; else photoDraft.splice(index,1); render(); save();};
          controls.append(button);
        }
        card.append(controls); list.append(card);
      });
      if(!photoDraft.length) list.textContent='Aucune photo pour le moment.';
    }
    dialog.querySelector('#nana-photo-upload').onchange=async event=>{
      const input=event.target; input.disabled=true;
      for(const file of input.files) {
        try {
          if(!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Choisis une photo JPEG, PNG ou WebP.');
          const bitmap=await createImageBitmap(file);
          const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
          const canvas=document.createElement('canvas'); canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
          const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
          photoDraft.push({src:canvas.toDataURL('image/jpeg',0.88),title:file.name.replace(/\.[^.]+$/,''),date:'',note:'',alt:''});
          render(); save();
        } catch(error) { status.textContent=error.message||'Impossible de lire cette photo.'; }
      }
      input.value='';input.disabled=false;
    };
    dialog.querySelector('#nana-photo-save').onclick=save;
    dialog.querySelector('#nana-photo-back').onclick=()=>{save();showTools();};
    render();
  }
  async function publishPolaroids(headers, status) {
    let photos=photoDraft;
    if(!photos) { const raw=localStorage.getItem(PHOTO_DRAFT); if(raw) photos=JSON.parse(raw); }
    if(!photos) return;
    const endpoint='https://api.github.com/repos/'+REPO+'/contents/';
    async function put(path, content, message) {
      const existing=await fetch(endpoint+path,{headers,cache:'no-store'});
      if(!existing.ok && existing.status!==404) throw new Error('Accès aux photos refusé ('+existing.status+').');
      const old=existing.ok?await existing.json():null;
      const response=await fetch(endpoint+path,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message,content,branch:'main',...(old?{sha:old.sha}:{})})});
      if(!response.ok) throw new Error('Publication des photos refusée ('+response.status+'). Le brouillon est conservé.');
    }
    const published=[];
    for(const [index,photo] of photos.entries()) {
      const copy={...photo};
      if(copy.src.startsWith('data:image/jpeg;base64,')) {
        status.textContent='Envoi de la photo '+(index+1)+' / '+photos.length+'…';
        const path='assets/polaroids/'+crypto.randomUUID()+'.jpg';
        await put(path,copy.src.split(',')[1],'Add a Polaroid photograph'); copy.src='../'+path;
      }
      published.push(copy);
    }
    await put('content/polaroids.json',encodedBase64(JSON.stringify({photos:published},null,2)+'\n'),'Publish Polaroid photos and captions');
    photoDraft=published;
    try { localStorage.removeItem(PHOTO_DRAFT); } catch (_) {}
  }
  function showTools() {
    dialog.innerHTML = heading() +
      '<p>Choisis un objet à régler. Tu retrouves les boîtes de dialogue et les poignées de placement déjà créées.</p>' +
      '<div class="nana-admin-grid">' +
      '<button class="nana-admin-action" data-tool="posterEdit">Affiches et miroir</button>' +
      '<button class="nana-admin-action" data-tool="lampEdit">Lampe murale</button>' +
      '<button class="nana-admin-action" data-tool="starsEdit">Étoiles fluorescentes</button>' +
      '<button class="nana-admin-action" data-tool="cookieEdit">Fortune cookie</button>' +
      '<button class="nana-admin-action" data-tool="ipadClockEdit">Horloge de l’iPad</button>' +
      '<button class="nana-admin-action" data-tool="ribbons">Rubans des illustrations</button>' +
      '<button class="nana-admin-action" data-tool="polaroids">Polaroïds : photos et textes</button>' +
      '<button class="nana-admin-action" data-tool="conte">La Princesse Clown : composer le livre</button>' +
      '<button class="nana-admin-action" data-tool="zones">Zones cliquables</button>' +
      '<button class="nana-admin-action" data-tool="normal">Voir le site sans éditeur</button>' +
      '</div>' +
      '<div class="nana-admin-divider"><strong>Enregistrer et publier</strong>' +
      '<p class="nana-admin-note">Les réglages et les photos sont d’abord sauvegardés dans ce navigateur. Exporte-les ensemble en sauvegarde, ou publie-les avec une autorisation GitHub pour les rendre visibles par tous.</p>' +
      '<div class="nana-admin-actions">' +
      '<button class="nana-admin-action" id="nana-admin-export">Exporter réglages et photos (.json)</button>' +
      '<button class="nana-admin-action nana-admin-primary" id="nana-admin-publish-toggle">Publier sur le site</button>' +
      '</div><div id="nana-admin-publish-box" hidden>' +
      '<p>Utilise un jeton d’accès personnel GitHub <strong>fine-grained</strong>, limité à <strong>Portfolio-chambre</strong>, autorisation <strong>Contents: Read and write</strong>. Ne saisis jamais ton mot de passe GitHub.</p>' +
      '<label for="nana-admin-github-token">Jeton GitHub (non sauvegardé)</label>' +
      '<input id="nana-admin-github-token" type="password" autocomplete="off" placeholder="github_pat_…">' +
      '<div class="nana-admin-actions"><button class="nana-admin-action nana-admin-primary" id="nana-admin-publish-now">Confirmer la publication</button></div>' +
      '<p class="nana-admin-status" id="nana-admin-publish-status" role="status"></p></div></div>' +
      '<div class="nana-admin-actions"><button class="nana-admin-action" id="nana-admin-logout">Fermer la session privée</button></div>';
    wireClose();
    dialog.querySelectorAll('[data-tool]').forEach(button=>{
      button.addEventListener('click',()=>{
        const action=button.dataset.tool;
        if(action==='polaroids') { editPolaroids(); return; }
        if(action==='conte') { location.assign('atelier-conte/'); return; }
        if(action==='ribbons') {
          dialog.close();
          if(!document.querySelector('#art-tiles .art-tile--for-sale'))
            document.querySelector('#dock [data-open="photos"]')?.click();
          setTimeout(()=>document.getElementById('nana-ribbon-edit')?.click(),120);
          return;
        }
        changeTool(action==='normal'?null:action);
      });
    });
    dialog.querySelector('#nana-admin-export').addEventListener('click',downloadSettings);
    dialog.querySelector('#nana-admin-publish-toggle').addEventListener('click',()=>{
      const box=dialog.querySelector('#nana-admin-publish-box');
      box.hidden=!box.hidden;
      if(!box.hidden)box.querySelector('input').focus();
    });
    dialog.querySelector('#nana-admin-publish-now').addEventListener('click',()=>{
      const input=dialog.querySelector('#nana-admin-github-token');
      const status=dialog.querySelector('#nana-admin-publish-status');
      const token=input.value.trim();input.value='';
      if(!token){status.textContent='Saisis un jeton GitHub avec accès au dépôt.';return;}
      publish(token,status,dialog.querySelector('#nana-admin-publish-now'));
    });
    dialog.querySelector('#nana-admin-logout').addEventListener('click',()=>{
      try{sessionStorage.removeItem(SESSION)}catch(_){}
      document.documentElement.classList.remove('nana-admin-session');
      changeTool(null);
    });
  }
  entry.addEventListener('click',()=>{
    if(dialog.open){dialog.close();return;}
    if(isUnlocked())showTools();else showLogin();
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  });
})();

