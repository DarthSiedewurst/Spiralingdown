// src/i18n/i18n.ts
import { createI18n } from "vue-i18n";

// Importiere die JSON-Dateien
import de from "./de.json";
import en from "./en.json";
import spiralingDownDe from "../rulesets/spiralingdown/spiralingdown.de.json";
import spiralingDownEn from "../rulesets/spiralingdown/spiralingdown.en.json";
import spongebobDe from "../rulesets/spongebob/spongebob.de.json";
import spongebobEn from "../rulesets/spongebob/spongebob.en.json";
import rulesDe from "../rules/rules.de.json";
import rulesEn from "../rules/rules.en.json";

// I18n-Konfiguration erstellen
const i18n = createI18n({
  locale: "de", // Standardsprache
  fallbackLocale: "en",
  messages: {
    de: {
      ...de,
      rulesets: {
        spiralingDown: spiralingDownDe,
        spongebob: spongebobDe,
      },
      rules: rulesDe.rules,
    },
    en: {
      ...en,
      rulesets: {
        spiralingDown: spiralingDownEn,
        spongebob: spongebobEn,
      },
      rules: rulesEn.rules,
    },
  },
});

export default i18n;
