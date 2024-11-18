// src/i18n/i18n.ts
import { createI18n } from "vue-i18n";

// Importiere die JSON-Dateien
import de from "./de.json";
import en from "./en.json";
import spiralingDownDe from "../rules/spiralingdown.de.json";
import spiralingDownEn from "../rules/spiralingdown.en.json";
import spongebobDe from "../rules/spongebob.de.json";
import spongebobEn from "../rules/spongebob.en.json";

/* interface GameField {
  name: string;
  description: string;
  move: number;
  rulerule: string;
}
interface LanguageRules {
  name: string; // Der Name des Spiels
  [key: fieldId${number}]: GameField; // Alle Felder von fieldId0 bis fieldId71
} */

// I18n-Konfiguration erstellen
const i18n = createI18n({
  locale: "de", // Standardsprache
  fallbackLocale: "en",
  messages: {
    de: {
      ...de,
      rules: {
        spiralingDown: spiralingDownDe,
        spongebob: spongebobDe,
      },
    },
    en: {
      ...en,
      rules: {
        spiralingDown: spiralingDownEn,
        spongebob: spongebobEn,
      },
    },
  },
});

export default i18n;
