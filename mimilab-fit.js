(() => {
  "use strict";
  // A capped iframe can be landscape inside a portrait iPad window.
  // Follow the containing window instead of scaling the whole interface.
  const root = document.documentElement;
  let host = window;
  try {
    if (window.parent !== window && window.parent.location.origin === location.origin) host = window.parent;
  } catch (_) { /* Cross-origin embeds use their own viewport. */ }
  root.classList.toggle("dl-standalone", window.parent === window);
  function syncLayout() {
    const portrait = host.innerHeight >= host.innerWidth;
    root.classList.toggle("dl-force-portrait", portrait);
    root.classList.toggle("dl-force-landscape", !portrait);
  }
  host.addEventListener("resize", syncLayout, {passive:true});
  host.addEventListener("orientationchange", syncLayout, {passive:true});
  window.addEventListener("pagehide", () => {
    host.removeEventListener("resize", syncLayout);
    host.removeEventListener("orientationchange", syncLayout);
  }, {once:true});
  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && host !== window){
      event.preventDefault();
      host.postMessage({type:"portfolio-close-dreamlab"}, location.origin);
    }
  });
  syncLayout();
})();
