<template>
  <div :class="['overlay', overlayPosition]">
    <h1>{{ $t("currentPlayers") }}</h1>
    <h2>{{ playerName }}</h2>
    <div class="overlay-content">
      <h1>{{ $t("activeRule") }}</h1>
      <h2>{{ rule }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Props definieren
const props = defineProps<{
  playerName: string;
  rule: string;
  playerPosition: number;
  matrix: number[][];
}>();

// Berechnung der Position (links/rechts) des Overlays
const overlayPosition = computed(() => {
  let columnIndex = -1;

  // Durchsuche die Matrix nach der Position des Spielers
  for (let row of props.matrix) {
    const index = row.indexOf(props.playerPosition);
    if (index !== -1) {
      columnIndex = index; // Spaltenindex gefunden
      break;
    }
  }

  // Wenn die Position gefunden wurde, bestimmen, ob links oder rechts
  if (columnIndex !== -1) {
    const maxCols = props.matrix[0].length;
    return columnIndex >= maxCols / 2 ? "left" : "right";
  }

  // Standardmäßig rechts, falls Position nicht gefunden wurde
  return "right";
});
</script>

<style scoped>
h1 {
  font-size: 6vh;
}
h2 {
  font-size: 5vh;
}
.overlay {
  padding-top: 10vh;
  text-align: center;
  position: fixed;
  top: 0;
  width: 30vw; /* Breite des Overlays */
  height: 100vh;
  background-color: rgba(128, 128, 128, 0.486); /* Durchsichtiger Hintergrund */
  color: white;
  z-index: 1; /* Sicherstellen, dass es über anderen Elementen liegt */
  pointer-events: none;
}

.overlay.right {
  right: 0;
}

.overlay.left {
  left: 0;
}

.overlay-content {
  margin-top: 20%;
  justify-content: space-around; /* Vertikal zentrieren */
  align-items: center; /* Horizontal zentrieren */
  height: 100%; /* Nimmt die gesamte Höhe des Overlays ein */
  overflow-y: auto;
  text-align: center;
}
</style>
