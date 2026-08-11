/**
 * Shared motion primitives for the Swiss Technical direction. Fig. 1's spring
 * lives in its own component script (Figure1.astro) — this module covers
 * everything else: the kicker draw-in, the [data-fade] reveal system, and
 * the hero panel's live-figures count-up. All CSS transitions declared in
 * global.css; this file only toggles classes/attributes and drives the
 * count-up numerals.
 */

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function"
    ? matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/* -------------------------------------------------------------------------
 * Kicker rules + index draw in once, on scroll into view.
 * ---------------------------------------------------------------------- */
export function initKickers(): void {
  const kickers = document.querySelectorAll<HTMLElement>(".kicker");
  if (kickers.length === 0) return;

  const reveal = (el: HTMLElement) => {
    el.querySelector(".rule")?.classList.add("in");
    el.querySelector(".idx")?.classList.add("in");
  };

  if ("IntersectionObserver" in window && !prefersReducedMotion()) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.4 },
    );
    kickers.forEach((el) => io.observe(el));
  } else {
    kickers.forEach(reveal);
  }
}

/* -------------------------------------------------------------------------
 * [data-fade] reveal system. Visible by default; `.js-anim` (set in <head>)
 * opts elements into the pre-reveal state, and this only decides WHEN `.in`
 * is added back. Missing IntersectionObserver or reduced motion: everything
 * is marked `.in` immediately.
 * ---------------------------------------------------------------------- */
export function initFade(): void {
  const els = document.querySelectorAll<HTMLElement>("[data-fade]");
  if (els.length === 0) return;

  if ("IntersectionObserver" in window && !prefersReducedMotion()) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("in"));
  }
}

/* -------------------------------------------------------------------------
 * Hero entrance flag: `.js-anim` gates hero CSS keyframes on `<html>` by
 * default already (animation:...both), so no class flip is needed there.
 * This function only exists for parity with the reduced-motion contract —
 * kept as a no-op hook in case future hero pieces need JS-timed staging.
 * ---------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
 * Hero panel "Live figures" count-up. Markup already holds the correct
 * final value; never zeroed up front (a stalled rAF must never leave a
 * wrong number on screen — countUp zeroes it on its own first frame).
 * ---------------------------------------------------------------------- */
function countUp(el: HTMLElement, to: number, suffix: string, duration: number): void {
  if (prefersReducedMotion()) return;
  let start: number | null = null;
  function step(ts: number) {
    if (start === null) start = ts;
    const p = Math.min(1, (ts - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const n = Math.round(0 + to * eased);
    el.textContent = `${n}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = `${to}${suffix}`; // exact final value, always
  }
  requestAnimationFrame(step);
}

export function initHeroFigures(): void {
  if (prefersReducedMotion()) return;
  const rows = document.querySelectorAll<HTMLElement>(".hero-panel [data-final]");
  rows.forEach((el) => {
    const num = el.dataset.num;
    if (num === undefined) return; // range/currency values (e.g. cost/query) stay as printed
    const to = Number(num);
    const suffix = el.dataset.suffix ?? "";
    window.setTimeout(() => countUp(el, to, suffix, 700), 520);
  });
}

export function initMotion(): void {
  initKickers();
  initFade();
  initHeroFigures();
}
