<template>
  <div class="app-root">
    <!-- Sidebar ---------------------------------------------------------- -->
    <aside class="sidebar">
      <n-button quaternary block @click="shuffleDeck">Shuffle</n-button>
      <n-button quaternary block @click="() => dealSpread(spreads.threeCard)">
        Deal 3-Card Spread
      </n-button>
      <n-button quaternary block @click="resetDeck">Reset Deck</n-button>
      <n-button quaternary block @click="showDebug = !showDebug">
        {{ showDebug ? 'Hide' : 'Show' }} Debug
      </n-button>
    </aside>

    <!-- Main ------------------------------------------------------------- -->
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

      <!-- Debug ---------------------------------------------------------- -->
      <template v-if="showDebug">
        <n-divider />
        <pre class="deck-readout">{{ deckString }}</pre>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
/* Naive UI components */
import { NButton, NInput, NCard, NDivider } from 'naive-ui'

/* Vue utilities */
import { ref, computed, onMounted, onBeforeUnmount, Ref } from 'vue'

/* Local components & data */
import SpreadGrid from '@/components/SpreadGrid.vue'
import { spreads } from '@/utils/spreads'

/* ---------- types ------------------------------------------------------ */
interface Card {
  name: string
  reversed: boolean
  faceUp?: boolean
}
type Breakpoint = 'lg' | 'sm'

/* ---------- reactive state -------------------------------------------- */
const question = ref<string>('')
const interpretations = ref<{ card: Card; pos: any; text: string }[]>([])
const showDebug = ref<boolean>(false)
const bp = ref<Breakpoint>('lg')

const deck: Ref<Card[]> = ref([])
const spreadCards: Ref<Record<string, Card>> = ref({})
const discard: Ref<Card[]> = ref([])

const currentSpreadSpec = ref(spreads.threeCard)

/* ---------- breakpoint handler ---------------------------------------- */
function updateBp(): void {
  bp.value = window.innerWidth < 600 ? 'sm' : 'lg'
}
onMounted(() => {
  updateBp()
  window.addEventListener('resize', updateBp)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateBp))

/* ---------- 78-card list ---------------------------------------------- */
const defaultDeckNames = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
  'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands', 'Five of Wands',
  'Six of Wands', 'Seven of Wands', 'Eight of Wands', 'Nine of Wands', 'Ten of Wands',
  'Page of Wands', 'Knight of Wands', 'Queen of Wands', 'King of Wands',
  'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups', 'Five of Cups',
  'Six of Cups', 'Seven of Cups', 'Eight of Cups', 'Nine of Cups', 'Ten of Cups',
  'Page of Cups', 'Knight of Cups', 'Queen of Cups', 'King of Cups',
  'Ace of Swords', 'Two of Swords', 'Three of Swords', 'Four of Swords', 'Five of Swords',
  'Six of Swords', 'Seven of Swords', 'Eight of Swords', 'Nine of Swords', 'Ten of Swords',
  'Page of Swords', 'Knight of Swords', 'Queen of Swords', 'King of Swords',
  'Ace of Pentacles', 'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles',
  'Five of Pentacles', 'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles',
  'Nine of Pentacles', 'Ten of Pentacles', 'Page of Pentacles', 'Knight of Pentacles',
  'Queen of Pentacles', 'King of Pentacles',
] as const

/* ---------- shuffle helpers ------------------------------------------- */
const options = { sideStickiness: 0.5, cutJitter: 15 }

function riffle(arr: Card[], o = options): void {
  const cut = Math.floor(arr.length / 2 + (Math.random() * o.cutJitter * 2 - o.cutJitter))
  const left = arr.slice(0, cut)
  const right = arr.slice(cut)
  const merged: Card[] = []
  let takeLeft = Math.random() < 0.5
  while (left.length || right.length) {
    if (Math.random() > o.sideStickiness) takeLeft = !takeLeft
    const src = takeLeft ? left : right
    const r = Math.random()
    const packet = r < 0.55 ? 1 : (r < 0.85 ? 2 : 3)
    for (let i = 0; i < packet && src.length; i++) merged.push(src.shift()!)
  }
  arr.splice(0, arr.length, ...merged)
}

function stripShuffle(arr: Card[]): void {
  const strips: Card[][] = []
  const count = 4 + Math.floor(Math.random() * 4)
  const base = Math.floor(arr.length / count)
  const remaining = [...arr]
  for (let i = 0; i < count - 1; i++) {
    const size = Math.max(5, Math.min(base + Math.floor(Math.random() * 10 - 5), remaining.length - 5))
    strips.push(remaining.splice(0, size))
  }
  strips.push(remaining)
  arr.length = 0
  while (strips.length) {
    const idx = Math.floor(Math.random() * strips.length)
    const s = strips.splice(idx, 1)[0]
    if (Math.random() < 0.1) { s.reverse(); s.forEach(c => (c.reversed = !c.reversed)) }
    arr.push(...s)
  }
}

/* ---------- persistence ----------------------------------------------- */
function saveDeck(): void {
  localStorage.setItem('tarotDeck', JSON.stringify({
    deck: deck.value,
    spreadCards: spreadCards.value,
    discard: discard.value,
  }))
}
function loadDeck(): boolean {
  const raw = localStorage.getItem('tarotDeck')
  if (!raw) return false
  try {
    const s = JSON.parse(raw)
    deck.value = s.deck || []
    spreadCards.value = s.spreadCards || {}
    discard.value = s.discard || []
    return true
  } catch { return false }
}

/* ---------- boot ------------------------------------------------------ */
function initDeck(): void {
  const total = deck.value.length + Object.keys(spreadCards.value).length + discard.value.length
  if (loadDeck() && total === 78) return
  deck.value = defaultDeckNames.map((n): Card => ({ name: n, reversed: false }))
  stripShuffle(deck.value)
  for (let i = 0; i < 3; i++) riffle(deck.value)
  saveDeck()
}

/* ---------- actions --------------------------------------------------- */
function shuffleDeck(): void {
  const returning = [...Object.values(spreadCards.value), ...discard.value]
  spreadCards.value = {}
  discard.value = []
  returning.forEach(c => { if (Math.random() < 0.05) c.reversed = !c.reversed })
  deck.value.push(...returning)
  Math.random() < 0.7
    ? [...Array(3)].forEach(() => riffle(deck.value))
    : (riffle(deck.value), stripShuffle(deck.value), riffle(deck.value))
  if (Math.random() < 0.6) {
    const cut = Math.floor(deck.value.length * (0.25 + Math.random() * 0.5))
    deck.value = [...deck.value.slice(cut), ...deck.value.slice(0, cut)]
  }
  saveDeck()
}

function dealSpread(spec = spreads.threeCard): void {
  discard.value.push(...Object.values<Card>(spreadCards.value))
  spreadCards.value = {}
  interpretations.value = []
  currentSpreadSpec.value = spec
  shuffleDeck()
  for (const pos of spec.positions) {
    const card = deck.value.shift()
    if (!card) break
    card.faceUp = false
    spreadCards.value[pos.id] = card
  }
  saveDeck()
}

function resetDeck(): void {
  if (!confirm('Restore deck to original order?')) return
  localStorage.removeItem('tarotDeck')
  deck.value = defaultDeckNames.map((n): Card => ({ name: n, reversed: false }))
  spreadCards.value = {}
  discard.value = []
  interpretations.value = []
  saveDeck()
}

/* ---------- flip / interpret ----------------------------------------- */
function lorem(): string {
  return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent libero.'
}
function onFlip(card: Card, pos: any): void {
  if (!interpretations.value.some(i => i.card === card)) {
    interpretations.value.push({ card, pos, text: lorem() })
  }
}

/* ---------- debug string --------------------------------------------- */
const deckString = computed<string>(() =>
  [...deck.value, ...Object.values(spreadCards.value), ...discard.value]
    .map(c => c.name + (c.reversed ? ' (R)' : ''))
    .join(', ')
)

initDeck()
</script>

<style scoped>
/* neutral layout and text */
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
