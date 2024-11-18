<template>
  <div
    class="offcanvas offcanvas-end background"
    tabindex="-1"
    id="offcanvasRight"
    aria-labelledby="offcanvasRightLabel"
  >
    <div class="offcanvas-header">
      <h5 id="offcanvasRightLabel">{{ $t("settings") }}</h5>
      <button
        type="button"
        class="btn-close text-reset"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <p>{{ $t("chooseLanguage") }}</p>
      <div class="dropdown">
        <button
          class="btn btn-light dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            :src="`/src/assets/languages/${selectedLanguage}-flag.png`"
            alt="Flag"
            class="flag-icon"
          />
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <li v-if="selectedLanguage !== 'en'">
            <a
              class="dropdown-item"
              href="#"
              @click.prevent="changeLanguage('en')"
            >
              <img
                src="@/assets/languages/en-flag.png"
                alt="English"
                class="flag-icon"
              />
              English
            </a>
          </li>
          <li v-if="selectedLanguage !== 'de'">
            <a
              class="dropdown-item"
              href="#"
              @click.prevent="changeLanguage('de')"
            >
              <img
                src="@/assets/languages/de-flag.png"
                alt="Deutsch"
                class="flag-icon"
              />
              Deutsch
            </a>
          </li>
        </ul>
      </div>

      <!-- Bilder und Einstellungen untereinander -->
      <div class="settings-images">
        <div class="setting-item">
          <img
            :src="
              store.settings.music
                ? '/src/assets/pictures/bier-voll.png'
                : '/src/assets/pictures/bier-leer.png'
            "
            alt="Music"
            class="settings-image"
            @click="toggleMusic"
          /><i class="bi bi-music-note-beamed"></i>
          <span>{{ $t("music") }}</span>
        </div>
        <div class="setting-item">
          <img
            :src="
              store.settings.sound
                ? '/src/assets/pictures/bier-voll.png'
                : '/src/assets/pictures/bier-leer.png'
            "
            alt="Sound"
            class="settings-image"
            @click="toggleSound"
          /><i class="bi bi-soundwave"></i>
          <span>{{ $t("sound") }}</span>
        </div>
        <div class="setting-item">
          <img
            :src="
              store.settings.vibration
                ? '/src/assets/pictures/bier-voll.png'
                : '/src/assets/pictures/bier-leer.png'
            "
            alt="Vibration"
            class="settings-image"
            @click="toggleVibration"
          /><i class="bi bi-phone-vibrate"></i>
          <span>{{ $t("vibration") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useGameStore } from "../store/store";

// Zugriff auf i18n und Store
const { locale } = useI18n();
const store = useGameStore();

// Lokaler Zustand für die ausgewählte Sprache
const selectedLanguage = ref(locale.value);

// Funktion zum Ändern der Sprache
function changeLanguage(lang: string) {
  selectedLanguage.value = lang;
  locale.value = lang;
}

// Funktionen zum Anpassen der Einstellungen
function toggleMusic() {
  store.setSettings({ music: !store.settings.music });
}

function toggleSound() {
  store.setSettings({ sound: !store.settings.sound });
}

function toggleVibration() {
  store.setSettings({ vibration: !store.settings.vibration });
}
</script>

<style scoped>
.background {
  align-items: normal;
}

.btn-close {
  --bs-btn-close-opacity: 1;
  background: none;
  border: none;
  color: black;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.offcanvas.offcanvas-end {
  width: 25vw
}
.flag-icon {
  width: 5vh;
  height: auto;
  margin-right: 0.5vh;
  vertical-align: middle;
}

.btn-close::before {
  content: "⚙️";
}

.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 1050;
  overflow-y: auto;
}

.card-body {
  background-color: white;
  color: #333;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  height: 100%;
  padding: 1vh;
}

.settings-images {
  display: flex;
  flex-direction: column; /* Bilder untereinander anordnen */
  gap: 1vh;
  margin-top: 5vh;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1vh;
}

.settings-image {
  width: 5vw;
  height: auto;
  cursor: pointer;
}

.setting-item span {
  font-size: 1rem;
  font-weight: 500;
}
</style>
