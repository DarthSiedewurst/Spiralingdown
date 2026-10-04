import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { useGameStore } from "../store";
import type { PlayerModel } from "../interfaces";

type GameStore = ReturnType<typeof useGameStore>;

const I18N_MESSAGES = {
  de: { effects: { double: "", immune: "", redistribute: "" } },
  en: { effects: { double: "", immune: "", redistribute: "" } },
};

let store: GameStore;
let app: ReturnType<typeof createApp> | null;

function bootstrap() {
  const pinia = createPinia();
  const i18n = createI18n({
    legacy: false,
    locale: "de",
    fallbackLocale: "de",
    messages: I18N_MESSAGES,
  });
  const el = document.createElement("div");
  document.body.appendChild(el);
  const Host = defineComponent({
    setup: () => {
      store = useGameStore();
      return () => h("div");
    },
  });
  app = createApp(Host).use(pinia).use(i18n);
  app.mount(el);
}

function teardown() {
  app?.unmount();
  app = null;
}

beforeEach(bootstrap);
afterEach(teardown);

function twoPlayers(st: GameStore) {
  st.addPlayer("Anna", "yellow");
  st.addPlayer("Ben", "blue");
  st.players[0].position = 3;
  st.players[1].position = 10;
}

const playerOf = (st: GameStore, name: string) =>
  st.players.find((p) => p.name === name) as PlayerModel;

describe("applyEffect / tickEffect", () => {
  it("legt einen 1-Zug-Effekt auf und löst ihn nach einem Tick auf", () => {
    twoPlayers(store);
    store.applyEffect("Anna", "double", 1);
    expect(playerOf(store, "Anna").effect).toEqual({ type: "double", turnsLeft: 1 });
    expect(store.tickEffect("Anna")).toBe(false);
    expect(playerOf(store, "Anna").effect).toBeUndefined();
  });

  it("lässt ein mehr-Zug-Effekt über Runden laufen (Rückgabe=aktiver Status)", () => {
    twoPlayers(store);
    store.applyEffect("Ben", "redistribute", 3);
    expect(store.tickEffect("Ben")).toBe(true);
    expect(playerOf(store, "Ben").effect?.turnsLeft).toBe(2);
    expect(store.tickEffect("Ben")).toBe(true);
    expect(playerOf(store, "Ben").effect?.turnsLeft).toBe(1);
    expect(store.tickEffect("Ben")).toBe(false);
    expect(playerOf(store, "Ben").effect).toBeUndefined();
  });

  it("berührt andere Spieler nicht, wenn sie keinen Effekt haben", () => {
    twoPlayers(store);
    expect(store.tickEffect("Anna")).toBe(false);
    expect(store.tickEffect("Ben")).toBe(false);
    expect(playerOf(store, "Anna").effect).toBeUndefined();
  });
});

describe("swapPositions", () => {
  it("tauscht die Positionen zweier Spieler", () => {
    twoPlayers(store);
    store.swapPositions(0, 1);
    expect(playerOf(store, "Anna").position).toBe(10);
    expect(playerOf(store, "Ben").position).toBe(3);
  });

  it("ist ein no-op bei gleichem Index", () => {
    twoPlayers(store);
    store.swapPositions(0, 0);
    expect(playerOf(store, "Anna").position).toBe(3);
    expect(playerOf(store, "Ben").position).toBe(10);
  });
});

describe("restartRound", () => {
  it("setzt Position UND Effekt zurück", () => {
    twoPlayers(store);
    store.applyEffect("Anna", "immune", 2);
    store.restartRound();
    expect(playerOf(store, "Anna").position).toBe(0);
    expect(playerOf(store, "Anna").effect).toBeUndefined();
    expect(store.winner).toBeNull();
    expect(store.phase).toBe("playing");
  });
});
