<template>
  <div class="tarot-card" :class="{
    'interactive': interactive,
    'glowing': showGlow,
    'face-up': card.faceUp,
    'reversed': card.reversed && card.faceUp
  }" @click="interactive && flip()" @keydown.enter="interactive && flip()"
    @keydown.space.prevent="interactive && flip()" role="button" :aria-pressed="card.faceUp"
    :aria-label="`${card.name}${card.reversed ? ' reversed' : ''}, ${card.faceUp ? 'face up' : 'face down'}`"
    :tabindex="interactive ? 0 : -1">
    <div :class="['card-inner', { flipped: !card.faceUp }]">
      <!-- FRONT -->
      <div class="card-face front" :style="card.faceUp && card.reversed ? 'transform: rotate(180deg);' : ''">
        <div class="card-content">
          <span class="card-name">{{ card.name }}</span>
          <span v-if="card.reversed" class="reversed-indicator">↻</span>
        </div>
      </div>

      <!-- BACK -->
      <div class="card-face back">
        <div class="card-back-design">
          <span class="back-text">✦</span>
        </div>
      </div>
    </div>

    <!-- Glow effect overlay -->
    <div v-if="showGlow" class="glow-overlay"></div>
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

const props = withDefaults(defineProps<{
  card: TarotCard
  interactive?: boolean
  showGlow?: boolean
}>(), {
  interactive: true,
  showGlow: false
})

const emit = defineEmits<{
  (e: 'flipped', card: TarotCard): void
}>()

function flip() {
  if (!props.interactive) return
  emit('flipped', props.card)
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
  --glow-color: #4a9eff;
}

.tarot-card {
  width: 90px;
  height: 140px;
  perspective: 1000px;
  user-select: none;
  position: relative;
  transition: transform 0.2s ease;
}

.tarot-card.interactive {
  cursor: pointer;
}

.tarot-card.interactive:hover {
  transform: translateY(-2px);
}

.tarot-card.interactive:focus {
  outline: var(--focus-ring);
  outline-offset: 2px;
  border-radius: 12px;
}

.tarot-card.interactive:focus:not(:focus-visible) {
  outline: none;
}

.tarot-card.glowing {
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {

  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(74, 158, 255, 0.5));
  }

  50% {
    filter: drop-shadow(0 0 20px rgba(74, 158, 255, 0.8));
  }
}

.glow-overlay {
  position: absolute;
  inset: -8px;
  border-radius: 16px;
  background: radial-gradient(ellipse at center,
      rgba(74, 158, 255, 0.3) 0%,
      rgba(74, 158, 255, 0.1) 40%,
      transparent 70%);
  pointer-events: none;
  animation: glow-rotate 3s linear infinite;
}

@keyframes glow-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
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

.tarot-card.interactive:hover .card-face {
  box-shadow: var(--card-hover-shadow);
}

.tarot-card.face-up .card-face.front {
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
</style>