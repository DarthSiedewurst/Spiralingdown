// Zentrales Spielfeld-Layout (Single Source of Truth).
// War bisher kopiert in Game.vue, Player.vue und Overlay.vue.
// 8x9-Spirale, außen 0 -> innen 71 ("SIEG").

export interface BoardCoord {
  row: number;
  col: number;
}

export const BOARD_MATRIX: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [29, 30, 31, 32, 33, 34, 35, 36, 9],
  [28, 51, 52, 53, 54, 55, 56, 37, 10],
  [27, 50, 65, 66, 67, 68, 57, 38, 11],
  [26, 49, 64, 71, 70, 69, 58, 39, 12],
  [25, 48, 63, 62, 61, 60, 59, 40, 13],
  [24, 47, 46, 45, 44, 43, 42, 41, 14],
  [23, 22, 21, 20, 19, 18, 17, 16, 15],
];

export const BOARD_ROWS = BOARD_MATRIX.length;
export const BOARD_COLS = BOARD_MATRIX[0].length;

// Optische "Mauer" der Spiral-Abzweige (CSS-Grenzen).
export const BOARD_BORDER_LEFT = new Set([47, 48, 49, 50, 51, 63, 64, 65, 71]);
export const BOARD_BORDER_RIGHT = new Set([36, 37, 38, 39, 40, 41, 56, 57, 58, 59, 68, 69]);
export const BOARD_BORDER_BOTTOM = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 41, 42, 43, 44, 45, 46, 47, 30, 31, 32, 33, 34, 35, 59, 60, 61, 62, 63,
  52, 53, 54, 55, 69, 70, 71, 66, 67,
]);

// (row, col) eines Feldes — O(1) über Lookups statt indexOf-Suche.
const COORDS = new Map<number, BoardCoord>();
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    COORDS.set(BOARD_MATRIX[r][c], { row: r, col: c });
  }
}

export function coordinatesOf(fieldId: number): BoardCoord {
  return COORDS.get(fieldId) ?? { row: 0, col: 0 };
}

// Liest die aktuelle (bzw. erste) Spalte für linke/rechte Overlay-Seite.
export function overlaySide(fieldId: number): "left" | "right" {
  const { col } = coordinatesOf(fieldId);
  return col >= BOARD_COLS / 2 ? "left" : "right";
}
