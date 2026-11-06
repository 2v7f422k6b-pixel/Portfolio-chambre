/* Search panel for Work desktop. */
(() => {
  function setup() {
    const desktop = document.getElementById("work-desktop");
    const grid = desktop?.querySelector(".folder-grid");
    if (!grid || document.getElementById("work-search")) return;
    const wrapper = document.createElement("div");
    wrapper.id = "work-search";
    const label = document.createElement("label");
    label.htmlFor = "work-search-input";
    label.textContent = "Search my work";
    const input = document.createElement("input");
    input.id = "work-search-input";
    input.type = "search";
    input.placeholder = "Search projects, illustrations, animations…";
    input.autocomplete = "off";
    const results = document.createElement("div");
    results.id = "work-search-results";
    results.hidden = true;
    wrapper.append(label, input, results);
    grid.before(wrapper);
    const search = window.NanaPortfolioSearch;
    input.addEventListener("input", () => {
      const q = search.normalize(input.value.trim());
      results.replaceChildren();
      results.hidden = !q;
      if (!q) return;
      const matches = (window.portfolioCatalog || []).filter((item) =>
        search.matches(item, q),
      );
      if (!matches.length) {
        results.textContent = "No matching projects yet.";
        return;
      }
      for (const item of matches) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "work-search-hit";
        button.textContent =
          item.title +
          " · " +
          item.category +
          (item.tags?.length ? " · #" + item.tags.join(" #") : "");
        button.addEventListener("click", () => search.openItem(item));
        results.append(button);
      }
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", setup);
  else setup();
})();
