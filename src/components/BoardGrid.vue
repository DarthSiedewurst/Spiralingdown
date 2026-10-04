<template>
  <table class="game-board" @click="emit('roll')">
    <tbody>
      <tr v-for="(row, rowIndex) in BOARD_MATRIX" :key="'row-' + rowIndex">
        <td
          v-for="fieldId in row"
          :key="'col-' + fieldId"
          class="field"
          :class="{
            active: activePosition === fieldId,
            'border-left': BOARD_BORDER_LEFT.has(fieldId),
            'border-right': BOARD_BORDER_RIGHT.has(fieldId),
            'border-bottom': BOARD_BORDER_BOTTOM.has(fieldId),
          }"
        >
          <div class="field-number">{{ fieldId }}</div>
          <div class="field-name">{{ getFieldData(fieldId).name }}</div>
        </td>
      </tr>
    </tbody>
    <!-- Spieler: bleiben Kind des Tables wie bisher (absolute Pos. ueberViewport). -->
    <slot />
  </table>
</template>

<script setup lang="ts">
import {
  BOARD_MATRIX,
  BOARD_BORDER_LEFT,
  BOARD_BORDER_RIGHT,
  BOARD_BORDER_BOTTOM,
} from "../board/boardGeometry";

defineProps<{
  getFieldData: (fieldId: number) => { name?: string };
  activePosition: number;
}>();

const emit = defineEmits<{ (e: "roll"): void }>();
</script>

<style scoped lang="scss">
@use "../styles/tokens" as t;

.game-board {
  width: 100vw;
  height: 100vh;
  border-collapse: collapse;
}

.field {
  color: t.$color-ink-soft;
  text-align: left;
  font-size: t.$font-tile;
  font-weight: bold;
  height: 12.5%;
  width: 11%;
  position: relative;
  background-image: t.$board-bg;
  background-size: 100% 120%;
  background-position: center;
  padding-left: t.$gap-board;
}

.field-number {
  position: absolute;
  top: t.$gap-board;
  left: t.$gap-board;
  font-weight: bold;
}

.field.active {
  background-color: t.$color-primary-soft;
}
.border-left {
  border-left: t.$gap-board solid t.$color-line-strong !important;
}
.border-right {
  border-right: t.$gap-board solid t.$color-line-strong !important;
}
.border-bottom {
  border-bottom: t.$gap-board solid t.$color-line-strong !important;
}
</style>
