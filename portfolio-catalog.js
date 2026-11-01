/* Portfolio catalog: categories and private project tags. */
window.portfolioCatalog = [
 {title:"La Princesse Clown",category:"Editorial",project:"clown-princess",tags:["book","illustration"],open:"book"},
 {title:"Illustration",category:"Illustration",project:"illustration",tags:["drawing","art"],open:"photos"},
 {title:"Animation",category:"Animation",project:"animation",tags:["video","motion"],open:"motion"},
 {title:"Music & Visuals",category:"Music",project:"music-visuals",tags:["music","visual"],open:"music"},
 {title:"Writing & Editorial",category:"Editorial",project:"editorial",tags:["writing","articles"],open:"pages"},
 {title:"Mini Games",category:"Interactive",project:"mini-games",tags:["games"],open:"mini-games"}
];
window.portfolioRelated = project => window.portfolioCatalog.filter(item => item.project === project);
window.portfolioRegisterArtwork = item => {
 if(!item || !item.title || !item.category || !item.project) return false;
 window.portfolioCatalog.push({...item,tags:Array.isArray(item.tags)?item.tags:[]});
 return true;
};
