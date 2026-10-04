// src/rulesets/index.ts
// Zentrale, typisierte Registry für Regelsätze + Zufallsregeln.
//
// Vorher waren Regelsätze UND Regeln als Daten in i18n.messages[locale]
// vergraben und über `i18n.global.messages[locale] as any` konsumiert.
// Jetzt ist diese Quelle der einzige Ort dafür; i18n hält nur UI-Strings.

import type { FieldModel } from "../store/interfaces";
import spiralingDownDe from "./spiralingdown/spiralingdown.de.json";
import spiralingDownEn from "./spiralingdown/spiralingdown.en.json";
import spongebobDe from "./spongebob/spongebob.de.json";
import spongebobEn from "./spongebob/spongebob.en.json";
import rulesDe from "../rules/rules.de.json";
import rulesEn from "../rules/rules.en.json";

export type RulesetName = "spiralingDown" | "spongebob";

export interface Ruleset {
  name: string;
  /** Index = Feld-Id (0 = Startfeld), Länge = Anzahl Felder. */
  fields: FieldModel[];
}

const RULESETS: Record<string, Record<RulesetName, unknown>> = {
  de: {
    spiralingDown: spiralingDownDe,
    spongebob: spongebobDe,
  },
  en: {
    spiralingDown: spiralingDownEn,
    spongebob: spongebobEn,
  },
};

const RULES: Record<string, string[]> = {
  de: rulesDe.rules,
  en: rulesEn.rules,
};

const FALLBACK_LOCALE = "de";

function localeOf(locale: string): string {
  return locale in RULESETS ? locale : FALLBACK_LOCALE;
}

/** Normalisiert das flache `fieldIdN`-JSON in ein sauberes `Ruleset`-Objekt. */
function normalize(locale: string, name: RulesetName): Ruleset {
  const raw = (RULESETS[locale]?.[name] ?? {}) as Record<string, unknown> & { name?: string };

  const fields: FieldModel[] = [];
  for (const key of Object.keys(raw)) {
    if (!key.startsWith("fieldId")) continue;
    const id = Number(key.slice("fieldId".length));
    if (Number.isNaN(id)) continue;
    fields[id] = (raw[key] ?? {}) as FieldModel;
  }

  return { name: raw.name ?? name, fields };
}

/** Stabile Liste der verfügbaren Regelsatz-Namen (Dropdown-Werte). */
export function listRulesets(): RulesetName[] {
  return Object.keys(RULESETS[FALLBACK_LOCALE] ?? {}) as RulesetName[];
}

export function isRulesetName(value: string): value is RulesetName {
  return value in (RULESETS[FALLBACK_LOCALE] ?? {});
}

/** Liefert den typisierten Regelsatz für Sprache + Namen (Fallback: de). */
export function getRuleset(locale: string, name: string): Ruleset {
  const l = localeOf(locale);
  const id = isRulesetName(name) ? name : listRulesets()[0]!;
  return normalize(l, id);
}

/** Liefert die Zufallsregeln (Regel "Random") der aktuellen Sprache. */
export function getRules(locale: string): string[] {
  return RULES[localeOf(locale)] ?? [];
}
