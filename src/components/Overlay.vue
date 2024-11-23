<template>
  <div :class="['overlay', overlayPosition]">
    <div class="overlay-content">
      <h3>{{ $t("currentPlayers") }}</h3>
      <p>{{ playerName }}</p>

      <h4>{{ $t("activeRule") }}</h4>
      <p>{{ rule }}</p>
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
.overlay {
  position: fixed;
  top: 0;
  width: 30vw; /* Breite des Overlays */
  height: 100vh;
  background-color: rgba(128, 128, 128, 0.486); /* Durchsichtiger Hintergrund */
  color: white;
  padding: 20px;
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
  overflow-y: auto;
  height: 100%;
}
</style>
