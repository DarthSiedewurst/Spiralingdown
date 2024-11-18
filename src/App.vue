<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="background">
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

</style>
