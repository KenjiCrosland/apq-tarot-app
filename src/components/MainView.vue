<template>
  <div class="app-root">
    <!-- ── Sidebar ─────────────────────────────────────────────── -->
    <aside class="sidebar">
      <n-button quaternary block @click="shuffleDeck">Shuffle</n-button>

      <n-button quaternary block @click="() => dealSpread(spreads.threeCard)">
        Deal 3-Card Spread
      </n-button>

      <n-button quaternary block @click="() => dealSpread(spreads.celticCross)">
        Deal Celtic Cross
      </n-button>

      <n-button quaternary block @click="resetDeck">Reset Deck</n-button>

      <n-button quaternary block @click="showDebug = !showDebug">
        {{ showDebug ? 'Hide' : 'Show' }} Debug
      </n-button>
    </aside>

    <!-- ── Main area ────────────────────────────────────────────── -->
    <main class="main-pane">
      <!-- Question input -->
      <div class="question-input-grid mb-8">
        <n-input v-model:value="question" placeholder="Ask a question for this reading" size="large" clearable />
      </div>

      <!-- Spread grid -->
      <SpreadGrid class="mb-8" :spread-spec="currentSpreadSpec" :cards="spreadCards" :bp="bp" @flipped="onFlip" />

      <!-- Headline -->
      <div v-if="question" class="headline-grid mb-8">
        <h2 class="question-header">{{ question }}</h2>
      </div>

      <!-- Interpretations -->
      <div v-if="interpretations.length" class="interpretations-grid mb-10">
        <n-card v-for="item in interpretations" :key="item.card.name" size="small" embedded>
          <template #header>{{ item.card.name }}</template>
          <p>{{ item.text }}</p>
        </n-card>
      </div>

      <!-- Debug ---------------------------------------------------- -->
      <template v-if="showDebug">
        <n-divider />
        <pre class="deck-readout mb-4">{{ deckString }}</pre>

        <n-card embedded size="small">
          <template #header>Shuffle Statistics</template>
          <ul class="stats">
            <li>Total cards : {{ statistics.total }}</li>
            <li>Reversed : {{ statistics.reversed }} ({{ statistics.reversalRate }} %)</li>
            <li>Upright : {{ statistics.total - statistics.reversed }}
              ({{ (100 - Number(statistics.reversalRate)).toFixed(1) }} %)</li>
            <li>Runs ≥ 3 : {{ statistics.runCount }}</li>
            <li>Longest reversed run : {{ statistics.longestReversedRun }}</li>
            <li>Longest upright run : {{ statistics.longestUprightRun }}</li>
          </ul>
        </n-card>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
/* ── UI libs & components ─────────────────────────────────────── */
import { NButton, NInput, NCard, NDivider } from 'naive-ui'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SpreadGrid from '@/components/SpreadGrid.vue'
import { spreads } from '@/utils/spreads'

/* ── Deck composable ──────────────────────────────────────────── */
import { useTarotDeck, Card } from '@/composables/useTarotDeck'
const {
  deck, spreadCards, discard,
  init: initDeck,
  shuffleAll: shuffleDeck,
  deal,
  reset: resetDeck,
  deckString,
  statistics,
} = useTarotDeck()

/* ── Local UI state ───────────────────────────────────────────── */
const question = ref('')
const interpretations = ref<{ card: Card; pos: any; text: string }[]>([])
const showDebug = ref(false)

/* breakpoint for SpreadGrid */
type Breakpoint = 'lg' | 'sm'
const bp = ref<Breakpoint>('lg')
function updateBp() { bp.value = window.innerWidth < 600 ? 'sm' : 'lg' }
onMounted(() => { updateBp(); window.addEventListener('resize', updateBp) })
onBeforeUnmount(() => window.removeEventListener('resize', updateBp))

/* currently selected spread spec */
const currentSpreadSpec = ref(spreads.threeCard)

/* ── actions used by UI ───────────────────────────────────────── */
function dealSpread(spec = spreads.threeCard) {
  interpretations.value = []
  currentSpreadSpec.value = spec
  deal(spec.positions)
}

function onFlip(card: Card, pos: any) {
  if (!interpretations.value.some(i => i.card === card)) {
    interpretations.value.push({
      card, pos,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    })
  }
}

/* initialise deck once */
initDeck()
</script>

<style scoped>
/* Layout & neutral tokens */
.app-root {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

.sidebar {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.main-pane {
  padding: 2rem 1rem;
}

.question-input-grid {
  display: grid;
  justify-content: center;
}

.headline-grid {
  display: grid;
  justify-content: center;
}

.interpretations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.question-header {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.deck-readout {
  font-family: monospace;
  white-space: pre-wrap;
}

.stats {
  padding: 0;
  margin: 0;
}

.stats li {
  list-style: none;
  margin: 0 0 .25rem 0;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-10 {
  margin-bottom: 2.5rem;
}

@media (max-width:600px) {
  .app-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    gap: .5rem;
  }

  .main-pane {
    padding: 1rem;
  }
}
</style>
