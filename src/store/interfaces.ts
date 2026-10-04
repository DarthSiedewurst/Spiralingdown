export type EffectType = "double" | "immune" | "redistribute";

export interface PlayerEffect {
  type: EffectType;
  /** Verbleibende eigene Züge, nach denen das Effekt wieder ausläuft. */
  turnsLeft: number;
}

export interface PlayerModel {
  name: string;
  color: string;
  position: number;
  effect?: PlayerEffect;
}

export interface FieldModel {
  name: string;
  description?: string;
  /** Relative Verschiebung; -99 = Sprung auf zufälliges Feld (RANDOM_MOVE). */
  move?: number;
  /** Regeltext, oder "Random" für eine Zufallsregel. */
  rule?: string;
  /** Spieler wählt einen Mitspieler und tauscht mit ihm die Position. */
  swap?: boolean;
  /** Aktives Effekt dieses Feldes (wird dem Spielender aufgespielt). */
  effect?: EffectType;
  /** Dauer des Effekts in eigenen Zügen (Default 1). */
  effectDuration?: number;
}
