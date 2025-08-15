<template>
  <div class="tarot-card" :style="cardStyle" @click="flip" @keydown.enter="flip" @keydown.space.prevent="flip"
    role="button" :aria-pressed="localFaceUp"
    :aria-label="`${card.name}${card.reversed ? ' reversed' : ''}, click to ${localFaceUp ? 'hide' : 'reveal'}`"
    tabindex="0">
    <div :class="['card-inner', { flipped: !localFaceUp }]">
      <!-- FRONT -->
      <div class="card-face front" :style="localFaceUp && card.reversed ? 'transform: rotate(180deg);' : ''">
        <div class="card-content">
          <span class="card-name" :style="textStyle">{{ card.name }}</span>
          <span v-if="card.reversed" class="reversed-indicator" :style="iconStyle">↻</span>
        </div>
      </div>

      <!-- BACK -->
      <div class="card-face back">
        <div class="card-back-design">
          <span class="back-text" :style="backTextStyle">✦</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, computed } from 'vue'

interface TarotCard {
  name: string
  faceUp?: boolean
  reversed?: boolean
  [key: string]: any
}

interface CardStateChange {
  card: TarotCard
  field: string
  value: any
}

const props = defineProps<{
  card: TarotCard
  scale?: number
}>()

const emit = defineEmits<{
  (e: 'flipped', card: TarotCard): void
  (e: 'card-state-change', change: CardStateChange): void
}>()

// Use local state to avoid directly mutating props
const localFaceUp = ref(props.card.faceUp || false)
const cardScale = computed(() => props.scale || 1)

// Watch for external changes to card.faceUp
watch(() => props.card.faceUp, (newVal) => {
  localFaceUp.value = newVal || false
})

// Computed styles for scaling
const cardStyle = computed(() => ({
  width: `${90 * cardScale.value}px`,
  height: `${140 * cardScale.value}px`,
}))

const textStyle = computed(() => ({
  fontSize: `${0.75 * cardScale.value}rem`,
}))

const iconStyle = computed(() => ({
  fontSize: `${1 * cardScale.value}rem`,
}))

const backTextStyle = computed(() => ({
  fontSize: `${2 * cardScale.value}rem`,
}))

function flip() {
  localFaceUp.value = !localFaceUp.value

  // Emit state change event for parent to handle
  emit('card-state-change', {
    card: props.card,
    field: 'faceUp',
    value: localFaceUp.value
  })

  // Emit flipped event if card is now face up
  if (localFaceUp.value) {
    emit('flipped', props.card)
  }
}
</script>

<style scoped>
:root {
  --card-border: #999;
  --card-front-bg: #f2f2f2;
  --card-front-text: #333;
  --card-back-bg: #333;
  --card-back-text: #fff;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  --card-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  --focus-ring: 2px solid #4a9eff;
}

.tarot-card {
  perspective: 1000px;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: all 0.3s ease;
}

.tarot-card:hover {
  transform: translateY(-2px);
}

.tarot-card:focus {
  outline: var(--focus-ring);
  outline-offset: 2px;
  border-radius: 12px;
}

.tarot-card:focus:not(:focus-visible) {
  outline: none;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding: 8px;
  font-weight: 600;
  box-shadow: var(--card-shadow);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.card-face.front {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  color: var(--card-front-text);
}

.card-face.back {
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  transform: rotateY(180deg);
  color: var(--card-back-text);
}

.tarot-card:hover .card-face {
  box-shadow: var(--card-hover-shadow);
}

.card-face.front:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
  width: 100%;
}

.card-name {
  font-size: 0.75rem;
  line-height: 1.2;
  word-wrap: break-word;
  max-width: 100%;
}

.reversed-indicator {
  font-size: 1rem;
  opacity: 0.7;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.card-back-design {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.back-text {
  font-size: 2rem;
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .tarot-card {
    width: 75px;
    height: 115px;
  }

  .card-name {
    font-size: 0.65rem;
  }

  .reversed-indicator {
    font-size: 0.875rem;
  }

  .back-text {
    font-size: 1.5rem;
  }

  .card-face {
    padding: 6px;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .card-inner {
    transition: transform 0.3s ease;
  }

  .reversed-indicator {
    animation: none;
  }

  .back-text {
    animation: none;
  }

  .tarot-card:hover {
    transform: none;
  }
}
</style>