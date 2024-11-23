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
                <button
                  @click="removePlayer(index)"
                  class="btn btn-danger btn-sm"
                >
                  {{ $t("delete") }}
                </button>
              </li>
            </ul>
          </div>
          <div class="row mb-2 mt-auto">
            <!-- Spieler hinzufügen Button unten links -->
            <div class="col-2 mt-auto">
              <button @click="addPlayer" class="bierdeckel">
                {{ $t("addPlayer") }}
              </button>
            </div>
            <div class="col-6">
              <label for="playerName" class="form-label">{{
                $t("playerName")
              }}</label>
              <input
                type="text"
                id="playerName"
                v-model="newPlayerName"
                class="form-control"
                required
              />
            </div>
            <div class="col-4">
              <label for="playerColor" class="form-label">{{
                $t("colorChoice")
              }}</label>
              <select
                id="playerColor"
                v-model="newPlayerColor"
                class="form-select"
                required
              >
                <option value="" disabled>{{ $t("chooseColor") }}</option>
                <option
                  v-for="color in availableColors"
                  :key="color.value"
                  :value="color.value"
                >
                  {{ color.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="col-4 d-flex">
        <div class="content-box right-box">
          <h3 for="rulesetSelect" class="form-label">
            {{ $t("chooseRuleset") }}
          </h3>
          <select
            id="rulesetSelect"
            v-model="selectedRuleset"
            class="form-select mt-2"
            @change="setRules(selectedRuleset)"
          >
            <option
              v-for="ruleSet in availableRulesets"
              :key="ruleSet"
              :value="ruleSet"
            >
              {{ ruleSet }}
            </option>
          </select>

          <router-link
            class="bierdeckel mt-auto ml-auto"
            :to="canStartGame ? '/game' : ''"
          >
            {{ $t("startGame") }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameStore } from "../store/store";
import { useI18n } from "vue-i18n";

const store = useGameStore();
const { t } = useI18n();

const newPlayerName = ref("");
const newPlayerColor = ref("");
const selectedRuleset = ref("spiralingDown");
const canStartGame = computed(() => store.players.length >= 2);

// Zugriff auf Farben aus dem Store
const availableColors = computed(() => {
  return store.colors
    .filter(
      (color) => !store.players.some((player) => player.color === color.value)
    )
    .map((color) => ({
      ...color,
      name: t(color.i18nKey),
    }));
});

// Funktionen zum Hinzufügen und Entfernen von Spielern
function addPlayer() {
  if (newPlayerName.value && newPlayerColor.value) {
    store.addPlayer(newPlayerName.value, newPlayerColor.value);
    newPlayerName.value = "";
    newPlayerColor.value = "";
  }
}

function removePlayer(index: number) {
  store.removePlayer(index);
}

function setRules(ruleset: any) {
  // keyof typeof rules
  store.setActiveRules(ruleset);
}

// Zugriff auf den reaktiven players-Zustand
const players = computed(() => store.players);

// Zugriff auf die Liste der verfügbaren Regelsets
const availableRulesets = computed(() => store.availableRulesets);
</script>

<style scoped>
h2 {
  font-size: 4vh;
}
h4 {
  font-size: 3vh;
}

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
.bierdeckel {
  bottom: 2vh; /* Abstand vom unteren Rand */
  right: 2vh; /* Abstand vom rechten Rand */
  width: 15vh; /* Größe des Buttons */
  height: 15vh; /* Quadratisch */
  background-image: url("@/assets/pictures/bierdeckel.jpg"); /* Hintergrundbild */
  background-size: cover; /* Bild vollständig anzeigen */
  background-position: center; /* Zentrieren des Bildes */
  background-repeat: no-repeat; /* Keine Wiederholung des Bildes */
  border: none; /* Entferne Standard-Grenzen */
  border-radius: 50%; /* Runde den Button */
  display: flex; /* Ermöglicht Text-Inhalt zu platzieren */
  justify-content: center; /* Text zentrieren */
  align-items: center; /* Text vertikal zentrieren */
  text-decoration: none; /* Entferne Unterstreichung */
  color: white; /* Textfarbe */
  font-size: 2.5vh; /* Textgröße */
  font-weight: bold; /* Fettgedruckt */
}
.bierdeckel:hover {
  transform: scale(1.1); /* Animation bei Hover */
  transition: transform 0.2s ease-in-out;
}
</style>
