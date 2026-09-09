/**
 * Minimal global scroll state, written once per frame and consumed inside
 * the Three.js render loop (no React re-renders).
 *
 *  - progress: 0 → 1 as the tracked element scrolls out of the viewport
 *  - velocity: smoothed px/frame delta (decays to 0 after scrolling stops,
 *    so the scene "settles" with inertia instead of snapping)
 */

export const scrollState = {
  progress: 0,
  velocity: 0,
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

let tracking: HTMLElement | null = null;
let lastY = 0;
let raf = 0;

function tick() {
  if (tracking) {
    const rect = tracking.getBoundingClientRect();
    // 0 when the element top is at the viewport top, 1 once it has fully
    // scrolled past (bottom of element reaches top of viewport)
    const total = rect.height || window.innerHeight;
    const p = clamp01(-rect.top / total);
    scrollState.progress = p;

    const y = window.scrollY;
    // exponential smoothing — frame-to-frame delta → a soft velocity value
    const raw = y - lastY;
    lastY = y;
    scrollState.velocity = scrollState.velocity * 0.82 + raw * 0.18;

    // debug/verification handle (harmless in prod)
    (window as unknown as { __rake_scroll?: typeof scrollState }).__rake_scroll = scrollState;
  }
  raf = requestAnimationFrame(tick);
}

/** Begin tracking scroll progress of `el` (typically the hero <section>). */
export function trackScroll(el: HTMLElement): () => void {
  tracking = el;
  lastY = window.scrollY;
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    tracking = null;
    scrollState.progress = 0;
    scrollState.velocity = 0;
    cancelAnimationFrame(raf);
    raf = 0;
  };
}
