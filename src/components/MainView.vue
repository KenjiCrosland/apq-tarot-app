<template>
  <div class="app-root">
    <!-- ── Sidebar ─────────────────────────────────────────────── -->
    <aside class="sidebar">
      <n-button quaternary block @click="shuffleDeck">Shuffle</n-button>

      <n-button quaternary block @click="() => dealSpread(spreads.threeCard)">
        Deal 3-Card Spread
      </n-button>


      <n-button quaternary block @click="() => dealSpread(spreads.fiveCard)">
        Deal 5-Card Spread
      </n-button>

      <n-button quaternary block @click="() => dealSpread(spreads.celticCross)">
        Deal Celtic Cross
      </n-button>

      <n-button quaternary block @click="() => dealSpread(spreads.horseshoe)">
        Deal Horseshoe Spread
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
        <n-input v-model:value="question" placeholder="Ask a question" size="large" clearable :style="{
          '--n-height': '60px',
          '--n-font-size': '18px',
          '--n-padding-left': '1rem',
          '--n-padding-right': '1rem',
        }" />
      </div>

      <!-- Spread grid -->
      <SpreadGrid class="mb-8" :spread-spec="currentSpreadSpec" :cards="spreadCards" :bp="bp"
        :current-position-index="currentPositionIndex" :show-descriptions="true" />

      <!-- Control button -->
      <div v-if="spreadCards && Object.keys(spreadCards).length > 0" class="controls-grid mb-8">
        <n-button v-if="currentPositionIndex < currentSpreadSpec.positions.length" type="primary" size="large"
          @click="revealNextCard" :loading="isLoadingAI">
          <template #icon>
            <span>✨</span>
          </template>
          Reveal {{ currentSpreadSpec.positions[currentPositionIndex]?.label || 'Next Card' }}
        </n-button>

        <n-button v-else type="default" size="large" @click="() => dealSpread(currentSpreadSpec)">
          Deal New Spread
        </n-button>
      </div>

      <!-- Headline -->
      <div v-if="question" class="headline-grid mb-8">
        <h2 class="question-header">{{ question }}</h2>
      </div>

      <!-- Current position info -->
      <div
        v-if="currentPositionIndex < currentSpreadSpec.positions.length && spreadCards && Object.keys(spreadCards).length > 0"
        class="position-info mb-8">
        <n-card size="small" embedded>
          <template #header>
            Current Position: {{ currentSpreadSpec.positions[currentPositionIndex].label }}
          </template>
          <p>{{ currentSpreadSpec.positions[currentPositionIndex].description ||
            'Click the button above to reveal this card and receive its interpretation.' }}</p>
        </n-card>
      </div>

      <!-- Interpretations & AI status -->
      <div v-if="interpretations.length || isLoadingAI || aiError" class="interpretations-grid mb-10">
        <n-alert v-if="isLoadingAI" type="info" :bordered="false">
          <template v-if="retryAttempt > 0">
            Retrying interpretation (attempt {{ retryAttempt + 1 }})&nbsp;&hellip;
          </template>
          <template v-else>
            Generating interpretation for {{ currentSpreadSpec.positions[currentPositionIndex - 1]?.label
            }}&nbsp;&hellip;
          </template>
        </n-alert>

        <n-alert v-if="aiError" type="error" :bordered="false">
          {{ aiError }}
        </n-alert>

        <n-card v-for="item in interpretations" :key="item.card.name + item.pos.id" size="small" embedded>
          <template #header>
            <span class="interpretation-header">
              {{ item.pos.label }}: {{ item.card.name }}<span v-if="item.card.reversed"> (reversed)</span>
            </span>
          </template>
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
            <li>
              Upright : {{ statistics.total - statistics.reversed }}
              ({{ (100 - Number(statistics.reversalRate)).toFixed(1) }} %)
            </li>
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
/* ── UI libs ─────────────────────────────────────────────────── */
import { NButton, NInput, NCard, NDivider, NAlert } from 'naive-ui'
import { ref, shallowRef, onMounted, onBeforeUnmount, Ref } from 'vue'
import { debounce } from 'lodash-es'

/* ── Local comps + data ──────────────────────────────────────── */
import SpreadGrid from '@/components/SpreadGrid.vue'
import { spreads } from '@/utils/spreads'

/* ── Prompt: strings-first builder ───────────────────────────── */
import { requestThreeCardInterpretation } from '@/prompts/threeCardSpread'

/* ── Types ───────────────────────────────────────────────────── */
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

interface Interpretation {
  card: Card
  pos: SpreadPosition
  text: string
}

/* ── Deck composable ─────────────────────────────────────────── */
import { useTarotDeck, Card } from '@/composables/useTarotDeck'
const {
  deck,
  spreadCards,
  discard,
  init: initDeck,
  shuffleAll: shuffleDeck,
  deal,
  reset: resetDeck,
  deckString,
  statistics,
  flipCard,
} = useTarotDeck()

/* ── Local UI state ──────────────────────────────────────────── */
const question = ref<string>('')
const interpretations = ref<Interpretation[]>([])
const isLoadingAI = ref<boolean>(false)
const aiError = ref<string | null>(null)
const showDebug = ref<boolean>(false)
const retryAttempt = ref<number>(0)
const currentPositionIndex = ref<number>(0)

/* Optional: single line to guide tone/cadence; swap later with Jennie's. */
const styleSentence = ref<string>(
  'Listen for what is alive right now and choose one small step that honors your values.'
)

/* Breakpoint for SpreadGrid */
type Breakpoint = 'lg' | 'md' | 'sm'
const bp = ref<Breakpoint>('lg')

function updateBp() {
  const width = window.innerWidth
  if (width < 600) bp.value = 'sm'
  else if (width < 1024) bp.value = 'md'
  else bp.value = 'lg'
}

// Debounced version for resize events
const debouncedUpdateBp = debounce(updateBp, 150)

onMounted(() => {
  updateBp()
  window.addEventListener('resize', debouncedUpdateBp)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedUpdateBp)
  debouncedUpdateBp.cancel() // Cancel any pending debounced calls
})

/* Currently selected spread spec */
const currentSpreadSpec = shallowRef<SpreadSpec>(spreads.threeCard)

/* ── Actions used by sidebar buttons ─────────────────────────── */
function dealSpread(spec: SpreadSpec = spreads.threeCard) {
  interpretations.value = []
  aiError.value = null
  currentSpreadSpec.value = spec
  currentPositionIndex.value = 0
  deal(spec.positions)              // dealt face-down; shuffle handled by composable
}

/* ── Reveal next card in sequence ─────────────────────────────── */
async function revealNextCard() {
  if (currentPositionIndex.value >= currentSpreadSpec.value.positions.length) return

  const pos = currentSpreadSpec.value.positions[currentPositionIndex.value]
  const card = spreadCards.value[pos.id]

  if (!card) return

  // Flip the card
  if (flipCard) {
    flipCard(card)
  } else {
    card.faceUp = true
  }

  // Generate interpretation
  await generateInterpretation(card, pos)

  // Move to next position
  currentPositionIndex.value++
}

/* ── Generate interpretation for a card ──────────────────────── */
async function generateInterpretation(card: Card, pos: SpreadPosition): Promise<void> {
  if (interpretations.value.some(i => i.card === card)) return

  const maxRetries = 3
  let attempt = 0
  retryAttempt.value = 0

  while (attempt < maxRetries) {
    try {
      isLoadingAI.value = true
      aiError.value = null

      const text = await requestThreeCardInterpretation({
        question: question.value,
        spreadName: currentSpreadSpec.value.name,
        positions: currentSpreadSpec.value.positions,
        focusPositionId: pos.id,
        draws: Object.entries(spreadCards.value)
          .filter(([_, c]) => (c as Card).faceUp) // Only include face-up cards
          .map(([positionId, c]) => ({
            positionId,
            card: c as Card
          })),
        prior: interpretations.value.map(i => ({
          positionId: i.pos.id,
          text: i.text
        })),
        styleSentence: styleSentence.value,
      })

      interpretations.value.push({ card, pos, text })
      break
    } catch (err: any) {
      attempt++
      retryAttempt.value = attempt

      if (attempt >= maxRetries) {
        aiError.value = `Failed after ${maxRetries} attempts: ${err?.message ?? String(err)}`
      } else {
        // Exponential backoff: 1s, 2s, 3s...
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    } finally {
      if (attempt >= maxRetries || !aiError.value) {
        isLoadingAI.value = false
        retryAttempt.value = 0
      }
    }
  }
}

/* ── initialise deck once (no shuffle if saved) ─────────────── */
initDeck()
</script>

<style scoped>
/* Layout & neutral styling */
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
  background: #f5f7fa;
  border-right: 2px solid #e0e3e8;
  box-shadow: 2px 0 8px rgba(60, 60, 60, 0.04);
  min-height: 100vh;
}

.main-pane {
  padding: 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.question-input-grid {
  display: grid;
  justify-content: center;
}

.controls-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.headline-grid {
  display: grid;
  justify-content: center;
}

.position-info {
  max-width: 600px;
  margin: 0 auto;
}

.interpretations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.interpretation-header {
  font-weight: 600;
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
  margin: 0 0 .25rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-10 {
  margin-bottom: 2.5rem;
}

/* Tablet breakpoint */
@media (max-width: 1024px) and (min-width: 601px) {
  .app-root {
    grid-template-columns: 180px 1fr;
  }

  .sidebar {
    padding: 0.75rem;
  }

  .main-pane {
    padding: 1.5rem;
  }
}

/* Mobile breakpoint */
@media (max-width: 600px) {
  .app-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    gap: .5rem;
    min-height: auto;
  }

  .main-pane {
    padding: 1rem;
  }

  .question-header {
    font-size: 1.25rem;
  }

  .interpretations-grid {
    grid-template-columns: 1fr;
  }
}
</style>