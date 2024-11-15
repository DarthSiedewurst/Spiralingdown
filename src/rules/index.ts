// Importiere die JSON-Dateien
import spiralingdown from "./spiralingdown.json";
import spongebob from "./spongebob.json";

// Definiere ein Interface für die Felder der Spielregeln
interface GameField {
  name: string;
  description: string;
  move: number;
  rulerule: string;
}

// Definiere die Struktur der Regeln für jede Sprache
interface LanguageRules {
  name: string; // Der Name des Spiels
  [key: `fieldId${number}`]: GameField; // Alle Felder von fieldId0 bis fieldId71
}

// Definiere das übergeordnete Interface für alle unterstützten Sprachen
export interface GameRules {
  en: LanguageRules; // Englisch
  de: LanguageRules; // Deutsch
  // Weitere Sprachen können hier hinzugefügt werden
}

// Exportiere die einzelnen Regelsets mit Typen
const SpiralingDown: GameRules = spiralingdown;
const Spongebob: GameRules = spongebob;

// Exportiere ein Objekt mit allen Regelsets
export default {
  SpiralingDown,
  Spongebob,
};
