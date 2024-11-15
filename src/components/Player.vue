<template>
  <div
    class="player"
    :style="{
      filter: getColorFilter(player.color),
      top: playerPosition.top,
      left: playerPosition.left,
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

// Spielerposition in einem 4x3-Raster (max. 12 Spieler)
const playerPosition = computed(() => {
  const row = Math.floor(props.playerId / 4); // Reihe: 0, 1 oder 2
  const col = props.playerId % 4; // Spalte: 0 bis 3

  // Gleichmäßige Verteilung mit 3 Reihen und 4 Spalten
  return {
    top: `${row * 30}%`, // 0%, 30%, 60% für Reihen
    left: `${col * 25}%`, // 0%, 25%, 50%, 75% für Spalten
  };
});

// Farbfilter für den Spieler, basierend auf der Farbe aus dem Store
const getColorFilter = (color: string) =>
  gameStore.colors.find((c) => c.value === color)?.filter;
</script>

<style scoped>
.player {
  position: absolute;
  width: 30px;
  height: 30px;
}
.player img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
