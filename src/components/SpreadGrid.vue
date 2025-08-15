<template>
  <div class="spread-grid-wrapper" ref="wrapperEl">
    <div class="spread-grid" :style="gridStyle" ref="gridEl">
      <template v-for="pos in spreadSpec.positions" :key="pos.id">
        <div class="spread-cell" :style="{ gridArea: pos.area }">
          <TarotCard v-if="cards[pos.id]" :card="cards[pos.id]" :scale="cardScale"
            @flipped="$emit('flipped', cards[pos.id], pos)" @card-state-change="$emit('card-state-change', $event)" />
          <div v-else class="placeholder" :style="placeholderStyle">
            <span class="placeholder-label">{{ pos.label }}</span>
            <span class="placeholder-hint">Empty position</span>
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
const cardScale = ref(1)

// Base card dimensions
const BASE_CARD_WIDTH = 90
const BASE_CARD_HEIGHT = 140
const MIN_SCALE = 0.5
const MAX_SCALE = 1.2

// Calculate optimal scale
function calculateScale() {
  if (!wrapperEl.value || !gridEl.value) return

  const wrapper = wrapperEl.value
  const availableWidth = wrapper.clientWidth
  const availableHeight = wrapper.clientHeight

  // Get the breakpoint-specific grid dimensions
  const breakpoint = props.bp && props.spreadSpec.templates[props.bp] ? props.bp : 'lg'
  const template = props.spreadSpec.templates[breakpoint] || props.spreadSpec.templates['lg']

  // Count actual card positions (non-dot cells) in the template
  const templateCells = template.split(/\s+/).filter(cell => cell && cell !== '.')
  const uniqueAreas = new Set(templateCells)
  const cardCount = uniqueAreas.size

  // Parse template to get actual grid bounds
  const templateLines = template.trim().split('\n').map(line => line.trim())
  const gridRows = templateLines.length
  const gridCols = Math.max(...templateLines.map(line =>
    line.replace(/"/g, '').trim().split(/\s+/).length
  ))

  // Calculate base grid size
  const gapSize = props.bp === 'sm' ? 20 : props.bp === 'md' ? 30 : 40
  const baseGridWidth = (BASE_CARD_WIDTH * gridCols) + (gapSize * (gridCols - 1))
  const baseGridHeight = (BASE_CARD_HEIGHT * gridRows) + (gapSize * (gridRows - 1))

  // Add padding for the wrapper
  const padding = props.bp === 'sm' ? 20 : 40
  const maxWidth = availableWidth - padding
  const maxHeight = availableHeight - padding

  // Calculate scale needed to fit
  const scaleX = maxWidth / baseGridWidth
  const scaleY = maxHeight / baseGridHeight
  const optimalScale = Math.min(scaleX, scaleY, MAX_SCALE)

  // Apply scale within bounds
  cardScale.value = Math.max(MIN_SCALE, Math.min(optimalScale, MAX_SCALE))
}

// Debounced resize handler
let resizeTimeout: NodeJS.Timeout
function handleResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    calculateScale()
  }, 100)
}

// Watch for spread changes
watch(() => props.spreadSpec, async () => {
  await nextTick()
  calculateScale()
})

watch(() => props.bp, () => {
  calculateScale()
})

onMounted(() => {
  calculateScale()
  window.addEventListener('resize', handleResize)

  // Initial calculation after a short delay to ensure proper rendering
  setTimeout(calculateScale, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(resizeTimeout)
})

// Computed styles
const gridStyle = computed(() => {
  const breakpoint = props.bp && props.spreadSpec.templates[props.bp] ? props.bp : 'lg'

  const template = props.spreadSpec.templates[breakpoint] || props.spreadSpec.templates['lg']
  const columns = props.spreadSpec.columns[breakpoint] || props.spreadSpec.columns['lg']
  const rows = props.spreadSpec.rows[breakpoint] || props.spreadSpec.rows['lg']

  // Validate template and columns match
  const templateLines = template.trim().split('\n').map(line => line.trim())
  const maxTemplateCols = Math.max(...templateLines.map(line =>
    line.replace(/"/g, '').trim().split(/\s+/).length
  ))
  const definedCols = columns.split(' ').length

  // If mismatch, log warning and adjust
  if (maxTemplateCols !== definedCols) {
    console.warn(`Column mismatch in ${props.spreadSpec.name} ${breakpoint}: template has ${maxTemplateCols} but columns define ${definedCols}`)
  }

  // Scale-adjusted gaps
  let baseGap = props.bp === 'sm' ? 20 : props.bp === 'md' ? 30 : 40
  const scaledGap = Math.max(10, baseGap * cardScale.value)

  // Parse and scale column/row sizes
  const scaledColumns = columns.split(' ').map(col => {
    if (col.includes('px')) {
      const value = parseInt(col)
      return `${value * cardScale.value}px`
    }
    return col
  }).join(' ')

  const scaledRows = rows.split(' ').map(row => {
    if (row.includes('px')) {
      const value = parseInt(row)
      return `${value * cardScale.value}px`
    }
    return row
  }).join(' ')

  return {
    display: 'grid',
    gridTemplateAreas: template.trim().replace(/\s+/g, ' '),
    gridTemplateColumns: scaledColumns,
    gridTemplateRows: scaledRows,
    gap: `${scaledGap}px`,
    justifyContent: 'center',
    alignItems: 'center',
    transform: `scale(${1})`, // We scale individual elements, not the whole grid
    transformOrigin: 'center center',
  }
})

const placeholderStyle = computed(() => ({
  width: `${BASE_CARD_WIDTH * cardScale.value}px`,
  height: `${BASE_CARD_HEIGHT * cardScale.value}px`,
  fontSize: `${0.875 * cardScale.value}rem`,
}))
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