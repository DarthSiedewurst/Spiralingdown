// src/router.ts

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  // Weitere Routen können hier hinzugefügt werden
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
