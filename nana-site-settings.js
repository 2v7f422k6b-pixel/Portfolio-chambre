/* Published placement settings. Updated only by an authorized GitHub commit.
   These values are public display data, never passwords or access tokens. */
window.NANA_PUBLISHED_SETTINGS = {};
(() => {
  'use strict';
  const data = window.NANA_PUBLISHED_SETTINGS;
  let isEditing = false;
  try { isEditing = sessionStorage.getItem('nana-admin-session-v1') === '1'; } catch (_) {}
  if (isEditing) return;
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith('nana-')) continue;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
})();
