// src/router.ts

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Game from "../views/Game.vue"; // Importiere die Game-Komponente

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/game",
    name: "Game",
    component: Game, // Füge die Route für Game.vue hinzu
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
