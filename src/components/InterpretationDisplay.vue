<template>
  <div v-if="showPanel" class="interpretation-container">
    <!-- Header Section -->
    <div class="interpretation-header">
      <h3 class="header-title">
        <span class="header-icon">📖</span>
        Your Reading
      </h3>
      <div v-if="question" class="question-display">
        <span class="question-label">Question:</span>
        <span class="question-text">{{ question }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-spinner"></div>
        <span class="loading-text">
          <template v-if="retryAttempt > 0">
            Retrying (attempt {{ retryAttempt + 1 }})...
          </template>
          <template v-else-if="currentCardName">
            Interpreting {{ currentCardName }}...
          </template>
          <template v-else>
            Generating interpretation...
          </template>
        </span>
      </div>
    </Transition>

    <!-- Error State -->
    <n-alert v-if="error && !isLoading" type="error" :bordered="false" class="error-alert">
      {{ error }}
    </n-alert>

    <!-- Main Interpretation Text -->
    <div class="interpretation-body" ref="interpretationBody">
      <div class="interpretation-content">
        <!-- Cards revealed so far -->
        <div v-if="revealedCards.length > 0" class="cards-summary">
          <span class="cards-label">Cards Revealed:</span>
          <div class="cards-list">
            <span v-for="(entry, index) in revealedCards" :key="entry.position" class="card-tag"
              :class="{ 'reversed': entry.reversed }">
              {{ entry.position }}: {{ entry.name }}
              <span v-if="entry.reversed" class="reversed-symbol">↻</span>
            </span>
          </div>
        </div>

        <!-- The actual interpretation text -->
        <div v-if="interpretation" class="interpretation-text">
          <div v-html="formattedInterpretation"></div>
        </div>

        <!-- Placeholder when no interpretation yet -->
        <div v-else-if="!isLoading" class="empty-state">
          <p>Begin revealing cards to receive your interpretation...</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="interpretation" class="interpretation-actions">
      <n-button quaternary size="small" @click="copyToClipboard" :disabled="copying">
        <span class="button-icon">{{ copying ? '✓' : '📋' }}</span>
        {{ copying ? 'Copied!' : 'Copy Reading' }}
      </n-button>

      <n-button quaternary size="small" @click="$emit('clear')">
        <span class="button-icon">🗑️</span>
        Clear Reading
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { NAlert, NButton } from 'naive-ui'

interface RevealedCard {
  position: string
  name: string
  reversed: boolean
}

interface Props {
  interpretation: string
  isLoading: boolean
  error: string | null
  retryAttempt?: number
  currentCardName?: string
  question?: string
  revealedCards?: RevealedCard[]
}

const props = withDefaults(defineProps<Props>(), {
  retryAttempt: 0,
  revealedCards: () => []
})

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const interpretationBody = ref<HTMLElement>()
const copying = ref(false)

// Show panel when there's content or loading
const showPanel = computed(() =>
  props.interpretation ||
  props.isLoading ||
  props.error ||
  props.revealedCards.length > 0
)

// Format interpretation with proper paragraphs
const formattedInterpretation = computed(() => {
  if (!props.interpretation) return ''

  // Split by double newlines to create paragraphs
  const paragraphs = props.interpretation
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('')

  return paragraphs
})

// Auto-scroll to bottom when new content is added
watch(() => props.interpretation, async () => {
  if (props.interpretation && interpretationBody.value) {
    await nextTick()
    interpretationBody.value.scrollTo({
      top: interpretationBody.value.scrollHeight,
      behavior: 'smooth'
    })
  }
})

// Copy interpretation to clipboard
async function copyToClipboard() {
  if (!props.interpretation) return

  try {
    const textToCopy = props.question
      ? `Question: ${props.question}\n\n${props.interpretation}`
      : props.interpretation

    await navigator.clipboard.writeText(textToCopy)
    copying.value = true
    setTimeout(() => {
      copying.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.interpretation-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.interpretation-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  font-size: 1.5rem;
}

.question-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.question-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #f0f9ff;
  border-bottom: 1px solid #e0f2fe;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #64748b;
  font-size: 0.875rem;
}

.error-alert {
  margin: 1rem 1.25rem;
}

.interpretation-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.cards-summary {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.cards-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.cards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.card-tag.reversed {
  background: #fef3c7;
  color: #92400e;
}

.reversed-symbol {
  font-size: 0.75rem;
  opacity: 0.7;
}

.interpretation-text {
  line-height: 1.7;
  color: #374151;
}

.interpretation-text :deep(p) {
  margin: 0 0 1rem 0;
  text-indent: 1.5rem;
}

.interpretation-text :deep(p:first-child) {
  text-indent: 0;
}

.interpretation-text :deep(p:last-child) {
  margin-bottom: 0;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem;
}

.interpretation-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.button-icon {
  margin-right: 0.25rem;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styling */
.interpretation-body::-webkit-scrollbar {
  width: 8px;
}

.interpretation-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.interpretation-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.interpretation-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Mobile adjustments */
@media (max-width: 1024px) {
  .interpretation-container {
    height: auto;
    max-height: 600px;
  }

  .interpretation-body {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .interpretation-container {
    border-radius: 8px;
    max-height: 500px;
  }

  .interpretation-header {
    padding: 1rem;
  }

  .header-title {
    font-size: 1.125rem;
  }

  .interpretation-body {
    max-height: 350px;
    padding: 1rem;
  }

  .cards-list {
    gap: 0.375rem;
  }

  .card-tag {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }

  .interpretation-text {
    font-size: 0.95rem;
  }
}
</style>