// src/i18n/i18n.ts
import { createI18n } from "vue-i18n";

// Importiere die JSON-Dateien
import de from "./de.json";
import en from "./en.json";

// I18n-Konfiguration erstellen
const i18n = createI18n({
  locale: "de", // Standardsprache
  fallbackLocale: "en",
  messages: {
    de,
    en,
  },
});

export default i18n;
