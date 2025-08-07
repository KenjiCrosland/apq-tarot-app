import { ref, computed, Ref } from 'vue';

/* ---------- types ---------- */
export interface Card {
  name: string;
  reversed: boolean;
  faceUp?: boolean;
}
export interface SpreadPosition {
  id: string;
}

/* ---------- singletons (module-scope) ---------- */
const deck: Ref<Card[]> = ref([]);
const spreadCards: Ref<Record<string, Card>> = ref({});
const discard: Ref<Card[]> = ref([]);

/* ---------- constants ---------- */
const defaultNames = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
  'Ace of Wands',
  'Two of Wands',
  'Three of Wands',
  'Four of Wands',
  'Five of Wands',
  'Six of Wands',
  'Seven of Wands',
  'Eight of Wands',
  'Nine of Wands',
  'Ten of Wands',
  'Page of Wands',
  'Knight of Wands',
  'Queen of Wands',
  'King of Wands',
  'Ace of Cups',
  'Two of Cups',
  'Three of Cups',
  'Four of Cups',
  'Five of Cups',
  'Six of Cups',
  'Seven of Cups',
  'Eight of Cups',
  'Nine of Cups',
  'Ten of Cups',
  'Page of Cups',
  'Knight of Cups',
  'Queen of Cups',
  'King of Cups',
  'Ace of Swords',
  'Two of Swords',
  'Three of Swords',
  'Four of Swords',
  'Five of Swords',
  'Six of Swords',
  'Seven of Swords',
  'Eight of Swords',
  'Nine of Swords',
  'Ten of Swords',
  'Page of Swords',
  'Knight of Swords',
  'Queen of Swords',
  'King of Swords',
  'Ace of Pentacles',
  'Two of Pentacles',
  'Three of Pentacles',
  'Four of Pentacles',
  'Five of Pentacles',
  'Six of Pentacles',
  'Seven of Pentacles',
  'Eight of Pentacles',
  'Nine of Pentacles',
  'Ten of Pentacles',
  'Page of Pentacles',
  'Knight of Pentacles',
  'Queen of Pentacles',
  'King of Pentacles',
] as const;

const shuffleOpts = { sideStickiness: 0.5, cutJitter: 15 };

/* ---------- shuffle helpers ---------- */
function riffle(arr: Card[], o = shuffleOpts) {
  const cut = Math.floor(
    arr.length / 2 + (Math.random() * o.cutJitter * 2 - o.cutJitter),
  );
  const L = arr.slice(0, cut),
    R = arr.slice(cut),
    merged: Card[] = [];
  let takeL = Math.random() < 0.5;
  while (L.length || R.length) {
    if (Math.random() > o.sideStickiness) takeL = !takeL;
    const src = takeL ? L : R;
    const r = Math.random(),
      n = r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
    for (let i = 0; i < n && src.length; i++) merged.push(src.shift()!);
  }
  arr.splice(0, arr.length, ...merged);
}

function stripShuffle(arr: Card[]) {
  const strips: Card[][] = [];
  const count = 4 + Math.floor(Math.random() * 4);
  const base = Math.floor(arr.length / count);
  const rem = [...arr];
  for (let i = 0; i < count - 1; i++) {
    const size = Math.max(
      5,
      Math.min(base + Math.floor(Math.random() * 10 - 5), rem.length - 5),
    );
    strips.push(rem.splice(0, size));
  }
  strips.push(rem);
  arr.length = 0;
  while (strips.length) {
    const idx = Math.floor(Math.random() * strips.length);
    const s = strips.splice(idx, 1)[0];
    if (Math.random() < 0.1) {
      s.reverse();
      s.forEach((c) => (c.reversed = !c.reversed));
    }
    arr.push(...s);
  }
}

/* ---------- persistence ---------- */
function save() {
  localStorage.setItem(
    'tarotDeck',
    JSON.stringify({
      deck: deck.value,
      spreadCards: spreadCards.value,
      discard: discard.value,
    }),
  );
}
function load(): boolean {
  const raw = localStorage.getItem('tarotDeck');
  if (!raw) return false;
  try {
    const s = JSON.parse(raw);
    deck.value = s.deck || [];
    spreadCards.value = s.spreadCards || {};
    discard.value = s.discard || [];
    return true;
  } catch {
    return false;
  }
}

/* ---------- API ---------- */
function init() {
  if (
    load() &&
    deck.value.length +
      Object.keys(spreadCards.value).length +
      discard.value.length ===
      78
  )
    return;
  deck.value = defaultNames.map((n) => ({ name: n, reversed: false }));
  save();
}

function shuffleAll() {
  const ret = [...Object.values(spreadCards.value), ...discard.value];
  spreadCards.value = {};
  discard.value = [];
  ret.forEach((c) => Math.random() < 0.05 && (c.reversed = !c.reversed));
  deck.value.push(...ret);
  Math.random() < 0.7
    ? [...Array(3)].forEach(() => riffle(deck.value))
    : (riffle(deck.value), stripShuffle(deck.value), riffle(deck.value));
  if (Math.random() < 0.6) {
    const cut = Math.floor(deck.value.length * (0.25 + Math.random() * 0.5));
    deck.value = [...deck.value.slice(cut), ...deck.value.slice(0, cut)];
  }
  save();
}

function deal(positions: SpreadPosition[]) {
  discard.value.push(...Object.values(spreadCards.value));
  spreadCards.value = {};
  shuffleAll();
  for (const p of positions) {
    const card = deck.value.shift();
    if (!card) break;
    card.faceUp = false;
    spreadCards.value[p.id] = card;
  }
  save();
}

function reset() {
  if (!confirm('Restore deck to original order?')) return;
  localStorage.removeItem('tarotDeck');
  deck.value = defaultNames.map((n) => ({ name: n, reversed: false }));
  spreadCards.value = {};
  discard.value = [];
  save();
}

/* ---------- helpers ---------- */
const deckString = computed(() =>
  [...deck.value, ...Object.values(spreadCards.value), ...discard.value]
    .map((c) => c.name + (c.reversed ? ' (R)' : ''))
    .join(', '),
);

const statistics = computed(() => {
  const all = [
    ...deck.value,
    ...Object.values(spreadCards.value),
    ...discard.value,
  ];
  const total = all.length;
  const reversed = all.filter((c) => c.reversed).length;
  const reversalRate = total ? ((reversed / total) * 100).toFixed(1) : '0';
  interface Run {
    type: 'rev' | 'up';
    len: number;
  }
  const runs: Run[] = [];
  let cur: 'rev' | 'up' | null = null,
    len = 0;
  for (const c of all) {
    const t: 'rev' | 'up' = c.reversed ? 'rev' : 'up';
    if (t === cur) len++;
    else {
      if (len >= 3 && cur) runs.push({ type: cur, len });
      cur = t;
      len = 1;
    }
  }
  if (len >= 3 && cur) runs.push({ type: cur, len });
  const longest = (t: 'rev' | 'up') =>
    runs.filter((r) => r.type === t).reduce((m, r) => Math.max(m, r.len), 0) ||
    0;
  return {
    total,
    reversed,
    reversalRate,
    runCount: runs.length,
    longestReversedRun: longest('rev'),
    longestUprightRun: longest('up'),
  };
});

/* ---------- composable exporter ---------- */
export function useTarotDeck() {
  return {
    /* reactive state */
    deck,
    spreadCards,
    discard,
    /* actions */
    init,
    shuffleAll,
    deal,
    reset,
    /* helpers */
    deckString,
    statistics,
  };
}
