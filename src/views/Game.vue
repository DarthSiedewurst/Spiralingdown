<template>
  <router-link to="/" class="back-to-home">{{ $t("backToHome") }}</router-link>
  <Overlay
    :player="currentPlayer"
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
    <Player v-for="(player, index) in store.players" :key="player.name + index" :playerId="index" />
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
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="staticBackdropLabel">{{ modalTitle }}</h4>
        </div>
        <div class="modal-body">{{ modalDescription }}</div>
        <div class="modal-footer">
          <router-link v-if="winner" class="btn btn-warning" :to="'/'">
            {{ $t("toHome") }}
          </router-link>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Okay</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted, watch } from "vue";
import { useGameStore } from "../store/store";
// @ts-ignore
import DiceBox from "@3d-dice/dice-box";
import Player from "@/components/Player.vue";
import Overlay from "../components/Overlay.vue";
import { PlayerModel } from "../store/interfaces";
// @ts-ignore
import { Modal } from "bootstrap";
import i18n from "../i18n/i18n";
import { useI18n } from "vue-i18n";
import { processDescription, replacePlayerName } from "../services/getDescription";
import { soundRoll, soundLanding, soundVictory } from "../services/soundService";

function vibrate(pattern: number | number[]) {
  if (store.settings.vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

onMounted(() => {
  diceBox.init();
});
onUnmounted(() => {
  diceBox.clear();
});

const store = useGameStore();
const { locale, t } = useI18n();

const gameData = computed(() => store.currentRuleset);
const currentPlayer = computed(
  () =>
    store.players[store.currentPlayerIndex % Math.max(1, store.players.length)] ?? store.players[0],
);
const winner = computed(() => store.winner);
const getFieldData = computed(() => (fieldId: number) => {
  return gameData.value?.[`fieldId${fieldId}`] || { name: "", description: "" };
});

const diceBox = new DiceBox({
  container: "#dice-box",
  assetPath: "/dice-box/",
  scale: 6,
  themeColor: "#0f4c81",
});

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
  0, 1, 2, 3, 4, 5, 6, 7, 41, 42, 43, 44, 45, 46, 47, 30, 31, 32, 33, 34, 35, 59, 60, 61, 62, 63,
  52, 53, 54, 55, 69, 70, 71, 66, 67,
];

// Zugriff auf die aktuellen Regeln

const currentPosition = ref(0);
const modalTitle = ref(""); // Modal-Titel
const modalDescription = ref(""); // Modal-Beschreibung
const modalRule = ref(""); // Modal-Rule
const isRolling = ref(false); // Statusvariable, ob gerade gewürfelt wird
const WINNER_FIELD = 71; // innste Kachel (72. Feld, z.b. "SIEG" im Regelsatz)
let currentRuleIndex: number | null = null;

async function rollDice() {
  if (isRolling.value || winner.value) return; // Verhindere mehrfaches Würfeln
  if (store.players.length === 0) return;

  isRolling.value = true;

  const current = store.players[store.currentPlayerIndex];
  if (store.settings.sound) {
    soundRoll();
  }
  vibrate(40);

  const diceResult = await diceBox.roll("1d6");
  const steps = diceResult[0].value;
  //const steps = 6;

  await movePlayerSpiral(current, steps);
  if (store.settings.sound) soundLanding();
  vibrate(80);

  // Logik für Modals und Bewegung
  await handleFieldInteraction(current, steps);

  // Sieg: wer Feld 72 erreicht, gewinnt — kein weiterer Zug
  if (current.position >= WINNER_FIELD) {
    store.winner = current.name;
    if (store.settings.sound) soundVictory();
    if (store.settings.vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    showModal({
      name: t("winner", { name: current.name }),
      description: t("winnerField", { number: WINNER_FIELD + 1 }),
    });
    return;
  }

  // Spielerwechsel
  store.currentPlayerIndex = (store.currentPlayerIndex + 1) % store.players.length;

  isRolling.value = false;
}

async function handleFieldInteraction(player: PlayerModel, steps: number) {
  let fieldData = getFieldData.value(player.position);

  while (fieldData.move) {
    await showModal(fieldData);

    await movePlayerSpiral(player, fieldData.move);

    fieldData = getFieldData.value(player.position);
  }

  fieldData.description = processDescription(fieldData.description, steps, player.name);

  await showModal(fieldData);
}

function showModal(fieldData: any): Promise<void> {
  return new Promise((resolve) => {
    modalTitle.value = fieldData.name || "Kein Titel";
    modalDescription.value = fieldData.description || "Keine Beschreibung";

    if (fieldData.rule) {
      modalRule.value = fieldData.rule === "Random" ? getRandomRule() : fieldData.rule;
      modalRule.value = replacePlayerName(modalRule.value, currentPlayer.value?.name ?? "");
    }

    const modalElement = document.getElementById("staticBackdrop");

    // Erst beim "hidden" (Transition FERTIG) auflösen:
    // "hide" feuert nur beim Start des Ausblendens — löst man dort auf, startet
    // das nächste Modal noch vor Ablauf der alten Transition und wird von deren
    // überstehenem transitionend-Callback sofort wieder weggerissen (Feld-30-Bug).
    // Eine wiederverwendete Modal-Instanz verhindert konkurrierende Instanzen.
    const onHidden = () => resolve();
    modalElement?.addEventListener("hidden.bs.modal", onHidden, { once: true });

    Modal.getOrCreateInstance(modalElement!).show();
  });
}

// -99 = Konvention für "Sprung auf ein zufälliges Feld" (z.B. Magische Miesmuschel).
const RANDOM_MOVE = -99;

function randomTargetField(exclude: number): number {
  let target = exclude;
  // Nicht aufs eigene Feld und nicht direkt auf "SIEG" (71) — sonst Gratis-Sieg.
  while (target === exclude || target === WINNER_FIELD) {
    target = Math.floor(Math.random() * 72); // 0..71
  }
  return target;
}

function movePlayerSpiral(player: PlayerModel, move: number): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = player.position;
    // -99 = Ziel ist ein zufälliges Feld, sonst relative Versetzung.
    const endPosition =
      move === RANDOM_MOVE ? randomTargetField(startPosition) : startPosition + move;
    const direction = Math.sign(endPosition - startPosition);

    if (Math.abs(endPosition - startPosition) <= 6) {
      // Kurz genug (z.B. Wurf 1-6): Figur beim Wandern zusehen -> Schritt für Schritt.
      let currentStep = startPosition;

      const moveStep = () => {
        if (
          (direction > 0 && currentStep < endPosition) ||
          (direction < 0 && currentStep > endPosition)
        ) {
          currentStep += direction; // Vorwärts oder rückwärts bewegen
          player.position = currentStep;
          setTimeout(moveStep, 500); // 500ms pro Schritt
        } else {
          resolve(); // Bewegung abgeschlossen
        }
      };

      moveStep();
    } else {
      // Weiter entfernt (z.B. Lucky Shot, zurück zum Start, Zufalls-Sprung): direkt springen.
      player.position = endPosition;
      resolve(); // Bewegung abgeschlossen
    }
  });
}

function getRandomRule() {
  const allRules = i18n.global.messages[locale.value as keyof typeof i18n.global.messages].rules;

  if (Array.isArray(allRules) && allRules.length > 0) {
    currentRuleIndex = Math.floor(Math.random() * allRules.length);
    return allRules[currentRuleIndex];
  }
  return ""; // Fallback, falls keine Regeln verfügbar sind
}

watch(locale, () => {
  if (currentRuleIndex !== null) {
    const allRules = i18n.global.messages[locale.value as keyof typeof i18n.global.messages].rules;

    if (Array.isArray(allRules) && allRules[currentRuleIndex]) {
      modalRule.value = allRules[currentRuleIndex];
    }
  }
});
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}
.back-to-home {
  position: fixed;
  top: 0.6rem;
  left: 0.8rem;
  z-index: 1001;
  font-size: 2.2vh;
  padding: 0.3rem 1rem;
  background: rgba(255, 255, 255, 0.85);
  color: #0f4c81;
  text-decoration: none;
  font-weight: bold;
  border-radius: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
.back-to-home:hover {
  background: #fff;
}
.modal-content {
  text-align: center;
}
.modal-header {
  display: block;
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
