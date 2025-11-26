// static/js/projects-filter.js
(function () {
  const q = (sel, root = document) => root.querySelector(sel);
  const qs = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const initFilters = () => {
    const container = q("#projects-grid");
    if (!container) return;

    const buttons = qs(".filter-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        applyFilter(container, cat);
      });
    });
  };

  const applyFilter = (container, cat) => {
    const items = qs(".project-list-item", container);
    items.forEach((it) => {
      const itemCat = it.dataset.category || "";
      if (cat === "All" || itemCat === cat) {
        it.style.display = "";
        it.classList.remove("filtered-out");
        requestAnimationFrame(() => it.classList.add("reveal"));
      } else {
        it.style.display = "none";
        it.classList.add("filtered-out");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initFilters();
  });
})();
