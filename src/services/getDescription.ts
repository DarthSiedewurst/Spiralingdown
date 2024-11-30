// src/helpers/descriptionHelper.ts

export function processDescription(
  description: string,
  steps: number,
  playerName: string
): string {
  description = replacePlayerName(description, playerName);
  if (description.includes("{switch}")) {
    return getSwitchDescription(description, steps);
  }
  return description;
}

function getSwitchDescription(description: string, steps: number): string {
  const segments = description
    .split("{switch}")
    .map((segment) => segment.trim());

  const segmentIndex = Math.min(
    Math.floor((steps - 1) / (6 / segments.length)),
    segments.length - 1
  );

  return segments[segmentIndex];
}

export function replacePlayerName(input: string, playerName: string) {
  return input.replace(/\{PlayerName\}/g, playerName);
}
