// static/js/timeline.js
(function () {
  if (typeof window === "undefined") return;

  const root = document.querySelector(".journey-root");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".journey-item"));
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.12,
  };

  const onIntersect = (entries, obs) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add("visible");
        // reveal the inner card with slight stagger
        const card = el.querySelector(".journey-card");
        if (card && !card.classList.contains("visible")) {
          setTimeout(
            () => card.classList.add("visible"),
            (Array.from(items).indexOf(el) % 6) * 120
          );
        }
      } else {
        // keep them visible once shown — comment out next line to make repeat animations
        // el.classList.remove('visible');
      }
    });
  };

  const obs = new IntersectionObserver(onIntersect, observerOptions);
  items.forEach((i) => obs.observe(i));

  // keyboard: pressing enter or space on item toggles focus animation (useful for screen readers)
  items.forEach((it) => {
    it.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const card = it.querySelector(".journey-card");
        if (card) {
          card.classList.add("visible");
          it.classList.add("visible");
          setTimeout(
            () => it.scrollIntoView({ behavior: "smooth", block: "center" }),
            120
          );
        }
      }
    });

    // make click also emphasize
    it.addEventListener("click", () => {
      it.querySelector(".journey-card")?.classList.add("visible");
      it.classList.add("visible");
    });
  });

  // Prefers-reduced-motion: reduce animations for accessibility
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.matches) {
    document
      .querySelectorAll(".journey-card")
      .forEach((c) => (c.style.transition = "none"));
    document.querySelectorAll(".journey-item::after").forEach(() => {
      /* noop safe */
    });
  }
})();
