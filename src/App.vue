<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
</script>

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

<style scoped>
:deep(.dice-box-canvas) {
  position: absolute;
  width: 90vw;
  height: 90vh;
  z-index: 1;
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
