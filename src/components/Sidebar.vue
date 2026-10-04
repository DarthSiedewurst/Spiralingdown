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
          <img :src="flags[selectedLanguage]" alt="Flag" class="flag-icon" />
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <li v-if="selectedLanguage !== 'en'">
            <a class="dropdown-item" href="#" @click.prevent="changeLanguage('en')">
              <img src="@/assets/languages/en-flag.png" alt="English" class="flag-icon" />
              English
            </a>
          </li>
          <li v-if="selectedLanguage !== 'de'">
            <a class="dropdown-item" href="#" @click.prevent="changeLanguage('de')">
              <img src="@/assets/languages/de-flag.png" alt="Deutsch" class="flag-icon" />
              Deutsch
            </a>
          </li>
        </ul>
      </div>

      <!-- Bilder und Einstellungen untereinander -->
      <div class="settings-images">
        <div class="setting-item">
          <img
            :src="store.settings.music ? bierVoll : bierLeer"
            alt="Music"
            class="settings-image"
            @click="toggleMusic"
          /><i class="bi bi-music-note-beamed"></i>
          <span>{{ $t("music") }}</span>
        </div>
        <div class="setting-item">
          <img
            :src="store.settings.sound ? bierVoll : bierLeer"
            alt="Sound"
            class="settings-image"
            @click="toggleSound"
          /><i class="bi bi-soundwave"></i>
          <span>{{ $t("sound") }}</span>
        </div>
        <div class="setting-item">
          <img
            :src="store.settings.vibration ? bierVoll : bierLeer"
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
import bierVoll from "@/assets/pictures/bier-voll.png";
import bierLeer from "@/assets/pictures/bier-leer.png";
import deFlag from "@/assets/languages/de-flag.png";
import enFlag from "@/assets/languages/en-flag.png";

type AppLocale = "de" | "en";

const flags: Record<AppLocale, string> = { de: deFlag, en: enFlag };

// Zugriff auf i18n und Store
const { locale } = useI18n();
const store = useGameStore();

// Lokaler Zustand für die ausgewählte Sprache
const selectedLanguage = ref<AppLocale>(locale.value as AppLocale);

// Funktion zum Ändern der Sprache
function changeLanguage(lang: AppLocale) {
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
/* .background wird global als flex-column (Display) gesetzt;
   Sidebar braucht normale Spalten-Layout ohne Centering */
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
  width: 25vw;
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
