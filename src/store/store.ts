import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import i18n from "../i18n/i18n";
import MusicService from "../services/musicService";
import { PlayerModel } from "./interfaces";

export const useGameStore = defineStore("game", () => {
  const { locale } = useI18n(); // Zugriff auf die aktuelle Sprache
  const currentLocale = ref(locale.value);

  const settings = ref({
    music: false,
    sound: true,
    vibration: false,
  });

  const musicService = new MusicService();

  const players = ref<PlayerModel[]>([
    { name: "Spieler 1", color: "yellow", position: 0 },
    { name: "Spieler 2", color: "green", position: 0 },
    { name: "Spieler 3", color: "orange", position: 0 },
    { name: "Spieler 4", color: "purple", position: 0 },
    { name: "Spieler 5", color: "black", position: 0 },
    { name: "Spieler 6", color: "dafuq", position: 0 },
    { name: "Spieler 7", color: "blue", position: 0 },
    { name: "Spieler 8", color: "aqua", position: 0 },
    { name: "Spieler 9", color: "pink", position: 0 },
    { name: "Spieler 10", color: "brown", position: 0 },
    { name: "Spieler 11", color: "red", position: 0 },
    { name: "Spieler 12", color: "white", position: 0 },
  ]);

  const colors = ref([
    {
      i18nKey: "colors.yellow",
      value: "yellow",
      filter:
        "invert(79%) sepia(9%) saturate(6653%) hue-rotate(20deg) brightness(100%) contrast(103%)",
    },
    {
      i18nKey: "colors.orange",
      value: "orange",
      filter:
        "invert(9%) sepia(80%) saturate(2000%) hue-rotate(349deg) brightness(98%) contrast(118%)",
    },
    {
      i18nKey: "colors.green",
      value: "green",
      filter:
        "invert(0%) sepia(50%) saturate(4000%) hue-rotate(118deg) brightness(80%) contrast(90%)",
    },
    {
      i18nKey: "colors.purple",
      value: "purple",
      filter:
        "invert(0%) sepia(50%) saturate(5000%) hue-rotate(245deg) brightness(50%) contrast(120%)",
    },
    {
      i18nKey: "colors.black",
      value: "black",
      filter:
        "invert(10%) sepia(10%) saturate(100%) hue-rotate(0deg) brightness(10%) contrast(120%)",
    },
    {
      i18nKey: "colors.dafuq",
      value: "dafuq",
      filter:
        "invert(100%) sepia(0%) saturate(300000%) hue-rotate(360deg) brightness(60%) contrast(200%)",
    },
    {
      i18nKey: "colors.blue",
      value: "blue",
      filter:
        "invert(0%) sepia(50%) saturate(5000%) hue-rotate(200deg) brightness(60%) contrast(200%)",
    },
    {
      i18nKey: "colors.aqua",
      value: "aqua",
      filter:
        "invert(10%) sepia(50%) saturate(3000%) hue-rotate(190deg) brightness(110%) contrast(300%)",
    },
    {
      i18nKey: "colors.pink",
      value: "pink",
      filter:
        "invert(0%) sepia(50%) saturate(2000%) hue-rotate(300deg) brightness(120%) contrast(80%)",
    },
    {
      i18nKey: "colors.brown",
      value: "brown",
      filter:
        "invert(14%) sepia(80%) saturate(500%) hue-rotate(0deg) brightness(50%) contrast(120%)",
    },
    {
      i18nKey: "colors.red",
      value: "red",
      filter:
        "invert(10%) sepia(50%) saturate(600%) hue-rotate(303deg) brightness(60%) contrast(200%)",
    },
    {
      i18nKey: "colors.white",
      value: "white",
      filter:
        "invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(200%) contrast(200%)",
    },
  ]);

  const availableRulesets = ref<string[]>(
    Object.keys(
      i18n.global.messages[
        currentLocale.value as keyof typeof i18n.global.messages
      ].rules
    ) // Schlüsselnamen der Regelsets
  );

  const activeRuleset = ref<string>(availableRulesets.value[0] || "");

  const currentRuleset = ref(
    (
      i18n.global.messages[
        currentLocale.value as keyof typeof i18n.global.messages
      ].rules as { [key: string]: any }
    )["spiralingDown"]
  );

  // Funktionen
  function setSettings(newSettings: Partial<typeof settings.value>) {
    settings.value = { ...settings.value, ...newSettings };
  }

  function addPlayer(name: string, color: string) {
    players.value.push({ name, color, position: 0 });
  }

  function removePlayer(index: number) {
    players.value.splice(index, 1);
  }
  function setActiveRules(ruleSetName: string) {
    if (availableRulesets.value.includes(ruleSetName)) {
      activeRuleset.value = ruleSetName;
    } else {
      console.warn(`Regelset "${ruleSetName}" ist nicht verfügbar.`);
    }
  }

  // Überwachung der Sprache (optional, falls weitere Effekte gewünscht)
  watch(locale, () => {
    console.log(`Sprache geändert zu: ${locale.value}`);
    currentLocale.value = locale.value;
  });

  watch([activeRuleset, currentLocale], () => {
    currentRuleset.value = (
      i18n.global.messages[
        currentLocale.value as keyof typeof i18n.global.messages
      ].rules as { [key: string]: any }
    )[activeRuleset.value];
  });

  watch(
    () => settings.value.music,
    (newValue) => {
      if (newValue) {
        musicService.playMusic(); // Musik starten
      } else {
        musicService.stopMusic(); // Musik stoppen
      }
    }
  );

  return {
    players,
    colors,
    currentRuleset,
    availableRulesets,
    activeRuleset,
    settings,
    addPlayer,
    removePlayer,
    setActiveRules,
    setSettings,
  };
});
