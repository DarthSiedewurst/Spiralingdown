<template>
  <div class="collapse collapse-horizontal sidebar" id="collapseWidthExample">
    <div class="card card-body">
      <h5>{{ $t("settings") }}</h5>
      <p>{{ $t("chooseLanguage") }}</p>
      <select
        v-model="selectedLanguage"
        class="form-select mb-3"
        @change="changeLanguage"
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </select>
      <button class="btn btn-primary">{{ $t("saveSettings") }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

// Zugriff auf i18n
const { t, locale } = useI18n();

// Lokaler Zustand für die ausgewählte Sprache
const selectedLanguage = ref(locale.value);

// Funktion zum Ändern der Sprache
function changeLanguage() {
  locale.value = selectedLanguage.value; // Ändert die Sprache dynamisch
}
</script>

<style scoped>
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
  padding: 1rem;
}
</style>
