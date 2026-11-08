(() => {
  "use strict";
  // The room illustration and mini-games catalog open this shared studio window.
  const desktop = document.getElementById("desktop"),
    play = document.getElementById("play-viewport");
  if (!desktop || !play) return;
  const style = document.createElement("style");
  style.id = "nana-dreamlab-launcher-style";
  style.textContent = `
@font-face{font-family:NanaTraceStudio;src:url("assets/fonts/NanaTraceUI-Regular.woff2") format("woff2");font-display:swap}#nana-dreamlab-topbar,#nana-dreamlab-topbar *{font-family:NanaTraceStudio,"Comic Sans MS",cursive!important;font-style:normal!important;font-weight:400!important}
#nana-dreamlab-language,#nana-dreamlab-close{clip-path:polygon(2% 0%,96% 2%,100% 94%,3% 100%,0% 7%)!important;box-shadow:2px 2px 0 #f10b3940!important;font-family:NanaTraceStudio,"Comic Sans MS",cursive!important;font-weight:400!important}#nana-dreamlab-close{display:flex;align-items:center;justify-content:center;padding:0;width:36px;height:30px}
#nana-dreamlab-close::before,#nana-dreamlab-close::after{content:none!important;display:none!important}
#nana-dreamlab-close img{display:block;width:30px;height:30px;object-fit:contain;pointer-events:none}

#nana-dreamlab-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(30,7,33,.75);display:grid;place-items:center;padding:15px}
#nana-dreamlab-window{position:relative;background:#ffe3ed;border:3px solid #f10b39;width:min(1240px,100%);height:min(900px,calc(100dvh - 30px));display:flex;flex-direction:column;box-shadow:7px 7px 0 #f10b3970}
#nana-dreamlab-topbar{display:flex;justify-content:space-between;align-items:center;background:#ffe6f0;color:#f10b39;border-bottom:2px solid #f10b39;padding:6px 10px;font:700 16px/1.2 "NanaTraceUI","Comic Sans MS",cursive}
#nana-dreamlab-actions{display:flex;align-items:center;gap:6px;margin-left:auto}#nana-dreamlab-language{font:inherit;color:#f10b39;background:#fff;border:2px solid #f10b39;border-radius:0;cursor:pointer;min-width:36px;min-height:30px;padding:2px 5px}#nana-dreamlab-close{font:inherit;color:#f10b39;background:#fff;border:2px solid #f10b39;border-radius:0;cursor:pointer;min-width:32px;min-height:30px}
#nana-dreamlab-iframe{display:block;width:100%;height:auto;min-height:0;border:0;background:#ffedf6;flex:1 1 0}
@media(max-width:760px){#nana-dreamlab-overlay{padding:0}#nana-dreamlab-window{height:100dvh;width:100%;border:0;box-shadow:none}#nana-dreamlab-topbar{padding:6px 10px}}

@media (orientation:portrait) and (min-width:761px){#nana-dreamlab-window{height:calc(100dvh - 30px)!important}}
@media (orientation:landscape) and (min-width:900px){
 #nana-dreamlab-window{
   height:min(calc(100dvh - 24px),calc(min(1240px,100vw - 30px) * .61))!important;
   max-height:calc(100dvh - 24px)!important;
 }
 #nana-dreamlab-iframe{min-height:0!important}
}
`;
  document.head.append(style);
  let overlay = null,
    restoreOverflow = "",
    previousFocus = null;
  function close() {
    if (!overlay) return;
    const panel = overlay;
    overlay = null;
    // Removing the iframe stops playback and releases all its audio resources.
    const iframe = panel.querySelector("iframe");
    if (iframe) iframe.remove();
    panel.remove();
    document.body.style.overflow = restoreOverflow;
    document.removeEventListener("keydown", esc, true);
    document.dispatchEvent(new Event("nana-dreamlab-close"));
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  function esc(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      close();
    }
  }
  window.addEventListener("message", (e) => {
    if (
      e.origin !== location.origin ||
      e.source !== overlay?.querySelector("iframe")?.contentWindow
    )
      return;
    if (e.data?.type === "portfolio-close-dreamlab") close();
  });
  function open() {
    if (overlay) return;
    previousFocus = document.activeElement;
    restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay = document.createElement("div");
    overlay.id = "nana-dreamlab-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "mimilab 3");
    const panel = document.createElement("div");
    panel.id = "nana-dreamlab-window";
    const bar = document.createElement("div");
    bar.id = "nana-dreamlab-topbar";
    const label = document.createElement("span");
    label.textContent = "Mimilab 3";
    const x = document.createElement("button");
    x.type = "button";
    x.id = "nana-dreamlab-close";
    const closeArt = document.createElement("img");
    closeArt.src = "assets/portfolio-ux/IMG_5035.png";
    closeArt.alt = "";
    closeArt.setAttribute("aria-hidden", "true");
    x.append(closeArt);
    x.setAttribute(
      "aria-label",
      document.documentElement.lang.startsWith("en")
        ? "Close mimilab 3"
        : "Fermer mimilab 3",
    );
    x.addEventListener("click", close);
    bar.append(label, x);
    window.NanaWindowChrome?.decorate(bar, label, x);
    const iframe = document.createElement("iframe");
    iframe.id = "nana-dreamlab-iframe";
    iframe.title = "mimilab 3";
    iframe.setAttribute("allow", "autoplay");
    iframe.src =
      "dreamlab.html?v=20261108-paint-overalls-1&lang=" +
      (document.documentElement.lang.toLowerCase().startsWith("en")
        ? "en"
        : "fr");
    panel.append(bar, iframe);
    overlay.append(panel);
    document.body.append(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", esc, true);
    x.focus();
    document.dispatchEvent(new Event("nana-dreamlab-open"));
  }
  window.NanaDreamLab = { open, close };
})();

