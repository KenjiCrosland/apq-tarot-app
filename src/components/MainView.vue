<template>
  <div class="app-root">
    <!-- Sidebar -->
    <AppSidebar :show-debug="showDebug" :current-spread-name="currentSpreadSpec.name" @shuffle="shuffleDeck"
      @reset="resetDeck" @deal-spread="dealSpread" @toggle-debug="showDebug = !showDebug" />

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Bar with Question Input -->
      <header class="top-bar">
        <n-input v-model:value="question" placeholder="Ask a question to guide your reading..." size="large" clearable
          class="question-input" />
      </header>

      <!-- Two Column Layout -->
      <div class="content-grid">
        <!-- Left Column: Spread & Controls -->
        <div class="spread-column">
          <!-- Spread Display -->
          <div class="spread-container">
            <SpreadGrid :spread-spec="currentSpreadSpec" :cards="spreadCards" :bp="breakpoint"
              :current-position-index="currentPositionIndex" :show-descriptions="true" />
          </div>

          <!-- Control Buttons -->
          <div v-if="hasActiveSpread" class="controls-container">
            <Transition name="fade" mode="out-in">
              <n-button v-if="canRevealNext" type="primary" size="large" @click="revealNextCard" :loading="isLoadingAI"
                class="reveal-button">
                <template #icon>✨</template>
                Reveal {{ nextPositionLabel }}
              </n-button>

              <div v-else class="completion-actions">
                <n-button type="default" size="large" @click="() => dealSpread(currentSpreadSpec)"
                  class="new-spread-button">
                  New {{ currentSpreadSpec.name }}
                </n-button>
              </div>
            </Transition>

            <!-- Position Info -->
            <div v-if="showPositionInfo" class="position-hint">
              <p>{{ currentPosition.description || defaultPositionDescription }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Interpretation -->
        <div class="interpretation-column">
          <InterpretationDisplay :interpretation="interpretationText" :is-loading="isLoadingAI" :error="aiError"
            :retry-attempt="retryAttempt" :current-card-name="currentCardName" :question="question"
            :revealed-cards="revealedCards" @clear="handleClearReading" />
        </div>
      </div>

      <!-- Debug Panel (Full Width) -->
      <DebugPanel v-if="showDebug" :show="showDebug" :deck-string="deckString" :statistics="statistics"
        :additional-info="debugInfo" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'
import { NButton, NInput } from 'naive-ui'

// Components
import AppSidebar from '@/components/AppSidebar.vue'
import SpreadGrid from '@/components/SpreadGrid.vue'
import InterpretationDisplay from '@/components/InterpretationDisplay.vue'
import DebugPanel from '@/components/DebugPanel.vue'

// Data & Utils
import { spreads } from '@/utils/spreads'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useTarotDeck } from '@/composables/useTarotDeck'
import { useCumulativeInterpretation } from '@/composables/useCumulativeInterpretation'

// Types
import type { SpreadSpec, Card } from '@/types'

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
  interpretationText,
  revealedCards,
  isLoadingAI,
  aiError,
  retryAttempt,
  currentCardName,
  hasInterpretation,
  addCardInterpretation,
  clearInterpretation,
} = useCumulativeInterpretation()

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

const showPositionInfo = computed(() =>
  canRevealNext.value && hasActiveSpread.value && !isLoadingAI
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
  clearInterpretation()
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

  // Add to cumulative interpretation
  await addCardInterpretation({
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

function handleClearReading() {
  clearInterpretation()
  // Optionally reset the spread too
  if (confirm('Clear the interpretation and deal a new spread?')) {
    dealSpread(currentSpreadSpec.value)
  }
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
  background: #fafbfc;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Top Bar */
.top-bar {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question-input {
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  --n-height: 48px;
  --n-font-size: 15px;
  --n-padding-left: 1.25rem;
  --n-padding-right: 1.25rem;
  --n-border-radius: 24px;
}

/* Two Column Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  height: calc(100vh - 100px);
  overflow: hidden;
}

/* Spread Column */
.spread-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  min-height: 0;
  /* Important for flexbox children */
}

.spread-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 0;
  /* Important for flexbox children */
  position: relative;
}

.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.reveal-button,
.new-spread-button {
  min-width: 220px;
  --n-height: 48px;
  --n-font-size: 16px;
  --n-border-radius: 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reveal-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.completion-actions {
  display: flex;
  gap: 1rem;
}

.position-hint {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 400px;
}

/* Interpretation Column */
.interpretation-column {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.interpretation-column :deep(.interpretation-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.interpretation-column :deep(.interpretation-body) {
  flex: 1;
  max-height: none;
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

/* Tablet - Stack layout */
@media (max-width: 1024px) {
  .app-root {
    grid-template-columns: 200px 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    height: auto;
    overflow: auto;
  }

  .spread-column {
    height: auto;
  }

  .spread-container {
    min-height: 400px;
  }

  .interpretation-column {
    height: auto;
  }

  .interpretation-column :deep(.interpretation-body) {
    max-height: 500px;
  }
}

/* Mobile - Full stack */
@media (max-width: 768px) {
  .app-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .main-content {
    height: auto;
  }

  .top-bar {
    padding: 1rem;
  }

  .content-grid {
    padding: 1rem;
    gap: 1rem;
  }

  .spread-container {
    min-height: 350px;
    padding: 1rem;
  }

  .controls-container {
    padding: 1rem;
  }

  .reveal-button,
  .new-spread-button {
    min-width: 180px;
    --n-height: 44px;
    --n-font-size: 15px;
  }

  .interpretation-column :deep(.interpretation-body) {
    max-height: 400px;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .spread-container {
    min-height: 300px;
  }

  .reveal-button,
  .new-spread-button {
    min-width: 160px;
    --n-height: 40px;
    --n-font-size: 14px;
  }
}
</style>