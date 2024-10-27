import { defineStore } from "pinia";
import { ref } from "vue";

export const useGameStore = defineStore("game", () => {
  // State
  const players = ref<{ name: string; color: string }[]>([]);

  // Actions
  const addPlayer = (name: string, color: string) => {
    players.value.push({ name, color });
  };

  const removePlayer = (index: number) => {
    players.value.splice(index, 1);
  };

  // Return state and actions
  return {
    players,
    addPlayer,
    removePlayer,
  };
});
