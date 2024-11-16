<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="background">
    <div
      class="gear-icon"
      data-bs-toggle="collapse"
      data-bs-target="#collapseWidthExample"
      aria-expanded="false"
      aria-controls="collapseWidthExample"
    >
      ⚙️
    </div>
    <Sidebar />
    
    <router-view />
  </div>
</template>

<style scoped>
.background {
  /* Hintergrundbild */
  background-image: url("./assets/pictures/background.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* Vollbildgröße */
  width: 100vw;
  height: 100vh;

  /* Positionierung des Inhalts */
  display: flex;
  flex-direction: column; /* Elemente vertikal anordnen */
  align-items: flex-start; /* Inhalt oben beginnen */
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.navigation {
  padding: 10px;
  font-size: 1.2em;
}

.container {
  width: 100%;
}
.gear-icon {
  position: fixed;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1001;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}
</style>
