/* Léna's original PNG drawings. Replace UI glyphs, never text inputs or artwork. */
(() => {
  'use strict';
  if (window.NanaDrawings) return;
  const base = document.currentScript.src;
  const url = name => new URL(`assets/drawn-ui/${name}.png`, base).href;
  const icons = {
    '←':'fleche_gauche','→':'fleche_droite','↑':'fleche_haut','↓':'fleche_bas_telecharger',
    '↗':'fleche_lien_agrandir','↶':'annuler','↷':'retablir','↻':'retourner_recommencer','⟳':'retourner_recommencer',
    '‹':'chevron_gauche','›':'chevron_droit','▶':'lecture','▷':'lecture','Ⅱ':'pause','⏸':'pause',
    '■':'arret','●':'enregistrement','＋':'ajouter','✕':'fermer_atelier','✖':'supprimer','×':'supprimer',
    '✓':'valider','✔':'valider','✎':'crayon_pinceau','✏':'crayon_pinceau','⌫':'gomme',
    '▣':'pot_packaging','▤':'fond','▦':'vue_grille','☷':'vue_liste','☰':'vue_liste',
    '⌕':'loupe_typographique','☀':'soleil','☼':'soleil_marseille','☾':'lune','☽':'lune',
    '✉':'enveloppe','⌂':'maison','▧':'image_couverture','♧':'artistes','✿':'fleur',
    '★':'etoile_pleine','✦':'etincelle_pleine','✧':'etincelle_vide','✳':'ornement_certificat',
    '♪':'note_musique','♫':'notes_musique','♩':'note_son_coupe','▂':'reseau_telephone','▰':'batterie_telephone'
  };
  const tokens = new RegExp('['+Object.keys(icons).join('')+'](?:[\\uFE0E\\uFE0F])?|\\+','gu');
  const skip = 'script,style,textarea,input,select,option,code,pre,noscript,svg,[contenteditable],.lena-icon,.nana-window-close,[data-nana-script]';
  const labels = {lecture:'Lire',pause:'Pause',arret:'Arrêter',enregistrement:'Enregistrer',ajouter:'Ajouter',supprimer:'Supprimer',fermer_atelier:'Fermer',valider:'Valider',annuler:'Annuler',retablir:'Rétablir'};
  function icon(name, glyph, doc=document) {
    const img=doc.createElement('span');
    img.className='lena-icon';
    img.style.setProperty('--lena-icon-art',`url("${url(name)}")`);
    img.setAttribute('role','img');
    img.setAttribute('aria-label',labels[name]||glyph||'');
    img.dataset.lenaIcon=name;
    return img;
  }
  function replaceText(node) {
    const parent=node.parentElement, value=node.nodeValue;
    if(!parent||!value||parent.closest(skip))return;
    tokens.lastIndex=0;if(!tokens.test(value))return;
    tokens.lastIndex=0;
    const fragment=node.ownerDocument.createDocumentFragment();let start=0,changed=false;
    for(const match of value.matchAll(tokens)){
      const glyph=match[0].replace(/[\uFE0E\uFE0F]/g,'');
      // A plus used in prose, a recipe or a numerical value is still text.
      if(glyph==='+'&&(!parent.closest('button')||!/^\s*\+\s*(?:[A-Za-zÀ-ÿ]|$)/.test(value)))continue;
      if(glyph==='×'&&!parent.closest('button,.remove,.close'))continue;
      fragment.append(node.ownerDocument.createTextNode(value.slice(start,match.index)));
      const image=icon(glyph==='+'?'ajouter':icons[glyph],glyph,node.ownerDocument);
      if(parent.closest('[aria-label]') || (parent.closest('button,a')?.textContent||value).replace(tokens,'').trim()){image.removeAttribute('aria-label');image.setAttribute('aria-hidden','true');}
      fragment.append(image);start=match.index+match[0].length;changed=true;
    }
    if(!changed)return;
    fragment.append(node.ownerDocument.createTextNode(value.slice(start)));
    node.replaceWith(fragment);
  }
  function visit(root) {
    if(root.nodeType===3){replaceText(root);return;}
    if(![1,9,11].includes(root.nodeType)||root.matches?.(skip))return;
    const doc=root.ownerDocument||root;
    const walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(replaceText);
  }
  function fixedIcons(){
    for(const [selector,name] of [['#menu-search > svg','loupe_barre_du_haut'],['#nana-admin-trigger > svg','cadenas_atelier']]){
      document.querySelectorAll(selector).forEach(svg=>{
        const image=icon(name,'');image.setAttribute('aria-hidden','true');svg.replaceWith(image);
      });
    }
  }
  function start(){
    visit(document.body);fixedIcons();
    // Process only changed subtrees. Playback, translations and modal creation
    // can replace textContent; observing those updates keeps all states drawn.
    const observer=new MutationObserver(records=>{
      for(const record of records){
        if(record.type==='characterData')replaceText(record.target);
        else record.addedNodes.forEach(visit);
      }
      fixedIcons();
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  window.NanaDrawings={url,icon,visit};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
