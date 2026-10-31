/* Pages — editorial archive / Nana Portfolio.
 * Original links supplied by the author; La Ppite links use web archives.
 * Cover art is TYPOGRAPHIC PLACEHOLDER until original article thumbnails can be verified.
 * No external libraries or third-party tracking.
 */
(() => {
  'use strict';
  const SOURCES = [
    {id:'gn',name:'Gearnews.fr',short:'GEARNEWS',descriptor:'Music, ideas & creative practice',number:'01'},
    {id:'jdj',name:'Journal du Japon',short:'JOURNAL DU JAPON',descriptor:'Japanese culture, society & history',number:'02'},
    {id:'pp',name:'La Ppite',short:'LA PPITE',descriptor:'Rap, interviews & music criticism',number:'03'},
    {id:'mouv',name:"Mouv'",short:"MOUV'",descriptor:'Rap, music & pop culture',number:'04'}
  ];
  const ARTICLES = [["gn","La musique est-elle un art comme les autres ?","Philosophie & musique","14 oct. 2026","https://www.gearnews.fr/la-musique-est-elle-un-art-comme-les-autres/"],["gn","Musicien·nes : 8 hacks pour gagner des abonné·es passés au crible","Réseaux sociaux","29 juil. 2026","https://www.gearnews.fr/musicien-nes-8-methodes-pour-gagner-des-abonne-es/"],["gn","Faut-il souffrir pour faire de la musique ?","Créativité & bien-être","3 juin 2026","https://www.gearnews.fr/faut-il-souffrir-pour-faire-de-la-musique/"],["gn","Musicien·ne : comment trouver ta direction artistique (DA) ?","Direction artistique","30 avr. 2026","https://www.gearnews.fr/trouver-ta-direction-artistique-da/"],["gn","« Percer sur Insta » pour les musicien·nes… mythe ou réalité ?","Musique & réseaux","23 mars 2026","https://www.gearnews.fr/percer-sur-insta-pour-les-musiciens/"],["jdj","Japon : n’oublions pas les femmes guerrières !","Histoire & société","9 sept. 2016","https://www.journaldujapon.com/2016/09/09/societe-japon-noublions-pas-les-femmes-guerrieres/"],["jdj","Business-women japonaises : évolution ou stagnation ?","Société & travail","26 avr. 2016","https://www.journaldujapon.com/2016/04/26/business-women-japonaises-evolution-ou-stagnation/"],["jdj","Mère, idol, makeinu : choix et périples de la femme japonaise","Dossier · Société","14 févr. 2016","https://www.journaldujapon.com/2016/02/14/dossier-mere-idol-makeinu-choix-et-periples-de-la-femme-japonaise/"],["jdj","Mariage japonais : les femmes dans l’impasse ?","Dossier · Société","14 févr. 2016","https://www.journaldujapon.com/2016/02/14/dossier-mariage-japonais-les-femmes-dans-limpasse/"],["pp","Bekar : rapper plus fort que l’orage","Interview","3 avr. 2023","https://web.archive.org/web/20260115055137/https://www.lappite.fr/bekar-rapper-plus-fort-que-lorage/"],["pp","Rap français et santé mentale : tentative de psychothérapie","Rap & santé mentale","17 oct. 2022","https://web.archive.org/web/20260216195208/https://www.lappite.fr/rap-francais-et-sante-mentale-tentative-de-psychotherapie/"],["pp","« Les Masques » de Joysad : la puissance de la fragilité","Analyse · Société","24 oct. 2022","https://web.archive.org/web/20251117104229/https://www.lappite.fr/les-masques-de-joysad-la-puissance-de-la-fragilite/"],["pp","Le Hip-Hop Symphonique, prestigieuse anomalie de la scène rap","Reportage & musique","29 déc. 2022","https://web.archive.org/web/20251117095411/https://www.lappite.fr/le-hhs-la-prestigieuse-anomalie-de-la-scene-rap/"],["mouv","Pourquoi Atlanta est l’une des meilleures séries (rap)","Rap & séries","24 mars 2022","https://www.radiofrance.fr/mouv/pourquoi-atlanta-est-l-une-des-meilleures-series-rap-7701213"],["mouv","Pourquoi tout le monde aime Laylow ?","Rap français","16 mars 2022","https://www.radiofrance.fr/mouv/pourquoi-tout-le-monde-aime-laylow-2741434"],["mouv","Manga : ces classiques qui ont marqué les années 2000","Manga & pop culture","11 mars 2022","https://www.radiofrance.fr/mouv/manga-ces-classiques-qui-ont-marque-les-annees-2000-1844072"],["mouv","Rap marocain : les rappeurs les plus chauds du moment","Rap international","","https://www.radiofrance.fr/mouv/rap-marocain-les-rappeurs-les-plus-chauds-du-moment-5910542"]];
  let sourceFilter='all';
  let searchQuery='';
  let displayMode='covers';
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const getSource=id=>SOURCES.find(s=>s.id===id);
  const safeURL=url=> /^https:\/\//.test(url) ? url : '#';
  const wordMark=article=> article[1].replace(/[«»?!:…().]/g,' ').split(/\s+/).filter(w=>w.length>3).slice(0,3).join(' / ').toUpperCase();
  const total=ARTICLES.length;
  function itemHTML(article,index){
    const [id,title,topic,date,url]=article;
    const s=getSource(id);
    const archived=id==='pp';
    const number=String(index+1).padStart(2,'0');
    return `<article class="pages-item">
       <a class="pages-cover pages-cover-${id}" href="${escapeHTML(safeURL(url))}" target="_blank" rel="noopener noreferrer" aria-label="Lire : ${escapeHTML(title)} (${escapeHTML(s.name)})">
         <span class="pages-cover-top"><span>${escapeHTML(s.short)}</span><span>№ ${number}</span></span>
         <span class="pages-cover-center" aria-hidden="true"><span class="pages-cover-lines"></span><span class="pages-cover-keyword">${escapeHTML(wordMark(article))}</span></span>
         <span class="pages-cover-bottom"><span>NANA / WRITING</span><span>${archived?'ARCHIVE ↗':'READ ↗'}</span></span>
       </a>
       <div class="pages-item-meta"><span>${escapeHTML(topic)}</span><span>${escapeHTML(date)}</span></div>
       <h3><a href="${escapeHTML(safeURL(url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(title)}</a></h3>
       <div class="pages-item-foot"><span>${escapeHTML(s.name)}</span><a href="${escapeHTML(safeURL(url))}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir l'article : ${escapeHTML(title)}">${archived?'Lire l’archive ↗':'Lire l’article ↗'}</a></div>
     </article>`;
  }
  function matches(article){
    if(sourceFilter!=='all'&&article[0]!==sourceFilter)return false;
    if(!searchQuery.trim())return true;
    const s=getSource(article[0]);
    const content=normalize([article[1],article[2],article[3],s.name].join(' '));
    return content.includes(normalize(searchQuery.trim()));
  }
  function collectionHTML(s){
    const articles=ARTICLES.map((a,i)=>({a,i})).filter(o=>o.a[0]===s.id&&matches(o.a));
    if(!articles.length)return '';
    return `<section class="pages-shelf" aria-label="${escapeHTML(s.name)}">
       <header class="pages-shelf-heading">
         <div><span class="pages-shelf-index">/ ${s.number}</span><h2>${escapeHTML(s.name)}</h2><p>${escapeHTML(s.descriptor)}</p></div>
         <span class="pages-shelf-total">${articles.length} ARTICLE${articles.length>1?'S':''}</span>
       </header>
       <div class="pages-grid ${displayMode==='list'?'pages-grid-list':''}">${articles.map(o=>itemHTML(o.a,o.i)).join('')}</div>
     </section>`;
  }
  function render(){
    const host=document.getElementById('pages-collections');
    if(!host)return;
    const sections=SOURCES.filter(s=>sourceFilter==='all'||sourceFilter===s.id).map(collectionHTML).join('');
    host.innerHTML=sections||'<div class="pages-no-results"><span>⌕</span><h3>Aucun article trouvé</h3><p>Essaie une autre recherche ou choisis un autre média.</p></div>';
    const count=document.getElementById('pages-result-count');
    if(count)count.textContent=ARTICLES.filter(matches).length+' / '+total+' ARTICLES';
    document.querySelectorAll('#pages-library [data-pages-source]').forEach(button=>{
      const selected=button.dataset.pagesSource===sourceFilter;
      button.setAttribute('aria-pressed',String(selected));
      button.classList.toggle('selected',selected);
    });
    document.querySelectorAll('#pages-library [data-pages-layout]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.pagesLayout===displayMode));
    });
  }
  function openEditorialPages(){
    if(typeof window.openWindow!=='function')return;
    sourceFilter='all';searchQuery='';displayMode='covers';
    window.openWindow('Pages — Editorial Library',`
      <div id="pages-library" class="pages-library">
        <div class="pages-masthead">
          <div class="pages-edition"><span>✳</span> NANA / PORTFOLIO <span>✳</span></div>
          <div class="pages-edition-right">VOL. 01 <span class="pages-edition-star">✦</span> WRITING ARCHIVE</div>
        </div>
        <div class="pages-intro">
          <div class="pages-intro-copy">
            <span class="pages-kicker">WORDS, IDEAS & CULTURE</span>
            <h1>Collected <em>Pages.</em></h1>
            <p>A selection of published writing, from music and philosophy to Japanese society and pop culture.</p>
            <div class="pages-intro-count"><strong>17</strong><span>ARTICLES<br>4 PUBLICATIONS</span><span class="pages-intro-scribble" aria-hidden="true">✷</span></div>
          </div>
          <div class="pages-feature" aria-hidden="true">
            <span class="pages-feature-caption">ISSUE 001 — SELECTED WRITING</span>
            <div class="pages-feature-inner"><span>the<br><i>written</i><br>word<span class="pages-feature-sun">✳</span></span></div>
            <span class="pages-feature-footer">NANA STUDIO / MARSEILLE</span>
          </div>
        </div>
        <div class="pages-controls">
          <div class="pages-tabbar" role="group" aria-label="Choisir le média">
            <button type="button" class="pages-tab selected" data-pages-source="all" aria-pressed="true">All <span>17</span></button>
            ${SOURCES.map(s=>`<button type="button" class="pages-tab" data-pages-source="${s.id}" aria-pressed="false">${escapeHTML(s.name)} <span>${ARTICLES.filter(a=>a[0]===s.id).length}</span></button>`).join('')}
          </div>
          <div class="pages-tools">
            <label class="pages-search"><span aria-hidden="true">⌕</span><input id="pages-search" type="search" placeholder="Search the archive" autocomplete="off" aria-label="Search articles"></label>
            <div class="pages-view" role="group" aria-label="Affichage">
              <button type="button" data-pages-layout="covers" aria-label="Afficher les couvertures" aria-pressed="true">▦</button>
              <button type="button" data-pages-layout="list" aria-label="Afficher la liste" aria-pressed="false">☷</button>
            </div>
          </div>
        </div>
        <div class="pages-results"><span id="pages-result-count" aria-live="polite">17 / 17 ARTICLES</span><span>CURATED EDITORIAL ARCHIVE</span></div>
        <div id="pages-collections"></div>
        <footer class="pages-footer"><span>✳ MADE OF WORDS</span><span>Original publications open in a new tab. La Ppite uses preserved web archives.</span></footer>
      </div>`,'pages-library');
    render();
  }
  // app.js defines openPages globally. Override only this app entry, not the main click routing.
  window.openPages=openEditorialPages;
  document.addEventListener('click',event=>{
    const filter=event.target.closest('#pages-library [data-pages-source]');
    if(filter){sourceFilter=filter.dataset.pagesSource;render();return;}
    const layout=event.target.closest('#pages-library [data-pages-layout]');
    if(layout){displayMode=layout.dataset.pagesLayout;render();}
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='pages-search'){searchQuery=event.target.value;render();}
  });
})();
