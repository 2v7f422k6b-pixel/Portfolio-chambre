/* Cat petting: a silent, gentle visual reaction; no changes to room artwork. */
(() => {
  const cat = document.querySelector('#hotspots [data-cat-pet]');
  const response = document.getElementById('cat-response');
  if (!cat || !response) return;

  let hideTimer;
  function petCat() {
    clearTimeout(hideTimer);
    response.classList.remove('is-purring');
    // Restart the tiny CSS animation on every tap, including quick repeat taps.
    void response.getBoundingClientRect().width;
    response.classList.add('is-purring');
    hideTimer = setTimeout(() => response.classList.remove('is-purring'), 2200);
  }
  cat.addEventListener('click', petCat);
  window.addEventListener('pagehide', () => clearTimeout(hideTimer));
})();
