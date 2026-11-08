/* Illustrations keep their file-based IDs even when the gallery is rearranged or translated. */
(() => {
  'use strict';
  const stem = file => file.split('/').pop().replace(/\.[^.]+$/, '');
  const titleSlug = title => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const photoFrame = () => document.querySelector('#special-shade:not([hidden]) #special-host iframe[src^="polaroids/"]');
  function applyPhoto(frame) {
    const api = frame.contentWindow?.NanaPolaroidLinks;
    if (!api || !frame.hasAttribute('data-wanted-photo')) return;
    const id = frame.dataset.wantedPhoto;
    delete frame.dataset.wantedPhoto;
    api.show(id || null);
  }
  document.addEventListener('nana-polaroid-change', () => {
    const frame = photoFrame();
    if (frame) applyPhoto(frame);
    window.NanaDeepLinks?.sync();
  });

  function open(route) {
    if (route === 'illustrations' || route === 'objet/photos') {
      openPhotos();
      return true;
    }
    if (route === 'objet/gabzilla' || route === 'projet/gabzilla' || route === 'gabzilla') {
      openGallery('gabzilla', 0);
      return true;
    }
    const photo = /^(?:photos|photos?\/([^/]+))$/.exec(route);
    if (photo) {
      if (!photoFrame()) showPolaroids();
      const frame = photoFrame();
      if (!frame) return false;
      frame.dataset.wantedPhoto = photo[1] || '';
      applyPhoto(frame);
      return true;
    }
    const art = /^(?:illu\/|(?:illu|projet)\/(gabzilla)\/)([^/]+)$/.exec(route);
    if (!art) return false;
    const [, group, id] = art;
    const items = group ? GABZILLA : ART;
    // Keep old numbered bookmarks working; new links always use a stable name.
    const index = /^\d+$/.test(id) ? Number(id) : items.findIndex(item =>
      item.filename === id || stem(item.filename || item.src) === id || titleSlug(item.title) === id);
    if (index < 0 || index >= items.length) return false;
    openGallery(group || 'art', index);
    return true;
  }

  function current() {
    const frame = photoFrame();
    if (frame) {
      const id = frame.dataset.wantedPhoto || frame.contentWindow?.NanaPolaroidLinks?.current();
      return id ? 'photos/' + id : 'photos';
    }
    if (document.getElementById('window-shade').hidden) return null;
    if (currentWindow === 'photos') return 'illustrations';
    if (currentWindow !== 'gallery' || !currentGallery) return null;
    const gabzilla = currentGallery.which === 'gabzilla';
    const item = (gabzilla ? GABZILLA : ART)[currentGallery.index];
    return item ? (gabzilla ? 'illu/gabzilla/' : 'illu/') + stem(item.filename || item.src) : null;
  }
  window.NanaArtLinks = {open, current};
})();
