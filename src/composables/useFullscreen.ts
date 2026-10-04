import { ref } from "vue";

interface UseFullscreenReturn {
  isFullscreen: ReturnType<typeof ref<boolean>>;
  supported: boolean;
  toggle: () => void;
}

/**
 * Vollbild-Zustand (Fullscreen API) reaktiv verfolgen.
 * `supported` = false z. B. auf iOS-Safari (nur <video> kann dort vollbild-
 * go); dort darf das UI nicht blockieren, sondern nur hintgeben.
 */
export function useFullscreen(): UseFullscreenReturn {
  const isFullscreen = ref(typeof document !== "undefined" && !!document.fullscreenElement);
  const supported =
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function";

  function toggle() {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }

  if (supported) {
    document.addEventListener("fullscreenchange", () => {
      isFullscreen.value = !!document.fullscreenElement;
    });
  }

  return { isFullscreen, supported, toggle };
}
