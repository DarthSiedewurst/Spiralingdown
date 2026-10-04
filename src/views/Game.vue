<template>
  <router-link to="/" class="back-to-home">{{ $t("backToHome") }}</router-link>
  <Overlay :player="currentPlayer" :rule="modalRule" :playerPosition="currentPlayer.position" />
  <BoardGrid @roll="rollDice" :get-field-data="getFieldData" :active-position="currentPosition">
    <Player
      v-for="(player, index) in store.players"
      :key="player.name + index"
      :playerId="index"
      @inspect="inspectEffect(store.players[index])"
    />
  </BoardGrid>

  <!-- Idle-Overlay: grauer Filter + "Tippe zum Würfeln" nach 30 s Inaktivität.
       Nur sichtbar, wenn kein Modal/Roll-Kette offen und kein Winner ist. -->
  <div v-if="idle && !winner" class="idle-hint" @click="rollDice">
    <div class="idle-hint-message">{{ $t("tipToRoll") }}</div>
  </div>
  <!-- Winner-Confetti: fällt solange das Winner-Modal offen ist. -->
  <div v-if="winner" class="confetti" aria-hidden="true">
    <span v-for="(c, i) in confettiPieces" :key="i" class="confetti-piece" :style="c.style"></span>
  </div>
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
        <div v-if="currentPlayer?.effect" class="effect-hint">
          {{
            $t("effectHint", {
              name: currentPlayer.name,
              effect: $t(`effects.${currentPlayer.effect.type}`),
              turns: currentPlayer.effect.turnsLeft,
            })
          }}
        </div>
        <div class="modal-footer">
          <router-link v-if="winner" class="btn btn-warning" :to="'/'">
            {{ $t("toHome") }}
          </router-link>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            {{ $t("okay") }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Swap-Picker: wird nach dem Swap-Feld-Modal geöffnet, Spieler wählen. -->
  <div class="modal fade" id="swapPicker" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">{{ $t("swapTitle") }}</h4>
        </div>
        <div class="modal-body swap-picker-body">
          <button
            v-for="other in swapCandidates"
            :key="other.name"
            type="button"
            class="btn btn-light swap-pick"
            @click="pickSwap(other.name)"
          >
            {{ other.name }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Effekt-Info: Token antippen zeigt das aktive Effekt. -->
  <div class="modal fade" id="effectInfo" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">{{ effectInspectedName }}</h4>
        </div>
        <div class="modal-body">
          {{ effectInspected }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            {{ $t("okay") }}
          </button>
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
import BoardGrid from "../components/BoardGrid.vue";
import Overlay from "../components/Overlay.vue";
import { PlayerModel, FieldModel } from "../store/interfaces";
// @ts-ignore
import { Modal } from "bootstrap";
import { getRules } from "../rulesets/index";
import { useI18n } from "vue-i18n";
import { processDescription, replacePlayerName } from "../services/getDescription";
import { soundRoll, soundLanding, soundVictory } from "../services/soundService";

function vibrate(pattern: number | number[]) {
  if (store.settings.vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// true, solange diese View gemountet ist. Wird false bei Navigation weg;
// laeuft dann die Roll-Kette weiter, bricht sie ihre Aenderungen ab.
const mountedRef = ref(true);

onMounted(() => {
  diceBox.init();
  mountedRef.value = true;
});
onUnmounted(() => {
  diceBox.clear();
  mountedRef.value = false;
  if (store.rolling) store.rolling = false; // Roll-Kette darf hier nicht mehr laufen
});

const store = useGameStore();
const { locale, t } = useI18n();

const gameData = computed(() => store.currentRuleset);
const currentPlayer = computed(
  () =>
    store.players[store.currentPlayerIndex % Math.max(1, store.players.length)] ?? store.players[0],
);
const winner = computed(() => store.winner);
const getFieldData = computed(() => (fieldId: number): FieldModel => {
  const field = gameData.value.fields?.[fieldId];
  return (field ?? { name: "" }) as FieldModel;
});

const diceBox = new DiceBox({
  container: "#dice-box",
  assetPath: "/dice-box/",
  scale: 6,
  themeColor: "#0f4c81",
});

// Zugriff auf die aktuellen Regeln

// Aktuelles Feld des aktiven Spielers — markieren im Board (highlight).
const currentPosition = computed(() => currentPlayer.value?.position ?? -1);
const modalTitle = ref(""); // Modal-Titel
const modalDescription = ref(""); // Modal-Beschreibung
const modalRule = ref(""); // Modal-Rule
const WINNER_FIELD = 71; // innste Kachel (72. Feld, z.b. "SIEG" im Regelsatz)
let currentRuleIndex: number | null = null;

async function rollDice() {
  if (store.rolling || winner.value) return; // Verhindere mehrfaches Würfeln
  if (store.players.length === 0) return;

  store.rolling = true;

  const current = store.players[store.currentPlayerIndex];
  if (store.settings.sound) {
    soundRoll();
  }
  vibrate(40);

  const diceResult = await diceBox.roll("1d6");
  const steps = diceResult[0].value;
  //const steps = 6;

  const abort = () => {
    if (!mountedRef.value) {
      store.rolling = false;
      return true;
    }
    return false;
  };

  await movePlayerSpiral(current, steps);
  if (abort()) return;
  if (store.settings.sound) soundLanding();
  vibrate(80);

  // Logik für Modals und Bewegung
  await handleFieldInteraction(current, steps);
  if (abort()) return;

  // Sieg: wer das innste Feld erreicht, gewinnt — kein weiterer Zug
  if (current.position >= WINNER_FIELD) {
    store.setWinner(current.name);
    store.rolling = false;
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

  // Effekt des neuen aktuellen Spielers um einen eigenen Zug zählern.
  const nextPlayer =
    store.players[(store.currentPlayerIndex + 1) % store.players.length] ?? store.players[0];
  if (nextPlayer) store.tickEffect(nextPlayer.name);

  // Spielerwechsel
  store.currentPlayerIndex = (store.currentPlayerIndex + 1) % store.players.length;

  store.rolling = false;
}

async function handleFieldInteraction(player: PlayerModel, steps: number) {
  // Sicherheitsnetz gegen fehlerhafte Regeldaten: Kette kann theoretisch im
  // Kreis laufen. -> harte Obergrenze + Abbruch beim Wiederkommen, damit die
  // App nie hngt.
  const fieldCount = Math.max(1, store.currentRuleset?.fields?.length ?? 1);
  const maxSteps = fieldCount + 5;
  const visited = new Set<number>();

  let fieldId = player.position;
  let guard = 0;

  while (true) {
    if (!mountedRef.value) return; // View ist weg -> Kette nicht weiterfuehren.
    const field = getFieldData.value(fieldId);
    const move = typeof field.move === "number" && field.move !== 0 ? field.move : 0;

    if (visited.has(fieldId) || guard > maxSteps) {
      console.warn(`Regel-Kette bricht bei Feld ${fieldId} ab (Zirkel/zu lang).`);
      return;
    }

    // Kein Sprung -> Endfeld erreicht -> Effekt/Swap oder Beschreibung.
    if (move === 0) {
      const display: FieldModel = {
        name: field.name,
        description: processDescription(field.description, steps, player.name),
        rule: field.rule,
      };

      if (field.effect) {
        store.applyEffect(player.name, field.effect, field.effectDuration ?? 1);
      }

      await showModal(display);

      if (field.swap) {
        swapPending.value = player.name;
        await openSwapPicker();
      }
      return;
    }

    visited.add(fieldId);
    guard++;

    // Zwischensprung anzeigen, dann weiter bewegen.
    await showModal(field);
    if (!mountedRef.value) return;
    await movePlayerSpiral(player, move);
    if (!mountedRef.value) return;
    fieldId = player.position;
  }
}

function showModal(fieldData: FieldModel): Promise<void> {
  // View ist nicht mehr gemountet (Navigation weg): sofort auflösen, damit die
  // Roll-Kette nicht ueber ein fehlendes Element aendert bzw. haengt.
  if (!mountedRef.value) return Promise.resolve();

  return new Promise((resolve) => {
    modalTitle.value = fieldData.name || t("noTitle");
    modalDescription.value = fieldData.description || t("noDescription");

    if (fieldData.rule) {
      modalRule.value = fieldData.rule === "Random" ? getRandomRule() : fieldData.rule;
      modalRule.value = replacePlayerName(modalRule.value, currentPlayer.value?.name ?? "");
    }

    const modalElement = document.getElementById("staticBackdrop");
    if (!modalElement) {
      resolve();
      return;
    }

    // Erst beim "hidden" (Transition FERTIG) auflösen:
    // "hide" feuert nur beim Start des Ausblendens — löst man dort auf, startet
    // das nächste Modal noch vor Ablauf der alten Transition und wird von deren
    // überstehenem transitionend-Callback sofort wieder weggerissen (Feld-30-Bug).
    // Eine wiederverwendete Modal-Instanz verhindert konkurrierende Instanzen.
    const onHidden = () => resolve();
    modalElement.addEventListener("hidden.bs.modal", onHidden, { once: true });
    Modal.getOrCreateInstance(modalElement).show();
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
        if (!mountedRef.value) {
          resolve();
          return;
        }
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

// ------------------------------------------------------------------
// Swap-Auswahl: "Tausche mit..." wird zur Auswahl eines Mitspielers.
// ------------------------------------------------------------------
const swapPending = ref<string | null>(null);
const swapModalRef = ref<Modal | null>(null);

const swapCandidates = computed(() => {
  const me = store.players.find((p) => p.name === swapPending.value);
  // Nur noch mindestens 2 Spieler dürfen tauschen.
  if (!me || store.players.length < 2) return [];
  return store.players.filter((p) => p.name !== me.name);
});

async function openSwapPicker(): Promise<void> {
  if (!mountedRef.value || swapCandidates.value.length === 0) return;
  const el = document.getElementById("swapPicker");
  if (!el) return;
  await new Promise<void>((resolve) => {
    const onHidden = () => resolve();
    el.addEventListener("hidden.bs.modal", onHidden, { once: true });
    swapModalRef.value = Modal.getOrCreateInstance(el);
    swapModalRef.value.show();
  });
}

function pickSwap(name: string) {
  const idxA = store.players.findIndex((p) => p.name === swapPending.value);
  const idxB = store.players.findIndex((p) => p.name === name);
  if (idxA !== -1 && idxB !== -1) {
    store.swapPositions(idxA, idxB);
    soundLanding();
    vibrate(60);
  }
  swapPending.value = null;
  // Modal wird durch den Click auf den Player automatisch geschlossen? Nein:
  // Bootstrap-Modal braucht ein explizites Hide — tun wir hier.
  const el = document.getElementById("swapPicker");
  if (el && swapModalRef.value) swapModalRef.value.hide();
}

// ------------------------------------------------------------------
// Spieler-Token antippen: aktiv Effekt anzeigen.
// ------------------------------------------------------------------
const effectModalRef = ref<Modal | null>(null);
const effectInspectedName = ref("");
const effectInspected = ref("");

function inspectEffect(player?: PlayerModel) {
  if (!player?.effect || !mountedRef.value) return;
  effectInspectedName.value = player.name;
  effectInspected.value = t("effectHint", {
    name: player.name,
    effect: t(`effects.${player.effect.type}`),
    turns: player.effect.turnsLeft,
  });
  const el = document.getElementById("effectInfo");
  if (!el) return;
  effectModalRef.value = Modal.getOrCreateInstance(el);
  effectModalRef.value.show();
}

function getRandomRule() {
  const allRules = getRules(locale.value);
  if (allRules.length > 0) {
    currentRuleIndex = Math.floor(Math.random() * allRules.length);
    return allRules[currentRuleIndex] ?? "";
  }
  return ""; // Fallback, falls keine Regeln verfügbar sind
}

// Winner-Confetti: statische Stück-Liste einmal pro Winner-Bildschirm erzeugt.
const CONFETTI_COLORS = ["#ffcc00", "#ff5f5f", "#37b24d", "#748ffc", "#e64980", "#ffffff"];
const confettiPieces = computed(() =>
  Array.from({ length: 80 }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const drift = (Math.random() - 0.5) * 20; // vw
    const size = 6 + Math.random() * 10; // px
    const duration = 2.4 + Math.random() * 2.6; // s
    const delay = Math.random() * 1.4; // s
    const skew = Math.random() * 360; // deg
    return {
      style: {
        left: `${Math.random() * 100}vw`,
        width: `${size}px`,
        height: `${size * 1.4}px`,
        background: color,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        "--drift": `${drift}vw`,
        "--skew": `${skew}deg`,
      } as Record<string, string>,
    };
  }),
);

watch(locale, () => {
  if (currentRuleIndex !== null) {
    const rule = getRules(locale.value)[currentRuleIndex];
    if (rule) {
      modalRule.value = rule;
    }
  }
});

// ------------------------------------------------------------------
// Idle-Detection: nach 30 s ohne Roll-Kette (kein Modal offen) zeigt
// ein leicht ausgegrautes Overlay "Tippe zum Würfeln". Click würfelt.
// ------------------------------------------------------------------
const IDLE_MS = 30_000;
const idle = ref(false);
let idleTimer: number | undefined;

function resetIdle() {
  idle.value = false;
  if (idleTimer !== undefined) window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    idle.value = true;
  }, IDLE_MS);
}

onMounted(resetIdle);
onUnmounted(() => {
  if (idleTimer !== undefined) window.clearTimeout(idleTimer);
});

// Roll-Kette = "Aktivität". Solange läuft (Modal offen etc.) darf Idle nicht
// anschlagen. Ende der Roll-Kette → Timer neu starten (30 s ab jetzt).
// (Das Idle-Overlay selbst fängt bei Idle alle Taps ab → rollDice → rolling→true.)
watch(
  () => store.rolling,
  (busy: boolean) => {
    if (busy) {
      idle.value = false;
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    } else {
      resetIdle();
    }
  },
);
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

/* Idle-Overlay: leichtes Graufenster + pulsierender Text. */
.idle-hint {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  user-select: none;
}
.idle-hint-message {
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: bold;
  padding: 0.5rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.45);
  animation: idle-pulse 1.8s ease-in-out infinite;
}
@keyframes idle-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Winner-Confetti: Stück fällt von oben + weicht seitlich aus + dreht sich.
   Z-Index über allem (auch über dem Winner-Modal), reine Decoration. */
.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2000;
  overflow: hidden;
}
.confetti-piece {
  position: absolute;
  top: -3vh;
  border-radius: 2px;
  animation: confetti-fall 3s linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-5vh) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) translateX(var(--drift, 0vw)) rotate(var(--skew, 360deg));
    opacity: 0.85;
  }
}

/* Effekt-Hinweis im Feld-Modal (unter der Beschreibung). */
.effect-hint {
  margin-top: 1rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.75rem;
  background: rgba(255, 204, 0, 0.18);
  border: 1px dashed #cc9f00;
  color: #6b5300;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Swap-Auswahl: Kacheln in 2 Spalten. */
.swap-picker-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  text-align: center;
}
</style>
