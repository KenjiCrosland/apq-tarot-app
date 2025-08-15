<style scoped>
.spread-grid-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: auto;
  padding: 1rem;
}

.spread-grid {
  transition: all 0.3s ease;
}

.spread-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.spread-cell:hover {
  z-index: 10;
}

.card-container {
  width: 100%;
  height: 100%;
  aspect-ratio: 5 / 8;
  /* Tarot card ratio */
  max-width: 100%;
  max-height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background-color: rgba(248, 248, 248, 0.5);
  transition: all 0.3s ease;
  aspect-ratio: 5 / 8;
}

.placeholder:hover {
  border-color: #999;
  background-color: rgba(240, 240, 240, 0.8);
}

.placeholder-label {
  font-size: clamp(0.5rem, 1.5vw, 0.875rem);
  font-weight: 600;
  color: #666;
  text-align: center;
  padding: 0.25rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .spread-grid-wrapper {
    padding: 0.75rem;
  }
}

@media (max-width: 600px) {
  .spread-grid-wrapper {
    padding: 0.5rem;
  }

  .placeholder-label {
    font-size: clamp(0.4rem, 1.2vw, 0.6rem);
  }

  .placeholder {
    border-width: 1px;
    border-radius: 4px;
  }
}
</style><template>
  <div class="spread-grid-wrapper" ref="wrapperEl">
    <div class="spread-grid" :style="gridStyle" ref="gridEl">
      <template v-for="pos in spreadSpec.positions" :key="pos.id">
        <div class="spread-cell" :style="{ gridArea: pos.area }">
          <div class="card-container">
            <TarotCard v-if="cards[pos.id]" :card="cards[pos.id]" @flipped="$emit('flipped', cards[pos.id], pos)"
              @card-state-change="$emit('card-state-change', $event)" />
            <div v-else class="placeholder">
              <span class="placeholder-label">{{ pos.label }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import TarotCard from '@/components/TarotCard.vue'

interface SpreadPosition {
  id: string
  area: string
  label: string
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

interface CardStateChange {
  card: TarotCardType
  field: string
  value: any
}

const props = defineProps<{
  spreadSpec: SpreadSpec
  cards: Record<string, TarotCardType>
  bp?: string
  currentPositionIndex?: number
  showDescriptions?: boolean
}>()

const emit = defineEmits<{
  (e: 'flipped', card: TarotCardType, pos: SpreadPosition): void
  (e: 'card-state-change', change: CardStateChange): void
}>()

// Refs for measuring
const wrapperEl = ref<HTMLElement>()
const gridEl = ref<HTMLElement>()

// Computed styles
const gridStyle = computed(() => {
  const breakpoint = props.bp && props.spreadSpec.templates[props.bp] ? props.bp : 'lg'

  let template = props.spreadSpec.templates[breakpoint] || props.spreadSpec.templates['lg']
  const columns = props.spreadSpec.columns[breakpoint] || props.spreadSpec.columns['lg']
  const rows = props.spreadSpec.rows[breakpoint] || props.spreadSpec.rows['lg']

  // Clean up template string - ensure proper formatting
  if (template.includes('\n')) {
    // Multi-line template, clean it up
    template = template
      .trim()
      .split('\n')
      .map(line => line.trim())
      .join(' ')
  }

  // Responsive gaps
  const gap = props.bp === 'sm' ? '8px' : props.bp === 'md' ? '12px' : '16px'

  return {
    display: 'grid',
    gridTemplateAreas: template,
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gap: gap,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  }
})
</script>

<style scoped>
.spread-grid-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: auto;
  padding: 1rem;
}

.spread-grid {
  transition: all 0.3s ease;
}

.spread-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.spread-cell:hover {
  z-index: 10;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: rgba(248, 248, 248, 0.5);
  transition: all 0.3s ease;
}

.placeholder:hover {
  border-color: #999;
  background-color: rgba(240, 240, 240, 0.8);
}

.placeholder-label {
  font-weight: 600;
  color: #666;
  margin-bottom: 0.25rem;
}

.placeholder-hint {
  font-size: 0.75em;
  color: #999;
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .spread-grid-wrapper {
    padding: 0.75rem;
  }
}

@media (max-width: 600px) {
  .spread-grid-wrapper {
    padding: 0.5rem;
  }
}
</style>