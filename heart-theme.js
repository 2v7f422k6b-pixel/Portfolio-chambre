/* Single source of truth for the artist's own drawn heart.
   Handles static text, interactive re-renders and same-origin mini-game iframes. */
(() => {
  'use strict';
  const TOKENS = /[♥♡❤❣💗💕💖💓💘💝💟💞💜🩷💛💚💙🖤🤍](?:\uFE0F|\uFE0E)?/gu;
  const SKIP = 'script,style,textarea,code,pre,noscript,svg,option,[contenteditable="true"]';
  const installed = new WeakSet();
  const frames = new WeakSet();
  const scriptBase = document.currentScript?.src || document.baseURI;
  const heartURL = new URL('assets/heart-lena.svg', scriptBase).href;
  const cssURL = new URL('heart-theme.css', scriptBase).href;

  function replaceText(node) {
    if (node.nodeType !== 3 || !node.parentElement || !node.nodeValue) return;
    if (node.parentElement.closest(SKIP) || node.parentElement.namespaceURI === 'http://www.w3.org/2000/svg') return;
    const original = node.nodeValue;
    TOKENS.lastIndex = 0;
    if (!TOKENS.test(original)) return;
    TOKENS.lastIndex = 0;
    const fragment = node.ownerDocument.createDocumentFragment();
    let start = 0;
    for (const match of original.matchAll(TOKENS)) {
      if (match.index > start) fragment.appendChild(node.ownerDocument.createTextNode(original.slice(start, match.index)));
      const icon = node.ownerDocument.createElement('span');
      icon.className = 'lena-heart';
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', 'cœur');
      fragment.appendChild(icon);
      start = match.index + match[0].length;
    }
    if (start < original.length) fragment.appendChild(node.ownerDocument.createTextNode(original.slice(start)));
    node.replaceWith(fragment);
  }

  function visit(root) {
    if (!root) return;
    if (root.nodeType === 3) return replaceText(root);
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1 && root.matches(SKIP)) return;
    const doc = root.nodeType === 9 ? root : root.ownerDocument;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const toReplace = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      TOKENS.lastIndex = 0;
      if (node.nodeValue && TOKENS.test(node.nodeValue) && !node.parentElement?.closest(SKIP)) toReplace.push(node);
    }
    toReplace.forEach(replaceText);
    if (root.nodeType === 1 && root.matches('iframe')) connectFrame(root);
    root.querySelectorAll?.('iframe').forEach(connectFrame);
  }

  function connectFrame(frame) {
    if (frames.has(frame)) return;
    frames.add(frame);
    const connect = () => {
      try {
        const inner = frame.contentDocument;
        if (inner?.documentElement) install(inner);
      } catch (_) { /* Leave cross-origin frames as they are. */ }
    };
    frame.addEventListener('load', connect);
    connect();
  }

  function catReaction(doc) {
    if (doc !== document) return;
    doc.querySelectorAll('#cat-response path.cat-heart').forEach(path => {
      let box;
      try { box = path.getBBox(); } catch (_) { return; }
      const size = Math.max(box.width / .73, box.height / .75);
      const icon = doc.createElementNS('http://www.w3.org/2000/svg', 'image');
      icon.setAttribute('href', heartURL);
      icon.setAttribute('x', String(box.x + (box.width - size) / 2));
      icon.setAttribute('y', String(box.y + (box.height - size) / 2));
      icon.setAttribute('width', String(size));
      icon.setAttribute('height', String(size));
      icon.setAttribute('class', path.getAttribute('class') || 'cat-heart');
      icon.setAttribute('aria-hidden', 'true');
      path.replaceWith(icon);
    });
  }

  function install(doc) {
    if (!doc.documentElement || installed.has(doc) || doc.documentElement.dataset.lenaHeartInstalled === 'true') return;
    installed.add(doc);
    doc.documentElement.dataset.lenaHeartInstalled = 'true';
    if (doc !== document && !doc.querySelector('link[data-lena-heart-style]')) {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
      style.href = cssURL;
      style.dataset.lenaHeartStyle = '';
      (doc.head || doc.documentElement).appendChild(style);
    }
    catReaction(doc);
    visit(doc.documentElement);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') replaceText(record.target);
        else record.addedNodes.forEach(visit);
      }
    });
    observer.observe(doc.documentElement, { subtree: true, childList: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => install(document), { once: true });
  else install(document);
})();
