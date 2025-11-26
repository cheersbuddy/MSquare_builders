// static/js/stats-counter.js
(function () {
  "use strict";

  // formatting helper: thousand separators (en-IN style optional)
  const formatNumber = (num) => {
    // keep integers simple
    if (Number.isInteger(num)) {
      return num.toLocaleString(); // uses user's locale
    }
    // for decimals, keep 1-2 decimal places intelligently
    return (+num).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // parse content like "500+", "1,200+", "100%" or "≈123.4k"
  const parseDisplayed = (str) => {
    if (!str) return { value: 0, prefix: "", suffix: "" };
    // trim and capture prefix/digits/suffix
    const trimmed = String(str).trim();
    // find first number block
    const m = trimmed.match(/([-+]?[0-9.,]*\d(?:\.\d+)?)/);
    if (!m) return { value: 0, prefix: trimmed, suffix: "" };

    const numStr = m[0];
    const before = trimmed.slice(0, m.index);
    const after = trimmed.slice(m.index + numStr.length);

    // normalize number: remove commas
    const normalized = numStr.replace(/,/g, "");
    const value = Number(normalized) || 0;

    return { value, prefix: before, suffix: after };
  };

  // animate single element
  const animateStat = (el, target, duration = 1200, suffix = "") => {
    if (!el) return;
    // safety: if user prefers reduced motion, set immediately
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      el.textContent = formatNumber(target) + (suffix || "");
      return;
    }

    const start = performance.now();
    const initial = 0;
    const change = target - initial;

    // choose easing (cubic out)
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // if duration is 0 or negative, set instantly
    if (!duration || duration <= 0) {
      el.textContent = formatNumber(target) + (suffix || "");
      return;
    }

    const loop = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = initial + change * eased;

      // round if target is integer-ish
      const displayValue = Number.isInteger(target)
        ? Math.round(current)
        : Math.round(current * 100) / 100;
      el.textContent = formatNumber(displayValue) + (suffix || "");

      if (progress < 1) {
        requestAnimationFrame(loop);
      } else {
        // ensure exact final
        el.textContent = formatNumber(target) + (suffix || "");
        el.dataset.animated = "1";
      }
    };

    requestAnimationFrame(loop);
  };

  // initialize counters inside given root
  const initCounters = (root = document) => {
    const counters = Array.from(root.querySelectorAll(".stat-value"));

    if (!counters.length) return;

    // IntersectionObserver to trigger when visible
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const trigger = (el) => {
      // skip if already animated
      if (el.dataset.animated === "1") return;

      const raw = el.getAttribute("data-target") || "";
      const durationAttr = parseInt(
        el.getAttribute("data-duration") || "1200",
        10
      );
      const suffix = el.getAttribute("data-suffix") || "";
      const prefix = el.getAttribute("data-prefix") || "";

      // parse numeric value from data-target; fallback to parsing text content
      let numeric = Number(String(raw).replace(/,/g, ""));
      if (isNaN(numeric)) {
        numeric = parseDisplayed(el.textContent).value || 0;
      }

      // ensure non-negative
      if (numeric < 0) numeric = 0;

      // set prefix visually if any
      if (prefix) {
        // prefix handled by rewriting element content inside animate
      }

      animateStat(el, numeric, durationAttr, suffix);
    };

    if (reduce) {
      // reveal all immediately (respect reduced motion)
      counters.forEach((el) => {
        const raw =
          el.getAttribute("data-target") ||
          parseDisplayed(el.textContent).value ||
          0;
        const suffix = el.getAttribute("data-suffix") || "";
        el.textContent = formatNumber(Number(raw)) + (suffix || "");
        el.dataset.animated = "1";
      });
      return;
    }

    // observer options
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trigger(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.3 }
    );

    counters.forEach((el) => {
      // if already visible in viewport, animate immediately
      if (
        el.getBoundingClientRect().top < window.innerHeight &&
        el.getBoundingClientRect().bottom > 0
      ) {
        trigger(el);
      } else {
        io.observe(el);
      }
    });
  };

  // auto-init on DOMContentLoaded (idempotent)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCounters());
  } else {
    initCounters();
  }

  // also re-init on PJAX/partial nav events if your site uses them:
  // window.addEventListener('content:loaded', () => initCounters());
})();
