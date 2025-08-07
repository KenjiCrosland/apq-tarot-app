<template>
  <div class="spread-grid" :style="gridStyle">
    <template v-for="pos in spreadSpec.positions" :key="pos.id">
      <div class="spread-cell" :style="{ gridArea: pos.area }">
        <TarotCard v-if="cards[pos.id]" :card="cards[pos.id]" @flipped="$emit('flipped', cards[pos.id], pos)" />
        <div v-else class="placeholder">{{ pos.label }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import TarotCard from '@/components/TarotCard.vue'

interface SpreadPosition {
  id: string
  area: string
  label: string
}

interface SpreadSpec {
  positions: SpreadPosition[]
  templates: Record<string, string>
  columns: Record<string, string>
  rows: Record<string, string>
}

interface TarotCardType {
  // Define the properties of a Tarot card here as needed
  [key: string]: any
}

const props = defineProps < {
  spreadSpec: SpreadSpec
  cards: Record < string, TarotCardType>
  bp ?: string
}> ()

const emit = defineEmits < {
  (e: 'flipped', card: TarotCardType, pos: SpreadPosition): void
}> ()

const gridStyle = computed(() => {
  const bp = props.spreadSpec.templates[props.bp ?? 'lg'] ? props.bp ?? 'lg' : 'lg'
  return {
    display: 'grid',
    gridTemplateAreas: props.spreadSpec.templates[bp]
      .trim()
      .replace(/\s+/g, ' '),
    gridTemplateColumns: props.spreadSpec.columns[bp],
    gridTemplateRows: props.spreadSpec.rows[bp],
    gap: '2rem',
    justifyContent: 'center',
    alignItems: 'center',
  } as Record<string, string>
})
</script>

<style scoped>
.spread-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 90px;
  min-height: 140px;
}

.placeholder {
  font-size: 0.8rem;
  color: #888;
  text-align: center;
}
</style>
