<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import AppShell from "./layouts/AppShell.vue";

const router = useRouter();

// Bei einem echten Reload (F5) oder direktem Öffnen einer Unter-URL
// immer auf die Home-Seite zurückführen. App mountet dabei nur einmal,
// daher greift das nicht auf In-App-Navigation zu /game.
onMounted(() => {
  if (router.currentRoute.value.name !== "Home") {
    router.replace({ name: "Home" });
  }
});
</script>

<template>
  <AppShell />
</template>
