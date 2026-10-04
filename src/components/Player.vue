<template>
  <div
    class="player"
    :style="{
      filter: getColorFilter(player.color),
      top: `${getPlayerTop(player.position)}%`,
      left: `${getPlayerLeft(player.position)}%`,
    }"
  >
    <img src="@/assets/pictures/player.png" alt="Player Icon" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../store/store";
import { BOARD_ROWS, BOARD_COLS, coordinatesOf } from "../board/boardGeometry";

// Props, um die spezifische Spieler-ID zu erhalten
const props = defineProps<{ playerId: number }>();
const gameStore = useGameStore();

// Zugriff auf den Spieler im Store basierend auf der playerId
const player = computed(() => gameStore.players[props.playerId]);

// Farbfilter für den Spieler, basierend auf der Farbe aus dem Store
const getColorFilter = (color: string) => gameStore.colors.find((c) => c.value === color)?.filter;

// Funktion zur Berechnung der oberen Position (%)
const getPlayerTop = (position: number) => {
  let { row } = coordinatesOf(position);
  row = row + (props.playerId % 3) / 3;
  return (row * 100) / BOARD_ROWS; // Zeilenanteil in Prozent
};

// Funktion zur Berechnung der linken Position (%)
const getPlayerLeft = (position: number) => {
  let { col } = coordinatesOf(position);
  col = col + (props.playerId % 4) / 4;
  return (col * 100) / BOARD_COLS; // Spaltenanteil in Prozent
};
</script>

<style scoped lang="scss">
@use "../styles/tokens" as t;
.player {
  position: absolute; /* Spieler absolut positionieren */
  width: 2vw;
  height: 2vw;
  transition:
    top t.$duration-move,
    left t.$duration-move; /* Weiche Bewegung bei Positionsänderung */
}
.player img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
