<template>
  <div v-if="showPanel" class="interpretations-panel">
    <!-- Loading state -->
    <n-alert v-if="isLoading" type="info" :bordered="false">
      <template v-if="retryAttempt > 0">
        Retrying interpretation (attempt {{ retryAttempt + 1 }})&nbsp;&hellip;
      </template>
      <template v-else-if="currentPositionLabel">
        Generating interpretation for {{ currentPositionLabel }}&nbsp;&hellip;
      </template>
      <template v-else>
        Generating interpretation&nbsp;&hellip;
      </template>
    </n-alert>

    <!-- Error state -->
    <n-alert v-if="error" type="error" :bordered="false">
      {{ error }}
    </n-alert>

    <!-- Interpretations -->
    <TransitionGroup name="interpretation" tag="div" class="interpretations-grid">
      <n-card v-for="item in interpretations" :key="`${item.card.name}-${item.pos.id}`" size="small" embedded
        class="interpretation-card">
        <template #header>
          <span class="interpretation-header">
            <span class="position-label">{{ item.pos.label }}</span>
            <span class="card-name">
              {{ item.card.name }}<span v-if="item.card.reversed" class="reversed-indicator">(Reversed)</span>
            </span>
          </span>
        </template>
        <p class="interpretation-text">{{ item.text }}</p>
      </n-card>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { NCard, NAlert } from 'naive-ui'
import { computed } from 'vue'

interface Card {
  name: string
  reversed?: boolean
  [key: string]: any
}

interface Position {
  id: string
  label: string
  [key: string]: any
}

interface Interpretation {
  card: Card
  pos: Position
  text: string
}

interface Props {
  interpretations: Interpretation[]
  isLoading: boolean
  error: string | null
  retryAttempt?: number
  currentPositionLabel?: string
}

const props = defineProps<Props>()

const showPanel = computed(() =>
  props.interpretations.length > 0 ||
  props.isLoading ||
  props.error
)
</script>

<style scoped>
.interpretations-panel {
  margin-bottom: 2.5rem;
}

.interpretations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.interpretation-card {
  transition: all 0.3s ease;
}

.interpretation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.interpretation-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.position-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-name {
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
}

.reversed-indicator {
  margin-left: 0.5rem;
  font-weight: 400;
  font-size: 0.875rem;
  color: #999;
}

.interpretation-text {
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* Animation for new interpretations */
.interpretation-enter-active {
  transition: all 0.5s ease;
}

.interpretation-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.interpretation-leave-active {
  transition: all 0.3s ease;
}

.interpretation-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .interpretations-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-name {
    font-size: 1rem;
  }
}
</style>