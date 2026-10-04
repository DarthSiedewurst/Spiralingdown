export interface PlayerModel {
  name: string;
  color: string;
  position: number;
}

export interface FieldModel {
  name: string;
  description?: string;
  /** Relative Verschiebung; -99 = Sprung auf zufälliges Feld (RANDOM_MOVE). */
  move?: number;
  /** Regeltext, oder "Random" für eine Zufallsregel. */
  rule?: string;
}
