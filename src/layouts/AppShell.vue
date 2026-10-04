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
  </div>
</template>

<script setup lang="ts">
import Sidebar from "../components/Sidebar.vue";
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
</style>
