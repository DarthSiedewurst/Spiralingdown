<template>
  <table @click="rollDice" class="game-board">
    <tbody>
      <tr v-for="(row, rowIndex) in matrix" :key="'row-' + rowIndex">
        <td
          v-for="fieldId in row"
          :key="'col-' + fieldId"
          class="field"
          :class="{
            active: currentPosition === fieldId,
            'border-left': borderLeft.includes(fieldId),
            'border-right': borderRight.includes(fieldId),
            'border-bottom': borderBottom.includes(fieldId),
          }"
        >
          <div class="field-number">{{ fieldId }}</div>
          <div class="field-name">{{ getFieldData(fieldId).name }}</div>
          <!-- Platzieren der Spieler auf dem aktuellen Feld -->
          <Player
            v-for="(player, index) in playersOnField(fieldId)"
            :key="player.name + index"
            :playerId="index"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from "vue";
import { useGameStore } from "../store/store";
// @ts-ignore
import DiceBox from "@3d-dice/dice-box";
import Player from "@/components/Player.vue";

onMounted(() => {
  diceBox.init();
});
onUnmounted(() => {
  diceBox.clear();
});

const diceBox = new DiceBox({
  container: "#dice-box",
  assetPath: "/dice-box/", // include the trailing backslash
  scale: 6,
  themeColor: "#0f4c81",
});

async function rollDice() {
  const test = await diceBox.roll("1d6");
  console.log(test[0].value);
}
const store = useGameStore();

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
const borderLeft = [47, 48, 49, 50, 51, 63, 64, 65, 71];
const borderRight = [36, 37, 38, 39, 40, 41, 56, 57, 58, 59, 68, 69];
const borderBottom = [
  0, 1, 2, 3, 4, 5, 6, 7, 41, 42, 43, 44, 45, 46, 47, 30, 31, 32, 33, 34, 35,
  59, 60, 61, 62, 63, 52, 53, 54, 55, 69, 70, 71, 66, 67,
];

// Zugriff auf die aktuellen Regeln
const gameData = computed(() => store.currentRuleset);

const currentPosition = ref(0);
const playersOnField = (fieldId: number) =>
  store.players.filter((player) => player.position === fieldId);

const getFieldData = computed(() => (fieldId: number) => {
  return gameData.value?.[`fieldId${fieldId}`] || { name: "", description: "" };
});
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}

.game-board {
  width: 100vw;
  height: 100vh;
  border-collapse: collapse;
}

.field {
  border: 1px solid #ccc;
  text-align: left;
  font-size: 2vh;
  height: 12.5%;
  width: 11%;
  position: relative;
  background-image: url("@/assets/pictures/tilebackground.jpg");
  background-size: 100% 120%;
  background-position: center;
}

.field-number {
  position: absolute;
  top: 5px;
  left: 5px;
  font-weight: bold;
}

.field.active {
  background-color: rgba(240, 248, 255, 0.5);
}
.border-left {
  border-left: 3px solid #333 !important;
}
.border-right {
  border-right: 3px solid #333 !important;
}
.border-bottom {
  border-bottom: 3px solid #333 !important;
}

</style>
