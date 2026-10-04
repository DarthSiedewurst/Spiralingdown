<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import Sidebar from "./components/Sidebar.vue";

const router = useRouter();

// Bei einem echten Reload (F5) oder direktem Öffnen einer Unter-URL
// immer auf die Home-Seite zurückführen. App mountet dabei nur einmal,
// daher greift das nicht auf In-App-Navigation zu /game.
onMounted(() => {
  if (router.currentRoute.value.name !== "Home") {
    router.replace({ name: "Home" });
  }
});
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
  width: 100vw;
  height: 100vh;
  z-index: 2;
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
