/* static/js/glide-testimonials.js
   Robust glide init for testimonial cards:
   - perView kept consistent
   - bounded to prevent overflow blanking
   - small peek for breathing but not scaling
   - forced recalculation on resize/slide to avoid layout jump
*/
(function () {
  "use strict";
  function log(...args) {
    if (window.DEBUG_TESTIMONIALS) console.info(...args);
  }

  function mountGlides() {
    if (typeof Glide === "undefined") {
      console.error("[testimonials] Glide missing — load glide.min.js first");
      return;
    }

    document.querySelectorAll(".glide.testimonials-glide").forEach((root) => {
      if (root.dataset.glideMounted) return;
      root.dataset.glideMounted = "1";

      const slides = root.querySelector(".glide__slides");
      if (!slides) {
        console.warn("[testimonials] Missing .glide__slides for", root);
        return;
      }

      // Defensive style guard: ensure slides behave as a single non-wrapping row
      slides.style.display = "flex";
      slides.style.flexWrap = "nowrap";
      slides.style.gap = "24px";

      try {
        const glide = new Glide(root, {
          type: "carousel",
          perView: 3,
          gap: 24,
          autoplay: 4200,
          hoverpause: true,
          animationDuration: 520,
          bound: true, // prevents glide overshoot and huge "center" gaps
          focusAt: 0, // avoid centering which can scale/peek awkwardly
          peek: { before: 8, after: 8 }, // small breathing room
          breakpoints: {
            1280: { perView: 3, gap: 20, peek: { before: 8, after: 8 } },
            1024: { perView: 2, gap: 20, peek: { before: 6, after: 6 } },
            640: { perView: 1, gap: 12, peek: { before: 16, after: 16 } },
          },
        });

        // Recalculate on mount (fix cases where CSS loads late)
        glide.on("mount.after", () => {
          // make sure slides widths are recalculated
          setTimeout(() => glide.update(), 80);
          log("[testimonials] Glide mounted", root);
        });

        // Defensive update: when slide changes or window resizes, update layout
        glide.on("run.after", () => setTimeout(() => glide.update(), 80));
        window.addEventListener(
          "resize",
          debounce(() => glide.update(), 120)
        );

        glide.mount();

        // attach prev/next if present (explicit wiring)
        const prev = root.querySelector(".testimonial-prev");
        const next = root.querySelector(".testimonial-next");
        if (prev) prev.addEventListener("click", () => glide.go("<"));
        if (next) next.addEventListener("click", () => glide.go(">"));
      } catch (err) {
        console.error("[testimonials] Glide init error:", err);
      }
    });
  }

  // small debounce utility
  function debounce(fn, t) {
    let id = null;
    return function () {
      clearTimeout(id);
      id = setTimeout(() => fn.apply(this, arguments), t);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountGlides);
  } else {
    mountGlides();
  }
})();
