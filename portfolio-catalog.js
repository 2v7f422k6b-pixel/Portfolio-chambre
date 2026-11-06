/* Portfolio catalog: categories and private project tags. */
window.portfolioCatalog = [
  {
    title: "La Princesse Clown",
    category: "Editorial",
    project: "clown-princess",
    tags: ["book", "illustration"],
    open: "book",
  },
  {
    title: "Illustration",
    category: "Illustration",
    project: "illustration",
    tags: ["drawing", "art"],
    open: "photos",
  },
  {
    title: "Animation",
    category: "Animation",
    project: "animation",
    tags: ["video", "motion"],
    open: "motion",
  },
  {
    title: "Music & Visuals",
    category: "Music",
    project: "music-visuals",
    tags: ["music", "visual"],
    open: "music",
  },
  {
    title: "Writing & Editorial",
    category: "Editorial",
    project: "editorial",
    tags: ["writing", "articles"],
    open: "pages",
  },
  {
    title: "Mini Games",
    category: "Interactive",
    project: "mini-games",
    tags: ["games"],
    open: "mini-games",
  },
];
window.portfolioRelated = (project) =>
  window.portfolioCatalog.filter((item) => item.project === project);
window.portfolioRegisterArtwork = (item) => {
  if (!item || !item.title || !item.category || !item.project) return false;
  window.portfolioCatalog.push({
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : [],
  });
  return true;
};

/* Both search fields use the same matching and destination rules. */
window.NanaPortfolioSearch = {
  normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  },
  matches(item, query) {
    return this.normalize(
      [item.title, item.category, item.project, ...(item.tags || [])].join(" "),
    ).includes(query);
  },
  openItem(item) {
    if (
      item.category === "Animation" &&
      item.video &&
      typeof window.openMotionAt === "function"
    ) {
      window.openMotionAt(item.project);
      return;
    }
    if (/\.(?:jpe?g|png|webp)$/i.test(item.project || "")) {
      const index = window.portfolioArtworkIndex?.(item.project);
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        typeof window.openApp === "function"
      ) {
        window.openApp("artwork", index);
        return;
      }
    }
    const name = item.open || "finder";
    if (typeof window.openApp === "function") {
      window.openApp(name);
      return;
    }
    [...document.querySelectorAll("[data-open]")]
      .find((node) => node.dataset.open === name)
      ?.click();
  },
};

/* Tags edited in Nana Studio are loaded at runtime and merged into search. */
(async () => {
  try {
    const response = await fetch("content/media-tags.json", {
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.items)) return;
    const openById = {
      "clown-princess": "book",
      gabzilla: "gabzilla",
      animation: "motion",
      "music-visuals": "music",
      editorial: "pages",
      "mini-games": "mini-games",
    };
    for (const item of data.items) {
      if (!item || !item.id) continue;
      const tags = Array.isArray(item.tags)
        ? item.tags
            .filter((tag) => typeof tag === "string" && tag.trim())
            .map((tag) => tag.trim())
        : [];
      const existing = window.portfolioCatalog.find(
        (entry) => entry.project === item.id || entry.title === item.title,
      );
      if (existing) {
        existing.tags = [...new Set([...(existing.tags || []), ...tags])];
      } else if (item.category === "Animation" && item.video) {
        window.portfolioCatalog.push({
          title: item.title || item.id,
          category: "Animation",
          project: item.id,
          tags,
          open: "motion",
          video: item.video,
        });
      } else if (item.category === "Music & Visuals" && item.artist) {
        window.portfolioCatalog.push({
          title: item.title || item.id,
          category: "Music & Visuals",
          project: item.id,
          tags,
          open: "music",
          artist: item.artist,
        });
      } else if (window.portfolioArtworkByFile?.(item.id)) {
        window.portfolioCatalog.push({
          title: item.title || window.portfolioArtworkByFile(item.id).title,
          category: item.category || "Illustration",
          project: item.id,
          tags,
          open: "photos",
        });
      } else {
        window.portfolioCatalog.push({
          title: item.title || item.id,
          category: item.category || "Other",
          project: item.id,
          tags,
          open: openById[item.id] || "finder",
        });
      }
    }
    document.dispatchEvent(new Event("portfolio-tags-updated"));
  } catch (error) {
    console.warn("Media tags unavailable", error);
  }
})();
