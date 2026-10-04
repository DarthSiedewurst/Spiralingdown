<template>
  <div class="background">
    <div id="dice-box"></div>

    <div
      class="gear-icon"
      data-bs-toggle="offcanvas"
      data-bs-target="#offcanvasRight"
      aria-controls="offcanvasRight"
    >
      ⚙️
    </div>
    <Sidebar />
    <router-view />

    <!-- Dreh-Overlay: taucht auf jeder Seite (auch Home) auf, solange das Gerät
          hoch (portrait) hängt. Zentriert, deckt alles ab und fordert Drehen. -->
    <div v-if="!isLandscape" class="rotate-lock" role="alert">
      <div class="rotate-lock-icon">📱↻</div>
      <h2>{{ $t("rotateHint") }}</h2>
      <p>{{ $t("rotateHintDesc") }}</p>
      <template v-if="fullscreen.supported">
        <button type="button" class="btn btn-light fw-bold" @click="fullscreen.toggle">
          {{ $t("goLandscape") }}
        </button>
      </template>
    </div>

    <!-- Vollbild-Overlay: nur wenn Vollbild grundsätzlich geht (kein iOS) und
          noch nicht aktiv. Zentriert, deckt alles ab, fordert einen Tap. -->
    <div v-else-if="fullscreen.supported && !fullscreen.isFullscreen" class="fs-lock" role="alert">
      <div class="fs-lock-icon">⛶</div>
      <h2>{{ $t("fsHint") }}</h2>
      <p>{{ $t("fsHintDesc") }}</p>
      <button type="button" class="btn btn-light fw-bold" @click="fullscreen.toggle">
        {{ $t("goFullscreen") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "../components/Sidebar.vue";
import { useOrientation } from "../composables/useOrientation";
import { useFullscreen } from "../composables/useFullscreen";

const { isLandscape } = useOrientation();
const fullscreen = useFullscreen();
</script>

<style scoped>
/* Three.js Dice-Canvas aus @3d-dice/dice-box: positioniert über das Board. */
:deep(.dice-box-canvas) {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Dreh-/Vollbild-Erzwinger: deckt im Hochformat jeder Seite alles ab.
   Gemeinsame Basics; die .rotate-lock/.fs-lock-Subklassen sind visuell identisch.
   z-Index über Sidebar (1050), Confetti (2000) und allem anderen.
   Flexbox-Centering = Inhalte immer mittig (vertikal + horizontal). */
.rotate-lock,
.fs-lock {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-align: center;
  padding: 1rem;
  background: rgba(10, 16, 22, 0.92);
  color: #fff;
  backdrop-filter: blur(2px);
  transform: scale(1);
  animation: rotate-in 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
.rotate-lock-icon,
.fs-lock-icon {
  font-size: clamp(3rem, 16vh, 8rem);
  line-height: 1;
}
.rotate-lock h2,
.fs-lock h2 {
  font-size: clamp(1.5rem, 6vh, 2.8rem);
  margin: 0;
}
.rotate-lock p,
.fs-lock p {
  max-width: 34ch;
  opacity: 0.85;
  margin: 0 0 1rem;
}
.rotate-lock .btn,
.fs-lock .btn {
  padding: 0.7rem 1.6rem;
  font-size: clamp(1rem, 3.6vh, 1.4rem);
}
@keyframes rotate-in {
  from {
    transform: scale(0.94);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
