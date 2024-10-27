<template>
  <h1>{{ $t("title") }}</h1>

  <div class="row mt-4">
    <div class="col-md-8">
      <div class="content-box d-flex flex-column" style="height: 100%;">
        <div>
          <h2>{{ $t("currentPlayers") }}</h2>
          <ul class="list-unstyled">
            <li
              v-for="(player, index) in players"
              :key="index"
              class="d-flex justify-content-between align-items-center player"
              :style="{ '--player-color': player.color }"
            >
              <h4>{{ player.name }} ({{ player.color }})</h4>
              <button
                @click="removePlayer(index)"
                class="btn btn-danger btn-sm"
              >
                {{ $t("delete") }}
              </button>
            </li>
          </ul>

          <h2>{{ $t("addPlayer") }}</h2>
          <div class="row mb-3">
            <div class="col-md-8">
              <label for="playerName" class="form-label">{{ $t("playerName") }}</label>
              <input
                type="text"
                id="playerName"
                v-model="newPlayerName"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-4">
              <label for="playerColor" class="form-label">{{ $t("colorChoice") }}</label>
              <select
                id="playerColor"
                v-model="newPlayerColor"
                class="form-select"
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

        <!-- Spieler hinzufügen Button unten links -->
        <div class="mt-auto">
          <button @click="addPlayer" class="btn btn-primary">
            {{ $t("addPlayer") }}
          </button>
        </div>
      </div>
    </div>

    <div class="col-md-4 d-flex">
      <div class="content-box right-box">
        <router-link to="/game" class="btn btn-primary game-button">{{ $t("startGame") }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameStore } from "../store/store";
import i18n from "../i18n/i18n";

const store = useGameStore();
const newPlayerName = ref("");
const newPlayerColor = ref("");

// Originalfarben als konstante Liste
const originalColors = ref(
  i18n.global.getLocaleMessage(i18n.global.locale as string).colors
);

// Verfügbare Farben verwalten
const availableColors = ref([...originalColors.value]);

function addPlayer() {
  if (newPlayerName.value && newPlayerColor.value) {
    store.addPlayer(newPlayerName.value, newPlayerColor.value);
    // Entferne die gewählte Farbe aus den verfügbaren Farben
    availableColors.value = availableColors.value.filter(
      (color) => color.value !== newPlayerColor.value
    );
    newPlayerName.value = "";
    newPlayerColor.value = "";
  }
}

function removePlayer(index: number) {
  const playerColor = players.value[index].color;
  store.removePlayer(index);
  // Füge die Farbe zurück zu den verfügbaren Farben hinzu
  if (!availableColors.value.some((color) => color.value === playerColor)) {
    const colorToAdd = originalColors.value.find(
      (color) => color.value === playerColor
    );
    if (colorToAdd) {
      availableColors.value.push(colorToAdd);
    }
  }
}

const players = computed(() => store.players);
</script>

<style scoped>
.content-box {
  display: flex;
  flex-direction: column;
}

.right-box {
  display: flex;
  align-items: flex-end; /* Vertikale Ausrichtung unten */
  justify-content: flex-end; /* Horizontale Ausrichtung rechts */
  padding: 1rem;
  width: 100%; /* Stellt sicher, dass die Box den gesamten Platz einnimmt */
}

.player {
  color: var(--player-color);
}
</style>
