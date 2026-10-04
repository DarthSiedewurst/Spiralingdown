<template>
  <div
    class="player"
    :class="{ active: player?.effect }"
    :style="{
      filter: getColorFilter(player.color),
      top: `${getPlayerTop(player.position)}%`,
      left: `${getPlayerLeft(player.position)}%`,
    }"
    @click="$emit('inspect')"
  >
    <img src="@/assets/pictures/player.png" alt="Player Icon" />
    <span v-if="player?.effect" class="effect-badge" aria-hidden="true">
      <i class="bi bi-lightning-charge-fill"></i>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../store/store";
import { BOARD_ROWS, BOARD_COLS, coordinatesOf } from "../board/boardGeometry";

// Props, um die spezifische Spieler-ID zu erhalten
const props = defineProps<{ playerId: number }>();
defineEmits<{ (e: "inspect"): void }>();
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

/* Aktiver Effekt: leuchtender Ring um die Figur. */
.player.active {
  img {
    animation: effect-glow 1.6s ease-in-out infinite;
    filter: drop-shadow(0 0 1.2vh rgba(255, 204, 0, 0.95))
      drop-shadow(0 0 2.2vh rgba(255, 150, 0, 0.6));
  }
}
@keyframes effect-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 1vh rgba(255, 204, 0, 0.9))
      drop-shadow(0 0 1.6vh rgba(255, 150, 0, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 1.8vh rgba(255, 204, 0, 1)) drop-shadow(0 0 3vh rgba(255, 150, 0, 0.8));
  }
}

/* Kleiner Blitz-Symbol über der Figur. */
.effect-badge {
  position: absolute;
  top: -60%;
  left: 50%;
  padding: 0 0.1vh;
  font-size: 1.4vh;
  color: #ff9d00;
  text-shadow:
    0 0 2px #fff,
    0 0 4px #fff;
  animation: badge-pop 1.1s ease-in-out infinite;
}
@keyframes badge-pop {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.25);
  }
}
</style>
