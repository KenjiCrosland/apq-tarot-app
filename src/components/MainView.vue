<template>
  <div class="app-root">
    <!-- Sidebar -->
    <AppSidebar :show-debug="showDebug" :current-spread-name="currentSpreadSpec.name" @shuffle="shuffleDeck"
      @reset="resetDeck" @deal-spread="dealSpread" @toggle-debug="showDebug = !showDebug" />

    <!-- Main Content -->
    <main class="main-pane">
      <!-- Question Input -->
      <section class="question-section">
        <n-input v-model:value="question" placeholder="Ask a question to guide your reading..." size="large" clearable
          class="question-input" />
      </section>

      <!-- Spread Display -->
      <section class="spread-section">
        <SpreadGrid :spread-spec="currentSpreadSpec" :cards="spreadCards" :bp="breakpoint"
          :current-position-index="currentPositionIndex" :show-descriptions="true" />
      </section>

      <!-- Controls -->
      <section v-if="hasActiveSpread" class="controls-section">
        <Transition name="fade" mode="out-in">
          <n-button v-if="canRevealNext" type="primary" size="large" @click="revealNextCard" :loading="isLoadingAI"
            class="reveal-button">
            <template #icon>✨</template>
            Reveal {{ nextPositionLabel }}
          </n-button>

          <n-button v-else type="default" size="large" @click="() => dealSpread(currentSpreadSpec)"
            class="new-spread-button">
            Deal New {{ currentSpreadSpec.name }}
          </n-button>
        </Transition>
      </section>

      <!-- Question Display -->
      <section v-if="question" class="question-display">
        <h2 class="question-header">{{ question }}</h2>
      </section>

      <!-- Current Position Info -->
      <section v-if="showPositionInfo" class="position-info">
        <n-card size="small" embedded>
          <template #header>
            Current Position: {{ currentPosition.label }}
          </template>
          <p>{{ currentPosition.description || defaultPositionDescription }}</p>
        </n-card>
      </section>

      <!-- Interpretations -->
      <InterpretationPanel :interpretations="interpretations" :is-loading="isLoadingAI" :error="aiError"
        :retry-attempt="retryAttempt" :current-position-label="previousPositionLabel" />

      <!-- Debug Panel -->
      <DebugPanel :show="showDebug" :deck-string="deckString" :statistics="statistics" :additional-info="debugInfo" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onBeforeUnmount } from 'vue'
import { NButton, NInput, NCard } from 'naive-ui'
import { debounce } from 'lodash-es'

// Components
import AppSidebar from '@/components/AppSidebar.vue'
import SpreadGrid from '@/components/SpreadGrid.vue'
import InterpretationPanel from '@/components/InterpretationPanel.vue'
import DebugPanel from '@/components/DebugPanel.vue'

// Data & Utils
import { spreads } from '@/utils/spreads'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useTarotDeck } from '@/composables/useTarotDeck'
import { useInterpretations } from '@/composables/useInterpretations'

// Types
import type { SpreadSpec, SpreadPosition, Card, Interpretation } from '@/types'

/* ── Composables ─────────────────────────────────────────────── */
const { breakpoint } = useBreakpoint()
const {
  deck,
  spreadCards,
  deckString,
  statistics,
  init: initDeck,
  shuffleAll: shuffleDeck,
  deal,
  reset: resetDeck,
  flipCard,
} = useTarotDeck()

const {
  interpretations,
  isLoadingAI,
  aiError,
  retryAttempt,
  generateInterpretation,
  clearInterpretations,
} = useInterpretations()

/* ── Core State ──────────────────────────────────────────────── */
const question = ref('')
const showDebug = ref(false)
const currentPositionIndex = ref(0)
const currentSpreadSpec = shallowRef<SpreadSpec>(spreads.threeCard)

/* ── Computed Properties ─────────────────────────────────────── */
const hasActiveSpread = computed(() =>
  spreadCards.value && Object.keys(spreadCards.value).length > 0
)

const canRevealNext = computed(() =>
  currentPositionIndex.value < currentSpreadSpec.value.positions.length
)

const currentPosition = computed(() =>
  currentSpreadSpec.value.positions[currentPositionIndex.value]
)

const nextPositionLabel = computed(() =>
  currentPosition.value?.label || 'Next Card'
)

const previousPositionLabel = computed(() => {
  const prevIndex = currentPositionIndex.value - 1
  return prevIndex >= 0
    ? currentSpreadSpec.value.positions[prevIndex]?.label
    : null
})

const showPositionInfo = computed(() =>
  canRevealNext.value && hasActiveSpread.value
)

const defaultPositionDescription = 'Click the button above to reveal this card and receive its interpretation.'

const debugInfo = computed(() => ({
  spreadName: currentSpreadSpec.value.name,
  cardsDealt: Object.keys(spreadCards.value || {}).length,
  cardsRevealed: Object.values(spreadCards.value || {})
    .filter((card: any) => card.faceUp).length,
}))

/* ── Actions ─────────────────────────────────────────────────── */
function dealSpread(spec: SpreadSpec) {
  clearInterpretations()
  aiError.value = null
  currentSpreadSpec.value = spec
  currentPositionIndex.value = 0
  deal(spec.positions)
}

async function revealNextCard() {
  if (!canRevealNext.value) return

  const pos = currentPosition.value
  const card = spreadCards.value[pos.id]
  if (!card) return

  // Flip the card
  flipCard ? flipCard(card) : (card.faceUp = true)

  // Generate interpretation
  await generateInterpretation({
    card,
    position: pos,
    question: question.value,
    spreadName: currentSpreadSpec.value.name,
    allPositions: currentSpreadSpec.value.positions,
    revealedCards: Object.entries(spreadCards.value)
      .filter(([_, c]) => (c as Card).faceUp)
      .map(([positionId, c]) => ({ positionId, card: c as Card })),
  })

  // Move to next position
  currentPositionIndex.value++
}

/* ── Lifecycle ───────────────────────────────────────────────── */
onMounted(() => {
  initDeck()
})
</script>

<style scoped>
.app-root {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
}

.main-pane {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Sections */
.question-section {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.question-input {
  max-width: 600px;
  width: 100%;
  --n-height: 56px;
  --n-font-size: 16px;
  --n-padding-left: 1.25rem;
  --n-padding-right: 1.25rem;
  --n-border-radius: 12px;
}

.spread-section {
  margin-bottom: 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  min-height: 60px;
}

.reveal-button,
.new-spread-button {
  min-width: 200px;
  --n-height: 48px;
  --n-font-size: 16px;
  --n-border-radius: 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reveal-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.3);
}

.question-display {
  text-align: center;
  margin-bottom: 2rem;
}

.question-header {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
}

.position-info {
  max-width: 600px;
  margin: 0 auto 2rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .app-root {
    grid-template-columns: 200px 1fr;
  }

  .main-pane {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .app-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .main-pane {
    padding: 1rem;
  }

  .question-header {
    font-size: 1.5rem;
  }

  .spread-section {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .question-header {
    font-size: 1.25rem;
  }

  .reveal-button,
  .new-spread-button {
    min-width: 160px;
    --n-height: 44px;
    --n-font-size: 14px;
  }
}
</style>