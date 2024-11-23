<template>
  <div class="overlay">
    <div class="overlay-content">
      <h3>Aktueller Spieler</h3>
      <p>{{ playerName }}</p>

      <h4>Beschreibung</h4>
      <p>{{ description }}</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  playerName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});
</script>


<style scoped>
.overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 30vw; /* Breite des Kastens */
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Durchsichtiger Hintergrund */
  color: white;
  padding: 20px;
  z-index: 1; /* Sicherstellen, dass es über anderen Elementen liegt */
  pointer-events: none;
}

.overlay-content {
  overflow-y: auto;
  height: 100%;
}
</style>
