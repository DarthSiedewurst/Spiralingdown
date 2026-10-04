import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Reactive Erzeugung, ob das Viewport quer (landscape) steht.
 * Desktop-Fenster: quer = true, hoch = false. Handy: hoch = false.
 * Das Spiel ist quer optimiert (Brett ist breiter als hoch), daher
 * blockiert die App die Nutzung, solange `isLandscape` false ist.
 */
export function useOrientation() {
  const isLandscape = ref(
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(orientation: landscape)").matches
      : true,
  );

  let mq: MediaQueryList | null = null;
  let resizeHandler: (() => void) | null = null;

  const syncFromMq = () => {
    if (mq) isLandscape.value = mq.matches;
  };

  onMounted(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    mq = window.matchMedia("(orientation: landscape)");
    syncFromMq();
    mq.addEventListener?.("change", syncFromMq);
    // Fallback: manuelle Fenster-/Screen-Anpassung (z. B. DevTools, Rotation ohne MQ-change).
    resizeHandler = () => {
      isLandscape.value = window.innerWidth > window.innerHeight;
    };
    window.addEventListener("resize", resizeHandler);
  });

  onBeforeUnmount(() => {
    mq?.removeEventListener?.("change", syncFromMq);
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  });

  return { isLandscape };
}
