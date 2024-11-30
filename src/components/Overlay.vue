<template>
  <div :class="['overlay', overlayPosition]">
    <h1>{{ $t("currentPlayers") }}</h1>
    <h2 :style="{ '--player-color': player.color }">{{ player.name }}</h2>
    <div class="overlay-content">
      <h1>{{ $t("activeRule") }}</h1>
      <h2 class="rule">{{ rule }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PlayerModel } from "../store/interfaces";

// Props definieren
const props = defineProps<{
  player: PlayerModel;
  rule: string;
  playerPosition: number;
  matrix: number[][];
}>();


// Berechnung der Position (links/rechts) des Overlays
const overlayPosition = computed(() => {
  let columnIndex = -1;

  for (let row of props.matrix) {
    const index = row.indexOf(props.playerPosition);
    if (index !== -1) {
      columnIndex = index;
      break;
    }
  }

  if (columnIndex !== -1) {
    const maxCols = props.matrix[0].length;
    return columnIndex >= maxCols / 2 ? "left" : "right";
  }

  return "right";
});
</script>

<style scoped>
h1 {
  font-size: 6vh;
}
h2 {
  font-size: 5vh;
  color: var(--player-color);
  text-shadow: 0.3vh 0.3vh 0.3vh rgba(0, 0, 0, 0.829); /* Schwarzer Rand um den Text */
}
.rule {
  color: red;
}

.overlay {
  padding-top: 10vh;
  text-align: center;
  position: fixed;
  top: 0;
  width: 30vw;
  height: 100vh;
  background-color: rgba(128, 128, 128, 0.486);
  z-index: 1;
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
  justify-content: space-around;
  align-items: center;
  height: 100%;
  overflow-y: auto;
  text-align: center;
}
</style>
