<template>
  <Overlay
    :playerName="currentPlayer.name"
    :rule="modalRule"
    :playerPosition="currentPlayer.position"
    :matrix="matrix"
  />
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
        </td>
      </tr>
    </tbody>
    <Player
      v-for="(player, index) in store.players"
      :key="player.name + index"
      :playerId="index"
    />
  </table>
  <div
    class="modal fade"
    id="staticBackdrop"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">{{ modalTitle }}</h5>
        </div>
        <div class="modal-body">{{ modalDescription }}</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from "vue";
import { useGameStore } from "../store/store";
// @ts-ignore
import DiceBox from "@3d-dice/dice-box";
import Player from "@/components/Player.vue";
import Overlay from "../components/Overlay.vue";
import { PlayerModel } from "../store/interfaces";
// @ts-ignore
import { Modal } from "bootstrap";

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
const currentPlayerIndex = ref(0); // Index des aktuellen Spielers
const modalTitle = ref(""); // Modal-Titel
const modalDescription = ref(""); // Modal-Beschreibung
const modalRule = ref(""); // Modal-Rule
const isRolling = ref(false); // Statusvariable, ob gerade gewürfelt wird

const currentPlayer = computed(() => store.players[currentPlayerIndex.value]);

const getFieldData = computed(() => (fieldId: number) => {
  return gameData.value?.[`fieldId${fieldId}`] || { name: "", description: "" };
});

async function rollDice() {
  if (isRolling.value) return;
  isRolling.value = true; // Würfeln wird gestartet

  const currentPlayer = store.players[currentPlayerIndex.value];
  const diceResult = await diceBox.roll("1d6");
  const steps = diceResult[0].value; // Würfelergebnis

  await movePlayerSpiral(currentPlayer, steps);

  // Setze Titel und Beschreibung für das Modal
  const fieldData = getFieldData.value(currentPlayer.position);
  modalTitle.value = `Spielfeld ${currentPlayer.position}`;
  modalDescription.value = fieldData.description || "Keine Beschreibung";
  modalRule.value = fieldData.rule || "";

  const modalElement = document.getElementById("staticBackdrop");
  const modal = new Modal(modalElement!);

  // Aktualisiere den Spieler-Index, wenn das Modal geschlossen wird
  const onModalHide = () => {
    currentPlayerIndex.value =
      (currentPlayerIndex.value + 1) % store.players.length;
    isRolling.value = false; // Würfeln wieder erlauben

    // Entferne den Event-Listener, um Speicherlecks zu vermeiden
    modalElement?.removeEventListener("hide.bs.modal", onModalHide);
  };

  modalElement?.addEventListener("hide.bs.modal", onModalHide);

  // Zeige das Modal
  modal.show();
}

// Spiralförmige Bewegung mit Promise
function movePlayerSpiral(player: PlayerModel, steps: number): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = player.position;
    const endPosition = startPosition + steps;
    let currentStep = startPosition;

    const moveStep = () => {
      if (currentStep < endPosition) {
        currentStep++;
        player.position = currentStep;
        setTimeout(moveStep, 500); // 500ms pro Schritt
      } else {
        resolve(); // Bewegung abgeschlossen
      }
    };

    moveStep();
  });
}
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
  color: #333333;
  text-align: left;
  font-size: 2vh;
  font-weight: bold;
  height: 12.5%;
  width: 11%;
  position: relative;
  background-image: url("@/assets/pictures/tilebackground.jpg");
  background-size: 100% 120%;
  background-position: center;
  padding-left: 0.5vw;
}

.field-number {
  position: absolute;
  top: 0.5vh;
  left: 0.5vw;
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
