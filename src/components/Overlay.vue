<template>
  <div class="overlay">
    <div class="overlay-content">
      <slot></slot>
      <!-- Hier können weitere Inhalte eingefügt werden -->
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 30vw; /* Breite des Kastens */
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Durchsichtiger Hintergrund */
  color: white;
  padding: 20px;
  z-index: 1; /* Sicherstellen, dass es über anderen Elementen liegt */
  pointer-events: none;
}

.overlay-content {
  overflow-y: auto;
  height: 100%;
}
</style>
