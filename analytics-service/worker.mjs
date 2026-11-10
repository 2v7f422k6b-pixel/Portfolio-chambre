import catalogue from './metrics.json' with {type:'json'};
const sectionTitles={
  "1": "Ouvertures du site",
  "2": "Fréquentation par jour",
  "4": "Ouvertures des modes Play et Work",
  "6": "Temps actif dans les modes Play et Work",
  "9": "Ouvertures du carnet",
  "10": "Rubriques du carnet consultées",
  "12": "Exploration de la chambre sur mobile",
  "14": "Illustrations consultées",
  "16": "Visionnage des vidéos",
  "17": "Livres ouverts et pages consultées",
  "18": "Lectures jusqu’à la dernière page",
  "24": "Consultations et téléchargements du CV",
  "25": "Ouvertures des ateliers et mini-jeux",
  "28": "Activités terminées",
  "29": "Sorties avant la fin d’une activité",
  "30": "Temps actif dans les activités",
  "34": "Étapes et envois de lattés",
  "35": "Compositions de perles",
  "36": "Créations musicales dans le Mimilab",
  "37": "Poèmes sauvegardés, coloriages exportés et livres favoris",
  "38": "Écussons et tenues débloqués",
  "39": "Ouvertures de la boutique et de ses catégories",
  "40": "Fiches produits consultées",
  "41": "Clics vers l’achat",
  "42": "Ouvertures et clics de contact",
  "43": "Envois et erreurs des formulaires",
  "44": "Invitations et formulaire de newsletter",
  "45": "Demandes d’inscription à la newsletter envoyées",
  "46": "Types d’appareils",
  "50": "Provenance des visites",
  "51": "Pays des visites",
  "53": "Erreurs techniques"
};
export const allowed=new Set(Object.keys(catalogue.metrics));
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const since=days=>{const d=new Date(day()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(days-1));return d.toISOString().slice(0,10);};
const escape=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
async function authorized(request,env){if(!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<24)return false;
 const hash=text=>crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
 const [a,b]=await Promise.all([hash(request.headers.get('Authorization')||''),hash('Basic '+btoa('lena:'+env.ADMIN_PASSWORD))]);
 let diff=0;const aa=new Uint8Array(a),bb=new Uint8Array(b);for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0;}
function write(env,event,value){return env.DB.prepare('INSERT INTO daily_metrics(day,event,samples,value_sum) VALUES (?,?,1,?) ON CONFLICT(day,event) DO UPDATE SET samples=samples+1,value_sum=value_sum+excluded.value_sum').bind(day(),event,value);}
export default {
 async fetch(request,env){const url=new URL(request.url);
  if(url.pathname==='/collect'&&request.method==='POST'){
   if(request.headers.get('Origin')!==env.SITE_ORIGIN)return new Response(null,{status:403,headers});
   if(!/^text\/plain(?:;|$)/i.test(request.headers.get('Content-Type')||''))return new Response(null,{status:415,headers});
   const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400,headers});
   const chunks=[];let size=0;while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>200){await reader.cancel();return new Response(null,{status:413,headers});}chunks.push(part.value);}
   const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
   let payload;try{payload=JSON.parse(new TextDecoder().decode(bytes));}catch(_){return new Response(null,{status:400,headers});}
   if(!payload||Object.keys(payload).sort().join(',')!=='event,value'||!allowed.has(payload.event))return new Response(null,{status:400,headers});
   const metric=catalogue.metrics[payload.event],value=payload.value;
   if(!Number.isInteger(value)||(metric.kind==='seconds'?(value<1||value>1800):value!==1))return new Response(null,{status:400,headers});
   const writes=[write(env,payload.event,value)];
   // Country alone, only on an entry request. Never read or store an IP, city or ASN.
   if(payload.event==='site/open'){const country=request.cf?.country;writes.push(write(env,'country/'+(/^[A-Z]{2}$/.test(country||'')&&country!=='XX'?country:'unknown'),1));}
   await env.DB.batch(writes);
   return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Origin':env.SITE_ORIGIN,Vary:'Origin'}});
  }
  if(url.pathname==='/'&&request.method==='GET'){
   if(!await authorized(request,env))return new Response('Accès privé',{status:401,headers:{...headers,'WWW-Authenticate':'Basic realm="Statistiques Nana", charset="UTF-8"'}});
   const days=[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30;
   const {results}=await env.DB.prepare('SELECT event,SUM(samples) AS samples,SUM(value_sum) AS value_sum FROM daily_metrics WHERE day>=? GROUP BY event ORDER BY event').bind(since(days)).all();
   const {results:daily}=await env.DB.prepare("SELECT day,SUM(samples) AS total FROM daily_metrics WHERE day>=? AND event='site/open' GROUP BY day ORDER BY day DESC").bind(since(days)).all();
   const groups=new Map();let smallCountries=0;const regionNames=new Intl.DisplayNames(['fr'],{type:'region'});
   for(const row of results){let metric=catalogue.metrics[row.event];
    if(row.event.startsWith('country/')){if(row.samples<10){smallCountries+=row.samples;continue;}const code=row.event.slice(8);metric={number:51,label:code==='unknown'?'Pays indéterminé':regionNames.of(code),kind:'count'};}
    if(!metric)continue;
    if(!groups.has(metric.number))groups.set(metric.number,[]);
    groups.get(metric.number).push({label:metric.label,value:metric.kind==='seconds'?Math.round(row.value_sum/row.samples)+' s en moyenne ('+row.samples+' périodes observées)':row.samples});
   }
   if(smallCountries){if(!groups.has(51))groups.set(51,[]);groups.get(51).push({label:'Pays regroupés · moins de 10 ouvertures chacun',value:smallCountries});}
   const section=(n,rows)=>'<section><h2>'+escape(sectionTitles[n])+'</h2><table><tbody>'+rows.map(r=>'<tr><th scope="row">'+escape(r.label)+'</th><td>'+escape(r.value)+'</td></tr>').join('')+'</tbody></table></section>';
   const content=catalogue.selected.map(n=>n===2?section(2,daily.map(r=>({label:r.day,value:r.total}))):catalogue.pending[n]?section(n,[{label:catalogue.pending[n],value:'À relier'}]):section(n,groups.get(n)||[{label:'Aucune mesure reçue sur cette période',value:'—'}])).join('');
   return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Statistiques Nana</title><style>body{font:17px system-ui;max-width:60rem;margin:2rem auto;padding:1rem;color:#a51232;background:#fff2fc}td,th{text-align:left;padding:.6rem;overflow-wrap:anywhere}th{font-weight:400}table{width:100%;table-layout:fixed}td{width:35%}a{color:inherit}section{margin:2rem 0}</style><h1>La chambre en chiffres</h1><nav aria-label="Période">${[7,30,90].map(n=>`<a href="?days=${n}"${n===days?' aria-current="page"':''}>${n} jours</a>`).join(' · ')}</nav><p>Du ${since(days)} au ${day()} · jours de Paris. Totaux d’ouvertures et d’actions, pas de personnes uniques. Les bloqueurs, erreurs réseau et fermetures brutales peuvent réduire les mesures.</p><p>Temps actif estimé : page visible et interaction dans les 60 dernières secondes, plafonné à 30 minutes par période. Une sortie avant la fin ne concerne que le latte et le club du rien, qui ont une fin définie. Export signifie téléchargement déclenché, pas réception confirmée du fichier.</p>${content}</html>`,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
  }
  return new Response(null,{status:404,headers});
 },
 async scheduled(controller,env){await env.DB.prepare('DELETE FROM daily_metrics WHERE day < ?').bind(since(90)).run();}
};
