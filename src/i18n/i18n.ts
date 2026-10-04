// src/i18n/i18n.ts
// i18n hält NUR UI-Strings (Titel, Buttons, Farbnamen …).
// Regelsätze + Zufallsregeln liegen in der typisierten Registry
// (src/rulesets/index.ts) und werden dort über getRuleset()/getRules() geladen.

import { createI18n } from "vue-i18n";
import de from "./de.json";
import en from "./en.json";

const i18n = createI18n({
  locale: "de", // Standardsprache
  fallbackLocale: "en",
  messages: {
    de,
    en,
  },
});

export default i18n;
