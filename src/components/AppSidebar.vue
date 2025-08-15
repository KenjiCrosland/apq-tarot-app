<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3 class="sidebar-title">Deck Actions</h3>
      <n-button quaternary block @click="$emit('shuffle')">
        <span class="button-icon">🔀</span> Shuffle
      </n-button>
      <n-button quaternary block @click="$emit('reset')">
        <span class="button-icon">↺</span> Reset Deck
      </n-button>
    </div>

    <n-divider />

    <div class="sidebar-section">
      <h3 class="sidebar-title">Choose Spread</h3>

      <n-button v-for="spread in availableSpreads" :key="spread.key" quaternary block
        @click="$emit('deal-spread', spread.spec)"
        :type="currentSpreadName === spread.spec.name ? 'primary' : 'default'">
        <span class="button-icon">{{ spread.icon }}</span> {{ spread.label }}
      </n-button>
    </div>

    <n-divider />

    <div class="sidebar-section">
      <n-button quaternary block @click="$emit('toggle-debug')">
        <span class="button-icon">🛠</span> {{ showDebug ? 'Hide' : 'Show' }} Debug
      </n-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { NButton, NDivider } from 'naive-ui'
import { computed } from 'vue'
import { spreads } from '@/utils/spreads'

interface SpreadSpec {
  name: string
  positions: any[]
  templates: Record<string, string>
  columns: Record<string, string>
  rows: Record<string, string>
}

interface Props {
  showDebug: boolean
  currentSpreadName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'shuffle'): void
  (e: 'reset'): void
  (e: 'deal-spread', spec: SpreadSpec): void
  (e: 'toggle-debug'): void
}>()

const availableSpreads = computed(() => [
  { key: 'single', spec: spreads.singleCard, icon: '🃏', label: 'Single Card' },
  { key: 'three', spec: spreads.threeCard, icon: '3️⃣', label: 'Three-Card' },
  { key: 'five', spec: spreads.fiveCard, icon: '5️⃣', label: 'Five-Card' },
  { key: 'horseshoe', spec: spreads.horseshoe, icon: '🧲', label: 'Horseshoe' },
  { key: 'relationship', spec: spreads.relationship, icon: '💞', label: 'Relationship' },
  { key: 'celtic', spec: spreads.celticCross, icon: '✚', label: 'Celtic Cross' },
])
</script>

<style scoped>
.sidebar {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f5f7fa;
  border-right: 2px solid #e0e3e8;
  box-shadow: 2px 0 8px rgba(60, 60, 60, 0.04);
  min-height: 100vh;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.button-icon {
  margin-right: 0.25rem;
  font-size: 1.1em;
}

/* Tablet breakpoint */
@media (max-width: 1024px) and (min-width: 601px) {
  .sidebar {
    padding: 0.75rem;
  }
}

/* Mobile breakpoint */
@media (max-width: 600px) {
  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    gap: .5rem;
    min-height: auto;
  }

  .sidebar-section {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .sidebar-title {
    width: 100%;
    font-size: 0.75rem;
  }
}
</style>