/**
 * Shared motion primitives. See .design/MOTION.md. Extends Figure1.astro's
 * hand-rolled spring instead of pulling in an animation library — the
 * integrator here is byte-for-byte the same tuning (k=210, zeta=0.9) so
 * every discrete transition on the site descends from the same "physical,
 * settles, no bounce" character, even though only Fig. 1 runs it as a
 * continuous drag system. Everything else here is CSS transitions driven by
 * attribute toggles; this module's only runtime job is flipping those
 * attributes at the right time.
 */

export const SPRING = { k: 210, zeta: 0.9 } as const;

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function"
    ? matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export interface Spring {
  pos: number;
  vel: number;
  target: number;
}

export function makeSpring(v: number): Spring {
  return { pos: v, vel: 0, target: v };
}

const DAMPING = 2 * Math.sqrt(SPRING.k) * SPRING.zeta;

export function stepSpring(s: Spring, dt: number): void {
  const accel = -SPRING.k * (s.pos - s.target) - DAMPING * s.vel;
  s.vel += accel * dt;
  s.pos += s.vel * dt;
}

/* -------------------------------------------------------------------------
 * Hero entrance: flips [data-entrance] -> [data-entrance="run"] once, on
 * load. Reduced motion still flips the attribute (so the JS/no-JS branches
 * stay identical) but the CSS collapses every duration to ~1ms.
 * ---------------------------------------------------------------------- */
export function initEntrance(): void {
  const els = document.querySelectorAll<HTMLElement>("[data-entrance]");
  if (els.length === 0) return;
  const run = () => els.forEach((el) => el.setAttribute("data-entrance", "run"));
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

/* -------------------------------------------------------------------------
 * Scroll-driven reveals: direction-aware, per content type, fires once.
 * CSS keys the motion off [data-revealed]; this only toggles the attribute.
 * ---------------------------------------------------------------------- */
export function initReveals(): void {
  const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (els.length === 0) return;

  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.setAttribute("data-revealed", ""));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  els.forEach((el) => io.observe(el));
}

/* -------------------------------------------------------------------------
 * Count-up on metric figures. Fires once per element, 900ms flat regardless
 * of magnitude, expo-out easing, snaps to the exact integer target on
 * completion (no float jitter in the final frames).
 * ---------------------------------------------------------------------- */
const COUNT_DURATION = 900;
const COUNT_STAGGER = 80;

function easeExpoOut(t: number): number {
  // cubic-bezier(0.16, 1, 0.3, 1) approximated with a closed-form expo-out;
  // visually indistinguishable at this duration and avoids shipping a
  // bezier solver for one micro-interaction.
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function initCountUp(): void {
  const rows = document.querySelectorAll<HTMLElement>(".figures-grid .metrics-row");
  if (rows.length === 0) return;

  const reduced = prefersReducedMotion();

  function animate(el: HTMLElement, target: number, suffix: string, delay: number) {
    if (reduced) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now() + delay;
    function frame(now: number) {
      if (now < start) {
        requestAnimationFrame(frame);
        return;
      }
      const t = Math.min((now - start) / COUNT_DURATION, 1);
      const eased = easeExpoOut(t);
      const value = t >= 1 ? target : Math.round(eased * target);
      el.textContent = `${value}${suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (typeof IntersectionObserver === "undefined") {
    rows.forEach((row, i) => {
      const el = row.querySelector<HTMLElement>("[data-count]");
      if (!el) return;
      const target = Number(el.dataset.count);
      animate(el, target, el.dataset.countSuffix ?? "", i * COUNT_STAGGER);
    });
    return;
  }

  const groups = new Map<Element, HTMLElement[]>();
  rows.forEach((row) => {
    const el = row.querySelector<HTMLElement>("[data-count]");
    if (!el) return;
    const parent = row.closest(".figures-grid");
    if (!parent) return;
    const list = groups.get(parent) ?? [];
    list.push(el);
    groups.set(parent, list);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const els = groups.get(entry.target) ?? [];
        els.forEach((el, i) => {
          const target = Number(el.dataset.count);
          animate(el, target, el.dataset.countSuffix ?? "", i * COUNT_STAGGER);
        });
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );

  groups.forEach((_els, parent) => io.observe(parent));
}

/* -------------------------------------------------------------------------
 * Basis-marker hover: flashes the linked rail note once, decays over 240ms.
 * ---------------------------------------------------------------------- */
export function initBasisFlash(): void {
  const markers = document.querySelectorAll<HTMLAnchorElement>(".basis-marker");
  markers.forEach((marker) => {
    marker.addEventListener("mouseenter", () => {
      const id = marker.getAttribute("href")?.slice(1);
      if (!id) return;
      const note = document.getElementById(id);
      if (!note) return;
      note.classList.remove("basis-note--flash");
      // Force reflow so re-triggering restarts the transition.
      void note.offsetWidth;
      note.classList.add("basis-note--flash");
      window.setTimeout(() => note.classList.remove("basis-note--flash"), 260);
    });
  });
}

export function initMotion(): void {
  initEntrance();
  initReveals();
  initCountUp();
  initBasisFlash();
}
