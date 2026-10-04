<template>
  <div class="container">
    <h1>{{ $t("title") }}</h1>

    <div class="row mt-2">
      <div class="col-8">
        <div class="content-box d-flex flex-column">
          <h3>{{ $t("currentPlayers") }}</h3>
          <div class="overflow">
            <ul class="list-unstyled">
              <li
                v-for="(player, index) in players"
                :key="index"
                class="d-flex justify-content-between align-items-center player"
                :style="{ '--player-color': player.color }"
              >
                <h4>{{ player.name }}</h4>
                <button @click="removePlayer(index)" class="btn btn-danger btn-sm">
                  {{ $t("delete") }}
                </button>
              </li>
            </ul>
          </div>
          <p v-if="addError" class="text-danger fw-bold mb-1">{{ addError }}</p>
          <div class="row mb-2 mt-auto">
            <div class="col-2 mt-auto">
              <button @click="addPlayer" class="bierdeckel">{{ $t("addPlayer") }}</button>
            </div>
            <div class="col-6">
              <label for="playerName" class="form-label">{{ $t("playerName") }}</label>
              <input
                type="text"
                id="playerName"
                v-model="newPlayerName"
                class="form-control"
                :class="{ 'is-invalid': addError }"
                required
              />
            </div>
            <div class="col-4">
              <label for="playerColor" class="form-label">{{ $t("colorChoice") }}</label>
              <select
                id="playerColor"
                v-model="newPlayerColor"
                class="form-select"
                :class="{ 'is-invalid': addError }"
                required
              >
                <option value="" disabled>{{ $t("chooseColor") }}</option>
                <option v-for="color in availableColors" :key="color.value" :value="color.value">
                  {{ color.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="col-4 d-flex">
        <div class="content-box right-box">
          <label class="form-label" for="rulesetSelect">{{ $t("chooseRuleset") }}</label>
          <select
            id="rulesetSelect"
            v-model="selectedRuleset"
            class="form-select mt-2"
            @change="setRules(selectedRuleset)"
          >
            <option v-for="ruleSet in availableRulesets" :key="ruleSet" :value="ruleSet">
              {{ ruleSet }}
            </option>
          </select>

          <p v-if="store.winner" class="text-muted mt-3">
            {{ t("roundOverWinner", { name: store.winner }) }}
          </p>
          <p v-if="players.length === 0" class="text-muted mt-3">
            {{ t("needPlayers") }}
          </p>

          <div class="buttons d-flex mt-auto justify-content-between">
            <!-- "Neues Spiel" (unten links): nur Spielfeld zuruecksetzen, Spieler bleiben -->
            <button
              v-if="store.hasPlayed"
              class="bierdeckel bierdeckel-new"
              type="button"
              @click="startNewGame"
            >
              {{ $t("newGame") }}
            </button>
            <span v-else></span>

            <!-- "Starten"/"Weiter" (unten rechts) -->
            <button class="bierdeckel" type="button" :disabled="!canStartGame" @click="goToGame">
              {{ store.hasPlayed ? $t("continue") : $t("startGame") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameStore } from "../store/store";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const store = useGameStore();
const { t } = useI18n();
const router = useRouter();

const newPlayerName = ref("");
const newPlayerColor = ref("");
const addError = ref("");
const selectedRuleset = ref(store.activeRuleset);
const canStartGame = computed(() => store.players.length >= 2);

const availableColors = computed(() => {
  return store.colors
    .filter((color) => !store.players.some((player) => player.color === color.value))
    .map((color) => ({
      ...color,
      name: t(color.i18nKey),
    }));
});

const players = computed(() => store.players);
const availableRulesets = computed(() => store.availableRulesets);

function addPlayer() {
  if (!newPlayerName.value.trim() || !newPlayerColor.value) {
    addError.value = t("playerInfoMissing");
    return;
  }
  store.addPlayer(newPlayerName.value.trim(), newPlayerColor.value);
  newPlayerName.value = "";
  newPlayerColor.value = "";
  addError.value = "";
}

function removePlayer(index: number) {
  store.removePlayer(index);
}

function setRules(ruleset: string) {
  store.setActiveRules(ruleset);
}

function goToGame() {
  if (!canStartGame.value) return;
  store.hasPlayed = true;
  router.push({ name: "Game" });
}

function startNewGame() {
  store.restartRound();
  if (canStartGame.value) {
    store.hasPlayed = true;
    router.push({ name: "Game" });
  }
}
</script>

<style scoped>
.right-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
}
.player {
  color: var(--player-color);
}
.buttons {
  gap: 3vh;
  align-items: center;
  justify-content: flex-end;
}
.bierdeckel {
  width: 15vh;
  height: 15vh;
  background-image: url("@/assets/pictures/bierdeckel.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: black;
  font-size: 2.5vh;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
}
.bierdeckel:hover:not(:disabled) {
  transform: scale(1.1);
  transition: transform 0.2s ease-in-out;
}
.bierdeckel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.bierdeckel-new {
  background-position: top;
}
</style>
