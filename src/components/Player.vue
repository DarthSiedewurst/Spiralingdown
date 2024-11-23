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

// Props, um die spezifische Spieler-ID zu erhalten
const props = defineProps<{ playerId: number }>();
const gameStore = useGameStore();

// Zugriff auf den Spieler im Store basierend auf der playerId
const player = computed(() => gameStore.players[props.playerId]);

// Farbfilter für den Spieler, basierend auf der Farbe aus dem Store
const getColorFilter = (color: string) =>
  gameStore.colors.find((c) => c.value === color)?.filter;

// Spielfeld-Matrix
const matrix = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [29, 30, 31, 32, 33, 34, 35, 36, 9],
  [28, 51, 52, 53, 54, 55, 56, 37, 10],
  [27, 50, 65, 66, 67, 68, 57, 38, 11],
  [26, 49, 64, 71, 70, 69, 58, 39, 12],
  [25, 48, 63, 62, 61, 60, 59, 40, 13],
  [24, 47, 46, 45, 44, 43, 42, 41, 14],
  [23, 22, 21, 20, 19, 18, 17, 16, 15],
];

// Spielfeld-Dimensionen (in Prozent)
const totalRows = matrix.length;
const totalCols = matrix[0].length;

// Funktion zur Berechnung der Zeilen- und Spaltenkoordinaten
const getCoordinates = (position: number) => {
  for (let row = 0; row < totalRows; row++) {
    const col = matrix[row].indexOf(position);
    if (col !== -1) {
      return { row, col };
    }
  }
  return { row: 0, col: 0 }; // Fallback, falls die Position nicht gefunden wird
};

// Funktion zur Berechnung der oberen Position (%)
const getPlayerTop = (position: number) => {
  let { row } = getCoordinates(position);
  row = row + (props.playerId % 3) / 3;
  return (row * 100) / totalRows; // Zeilenanteil in Prozent
};

// Funktion zur Berechnung der linken Position (%)
const getPlayerLeft = (position: number) => {
  let { col } = getCoordinates(position);
  col = col + (props.playerId % 4) / 4;
  return (col * 100) / totalCols; // Spaltenanteil in Prozent
};
</script>

<style scoped>
.player {
  position: absolute; /* Spieler absolut positionieren */
  width: 2vw;
  height: 2vw;
  transition:
    top 0.5s linear,
    left 0.5s linear; /* Weiche Bewegung bei Positionsänderung */
}
.player img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
