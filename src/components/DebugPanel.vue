<template>
  <div v-if="show" class="debug-panel">
    <n-divider />

    <div class="debug-content">
      <div class="deck-section">
        <h3 class="debug-title">Deck State</h3>
        <pre class="deck-readout">{{ deckString }}</pre>
      </div>

      <div class="stats-section">
        <n-card embedded size="small">
          <template #header>
            <span class="stats-header">Shuffle Statistics</span>
          </template>

          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Total Cards</span>
              <span class="stat-value">{{ statistics.total }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Reversed</span>
              <span class="stat-value">
                {{ statistics.reversed }}
                <span class="stat-percent">({{ statistics.reversalRate }}%)</span>
              </span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Upright</span>
              <span class="stat-value">
                {{ statistics.total - statistics.reversed }}
                <span class="stat-percent">({{ (100 - Number(statistics.reversalRate)).toFixed(1) }}%)</span>
              </span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Runs ≥ 3</span>
              <span class="stat-value">{{ statistics.runCount }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Longest Reversed Run</span>
              <span class="stat-value">{{ statistics.longestReversedRun }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Longest Upright Run</span>
              <span class="stat-value">{{ statistics.longestUprightRun }}</span>
            </div>
          </div>
        </n-card>
      </div>

      <div v-if="additionalInfo" class="additional-section">
        <n-card embedded size="small">
          <template #header>Session Info</template>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Current Spread:</span>
              <span class="info-value">{{ additionalInfo.spreadName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cards Dealt:</span>
              <span class="info-value">{{ additionalInfo.cardsDealt }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cards Revealed:</span>
              <span class="info-value">{{ additionalInfo.cardsRevealed }}</span>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NDivider } from 'naive-ui'

interface Statistics {
  total: number
  reversed: number
  reversalRate: string
  runCount: number
  longestReversedRun: number
  longestUprightRun: number
}

interface AdditionalInfo {
  spreadName: string
  cardsDealt: number
  cardsRevealed: number
}

interface Props {
  show: boolean
  deckString: string
  statistics: Statistics
  additionalInfo?: AdditionalInfo
}

defineProps<Props>()
</script>

<style scoped>
.debug-panel {
  margin-top: 3rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.debug-content {
  display: grid;
  gap: 1.5rem;
}

.debug-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.deck-readout {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.4;
}

.stats-header {
  font-weight: 600;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.stat-percent {
  font-size: 0.875rem;
  font-weight: 400;
  color: #999;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: #666;
}

.info-value {
  font-weight: 600;
  color: #333;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .debug-panel {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>