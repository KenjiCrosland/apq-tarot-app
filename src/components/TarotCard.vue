<template>
  <div class="tarot-card" @click="flip" role="button" :aria-pressed="card.faceUp">
    <div :class="['card-inner', { flipped: !card.faceUp }]">
      <!-- FRONT -->
      <div class="card-face front" :style="card.faceUp && card.reversed ? 'transform: rotate(180deg);' : ''">
        {{ card.name }}
      </div>

      <!-- BACK -->
      <div class="card-face back">Card Back</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface TarotCard {
  name: string
  faceUp?: boolean
  reversed?: boolean
  [key: string]: any
}

const props = defineProps<{
  card: TarotCard
}>()

const emit = defineEmits<{
  (e: 'flipped', card: TarotCard): void
}>()

if (props.card.faceUp === undefined) props.card.faceUp = false

function flip() {
  props.card.faceUp = !props.card.faceUp
  if (props.card.faceUp) emit('flipped', props.card)
}
</script>

<style scoped>
:root {
  --card-border: #999;
  --card-front-bg: #f2f2f2;
  --card-front-text: #333;
  --card-back-bg: #333;
  --card-back-text: #fff;
}

.tarot-card {
  width: 90px;
  height: 140px;
  perspective: 1000px;
  cursor: pointer;
  user-select: none;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 6px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.card-face.front {
  background-color: var(--card-front-bg);
  color: var(--card-front-text);
}

.card-face.back {
  background-color: var(--card-back-bg);
  transform: rotateY(180deg);
  color: var(--card-back-text);
}

.card-face.front:hover {
  background-color: #e0e0e0;
}

.card-face.back:hover {
  background-color: #e0e0e0;
}
</style>