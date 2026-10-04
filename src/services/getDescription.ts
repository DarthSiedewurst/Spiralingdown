// src/helpers/descriptionHelper.ts

export function processDescription(
  description: string | undefined,
  steps: number,
  playerName: string,
): string {
  if (!description) return "";
  const resolved = replacePlayerName(description, playerName);
  if (resolved.includes("{switch}")) {
    return getSwitchDescription(resolved, steps);
  }
  return resolved;
}

function getSwitchDescription(description: string, steps: number): string {
  const segments = description.split("{switch}").map((segment) => segment.trim());

  const segmentIndex = Math.min(
    Math.floor((steps - 1) / (6 / segments.length)),
    segments.length - 1,
  );

  return segments[segmentIndex];
}

export function replacePlayerName(input: string, playerName: string) {
  return (input ?? "").replace(/\{PlayerName\}/g, playerName);
}
