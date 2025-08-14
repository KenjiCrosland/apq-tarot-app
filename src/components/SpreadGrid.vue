<template>
  <div class="spread-grid" :style="gridStyle">
    <template v-for="(pos, index) in spreadSpec.positions" :key="pos.id">
      <div class="spread-cell" :style="{ gridArea: pos.area }" :class="{
        'next-card': index === currentPositionIndex,
        'revealed': cards[pos.id]?.faceUp,
        'unrevealed': !cards[pos.id]?.faceUp && index < currentPositionIndex
      }">
        <!-- Position label (always visible) -->
        <div class="position-label">
          <span class="position-number">{{ index + 1 }}</span>
          <span class="position-name">{{ pos.label }}</span>
        </div>

        <!-- Card or placeholder -->
        <div class="card-container">
          <TarotCard v-if="cards[pos.id]" :card="cards[pos.id]" :interactive="false"
            :show-glow="index === currentPositionIndex" />
          <div v-else class="placeholder">
            <span class="placeholder-hint">Empty</span>
          </div>
        </div>

        <!-- Position description (if showing descriptions) -->
        <div v-if="showDescriptions && pos.description" class="position-description">
          {{ pos.description }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import TarotCard from '@/components/TarotCard.vue'

interface SpreadPosition {
  id: string
  area: string
  label: string
  description?: string
}

interface SpreadSpec {
  name: string
  positions: SpreadPosition[]
  templates: Record<string, string>
  columns: Record<string, string>
  rows: Record<string, string>
}

interface TarotCardType {
  name: string
  faceUp?: boolean
  reversed?: boolean
  [key: string]: any
}

const props = defineProps<{
  spreadSpec: SpreadSpec
  cards: Record<string, TarotCardType>
  bp?: string
  currentPositionIndex?: number
  showDescriptions?: boolean
}>()

const gridStyle = computed(() => {
  // Use the breakpoint if it exists in templates, otherwise fall back to 'lg'
  const breakpoint = props.bp && props.spreadSpec.templates[props.bp] ? props.bp : 'lg'

  // Fallback to 'lg' if the selected breakpoint doesn't exist
  const template = props.spreadSpec.templates[breakpoint] || props.spreadSpec.templates['lg']
  const columns = props.spreadSpec.columns[breakpoint] || props.spreadSpec.columns['lg']
  const rows = props.spreadSpec.rows[breakpoint] || props.spreadSpec.rows['lg']

  return {
    display: 'grid',
    gridTemplateAreas: template
      .trim()
      .replace(/\s+/g, ' '),
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gap: props.bp === 'sm' ? '1.5rem' : '2.5rem',
    justifyContent: 'center',
    alignItems: 'start',
  } as Record<string, string>
})
</script>

<style scoped>
.spread-grid {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.spread-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  transition: transform 0.3s ease;
}

.spread-cell.next-card {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }
}

.position-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.25rem;
}

.position-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  border: 2px solid #ddd;
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
  transition: all 0.3s ease;
}

.spread-cell.next-card .position-number {
  background: #4a9eff;
  border-color: #4a9eff;
  color: white;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
}

.spread-cell.revealed .position-number {
  background: #52c41a;
  border-color: #52c41a;
  color: white;
}

.position-name {
  color: #333;
}

.card-container {
  position: relative;
  min-width: 90px;
  min-height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 140px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: rgba(248, 248, 248, 0.5);
}

.placeholder-hint {
  font-size: 0.75rem;
  color: #999;
  font-style: italic;
}

.position-description {
  max-width: 150px;
  text-align: center;
  font-size: 0.75rem;
  color: #666;
  line-height: 1.4;
  margin-top: 0.25rem;
  opacity: 0.8;
}

.spread-cell.next-card .position-description {
  opacity: 1;
  font-weight: 500;
  color: #4a9eff;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .spread-grid {
    padding: 1.5rem 0.75rem;
  }

  .position-description {
    max-width: 120px;
    font-size: 0.7rem;
  }
}

@media (max-width: 600px) {
  .spread-grid {
    padding: 1rem 0.5rem;
  }

  .spread-cell {
    gap: 0.5rem;
  }

  .card-container {
    min-width: 75px;
    min-height: 115px;
  }

  .placeholder {
    width: 75px;
    height: 115px;
  }

  .position-label {
    font-size: 0.75rem;
  }

  .position-number {
    width: 20px;
    height: 20px;
    font-size: 0.65rem;
  }

  .position-description {
    max-width: 100px;
    font-size: 0.65rem;
  }
}
</style>