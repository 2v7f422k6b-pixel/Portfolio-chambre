/* Global top-bar search: live Nana Studio catalog and direct navigation. */
(() => {
  function init() {
    const toggle = document.getElementById("menu-search"),
      panel = document.getElementById("global-search-popover"),
      input = document.getElementById("global-search-input"),
      results = document.getElementById("global-search-results");
    if (!toggle || !panel || !input || !results) return;
    const defaults = [
      { title: "Illustration", category: "Illustration", open: "photos" },
      { title: "Animation", category: "Animation", open: "motion" },
      { title: "Music & Visuals", category: "Music", open: "music" },
      { title: "Writing & Editorial", category: "Editorial", open: "pages" },
      { title: "Mini Games", category: "Interactive", open: "mini-games" },
      { title: "La Princesse Clown", category: "Book", open: "book" },
      { title: "Coloring Book", category: "Game", open: "coloring" },
      { title: "Dress-up", category: "Game", open: "dressup" },
      { title: "Latte Lab", category: "Game", open: "latte" },
      { title: "Tamagotchi", category: "Game", open: "tamagotchi" },
      { title: "My Polaroids", category: "Illustrations", open: "polaroids" },
      { title: "About", category: "About", open: "about" },
      { title: "Contact", category: "Contact", open: "contact" },
      { title: "GABZILLA", category: "Illustration", open: "gabzilla" },
    ];
    const search = window.NanaPortfolioSearch;
    function hide() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
    function openItem(item) {
      hide();
      search.openItem(item);
    }
    function render() {
      results.replaceChildren();
      const q = search.normalize(input.value.trim());
      if (!q) return;
      const catalog = [...defaults, ...(window.portfolioCatalog || [])];
      const seen = new Set();
      const matches = catalog.filter((item) => {
        const key = item.project || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return search.matches(item, q);
      });
      if (!matches.length) {
        results.textContent = "Aucun résultat.";
        return;
      }
      for (const item of matches) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent =
          item.title + (item.category ? " · " + item.category : "");
        button.addEventListener("click", () => openItem(item));
        results.append(button);
      }
    }
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) {
        input.focus();
        render();
      }
    });
    input.addEventListener("input", render);
    document.addEventListener("portfolio-tags-updated", render);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });
    document.addEventListener("click", (e) => {
      if (
        !panel.hidden &&
        !panel.contains(e.target) &&
        !toggle.contains(e.target)
      )
        hide();
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
