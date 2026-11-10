/* Private, daily aggregate counters. No IP, user-agent, referer or request bodies logged. */
const pages = ['room','shop','dressing','mimilab','latte','tamagotchi','polaroids','coloring'];
const games = ['dressing','latte','tamagotchi','coloring','bead-box','do-nothing','word-lab','mimilab','fortune-cookie'];
const objects = ['miffy','reading-room','souvenues','marshall','music-visuals','phone','gabzilla','gearnews-series','imac','lampe-fleur',
  'cds','iphone','book','rilakkuma','guitare','ring-light','chat','instax','vase','guirlande','jelly','crayons-1','crayons-2','crayons-3',
  'livres-1','livres-2','livres-3','lampe-bureau','ipad','tapis','bambi-lampe','sonny-angel','bretzel','cv'];
export const allowed = new Set([
  ...pages.map(x=>'page/'+x), ...games.map(x=>'visit/jeu/'+x), ...objects.map(x=>'visit/objet/'+x),
  'visit/night','visit/photos','visit/livre/la-princesse-clown',
  ...['look-saved','latte-made','beads-made','minilab-composed','rested','outfit-styled','polaroids-all'].map(x=>'action/'+x)
]);
const date = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const cutoff = () => new Date(Date.now()-90*86400000).toISOString().slice(0,10);
const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const escape = value => String(value).replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
async function authorized(request, env) {
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 24) return false;
  // Hash both values before a constant-time comparison; credentials never enter the database.
  const expected = 'Basic '+btoa('lena:'+env.ADMIN_PASSWORD);
  const digest = text => crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const [a,b] = await Promise.all([digest(request.headers.get('Authorization')||''),digest(expected)]);
  const aa=new Uint8Array(a),bb=new Uint8Array(b);let different=0;
  for(let i=0;i<aa.length;i++)different|=aa[i]^bb[i];
  return different===0;
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/collect' && request.method === 'POST') {
      if (request.headers.get('Origin') !== env.SITE_ORIGIN) return new Response(null,{status:403,headers});
      if (!/^text\/plain(?:;|$)/i.test(request.headers.get('Content-Type')||'')) return new Response(null,{status:415,headers});
      // Read at most 100 bytes, including when Content-Length is missing or dishonest.
      const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400,headers});
      const chunks=[];let length=0;
      while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;
        if(length>100){await reader.cancel();return new Response(null,{status:413,headers});}chunks.push(part.value);}
      const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      const event=new TextDecoder().decode(bytes);
      if (!allowed.has(event)) return new Response(null,{status:400,headers});
      await env.DB.prepare('INSERT INTO counters(day,event,total) VALUES (?,?,1) ON CONFLICT(day,event) DO UPDATE SET total=total+1').bind(date(),event).run();
      return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Origin':env.SITE_ORIGIN,'Vary':'Origin'}});
    }
    if (path === '/' && request.method === 'GET') {
      if (!await authorized(request,env)) return new Response('Accès privé',{status:401,headers:{...headers,'WWW-Authenticate':'Basic realm="Statistiques Nana", charset="UTF-8"'}});
      const {results} = await env.DB.prepare('SELECT event,SUM(total) AS total FROM counters WHERE day>=? GROUP BY event ORDER BY total DESC').bind(cutoff()).all();
      const rows=results.map(row=>`<tr><td>${escape(row.event)}</td><td>${escape(row.total)}</td></tr>`).join('');
      return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Statistiques Nana</title><style>body{font:18px system-ui;max-width:55rem;margin:3rem auto;padding:1rem;color:#b51535;background:#fff2fc}td,th{text-align:left;padding:.5rem 1rem}a{color:inherit}</style><h1>La chambre en chiffres</h1><p>Totaux des 90 derniers jours. Ce sont des ouvertures et actions, pas des personnes uniques. Les rechargements et appareils différents peuvent compter plusieurs fois.</p><p>latte-made : étape dessin atteinte · beads-made : au moins trois perles enfilées · look-saved : nouveau look enregistré. Les autres actions sont comptées au plus une fois par chargement de page.</p><table><thead><tr><th>Compteur</th><th>Total</th></tr></thead><tbody>${rows||'<tr><td colspan="2">Aucune mesure reçue.</td></tr>'}</tbody></table></html>`,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
    }
    return new Response(null,{status:404,headers});
  },
  async scheduled(controller,env) {
    await env.DB.prepare('DELETE FROM counters WHERE day < ?').bind(cutoff()).run();
  }
};
