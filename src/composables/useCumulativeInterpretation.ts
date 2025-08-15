import { ref, computed } from 'vue';
import { requestThreeCardInterpretation } from '@/prompts/threeCardSpread';
import type { Card, SpreadPosition } from '@/types';

interface RevealedCard {
  position: string;
  name: string;
  reversed: boolean;
}

interface GenerateInterpretationParams {
  card: Card;
  position: SpreadPosition;
  question: string;
  spreadName: string;
  allPositions: SpreadPosition[];
  revealedCards: Array<{ positionId: string; card: Card }>;
  styleSentence?: string;
}

export function useCumulativeInterpretation() {
  // Main interpretation text that builds up
  const interpretationText = ref('');
  const revealedCards = ref<RevealedCard[]>([]);
  const isLoadingAI = ref(false);
  const aiError = ref<string | null>(null);
  const retryAttempt = ref(0);
  const currentCardName = ref<string>('');

  // Style guidance for AI
  const styleSentence = ref(
    'Build upon the previous interpretation, creating a flowing narrative that connects each card naturally. Use transitions like "Furthermore...", "This leads to...", "Building on this...", "Additionally..." to connect paragraphs.',
  );

  // Track interpretation segments for potential undo/redo
  const interpretationSegments = ref<string[]>([]);

  async function addCardInterpretation(params: GenerateInterpretationParams) {
    const maxRetries = 3;
    let attempt = 0;
    retryAttempt.value = 0;
    currentCardName.value = `${params.position.label}: ${params.card.name}${
      params.card.reversed ? ' (Reversed)' : ''
    }`;

    // Add to revealed cards list
    revealedCards.value.push({
      position: params.position.label,
      name: params.card.name,
      reversed: params.card.reversed || false,
    });

    while (attempt < maxRetries) {
      try {
        isLoadingAI.value = true;
        aiError.value = null;

        // Request interpretation with context of existing text
        const newSegment = await requestThreeCardInterpretation({
          question: params.question,
          spreadName: params.spreadName,
          positions: params.allPositions,
          focusPositionId: params.position.id,
          draws: params.revealedCards,
          prior: interpretationText.value
            ? [
                {
                  positionId: 'cumulative',
                  text: interpretationText.value,
                },
              ]
            : [],
          styleSentence: params.styleSentence || styleSentence.value,
        });

        // Add the new interpretation as a new paragraph
        if (interpretationText.value) {
          // Add with transition if there's existing text
          interpretationText.value += '\n\n' + newSegment;
        } else {
          // First interpretation, no transition needed
          interpretationText.value = newSegment;
        }

        // Store segment for potential undo
        interpretationSegments.value.push(newSegment);

        break;
      } catch (err: any) {
        attempt++;
        retryAttempt.value = attempt;

        if (attempt >= maxRetries) {
          aiError.value = `Failed after ${maxRetries} attempts: ${
            err?.message ?? String(err)
          }`;
          // Remove the card from revealed if we couldn't get interpretation
          revealedCards.value.pop();
        } else {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      } finally {
        if (attempt >= maxRetries || !aiError.value) {
          isLoadingAI.value = false;
          retryAttempt.value = 0;
          currentCardName.value = '';
        }
      }
    }
  }

  function clearInterpretation() {
    interpretationText.value = '';
    interpretationSegments.value = [];
    revealedCards.value = [];
    aiError.value = null;
    currentCardName.value = '';
  }

  function undoLastSegment() {
    if (interpretationSegments.value.length > 0) {
      interpretationSegments.value.pop();
      revealedCards.value.pop();

      // Rebuild interpretation from remaining segments
      interpretationText.value = interpretationSegments.value.join('\n\n');
    }
  }

  function setStyleSentence(sentence: string) {
    styleSentence.value = sentence;
  }

  // Computed properties for UI
  const hasInterpretation = computed(() => interpretationText.value.length > 0);
  const canUndo = computed(() => interpretationSegments.value.length > 0);
  const interpretationWordCount = computed(
    () =>
      interpretationText.value.split(/\s+/).filter((word) => word.length > 0)
        .length,
  );

  return {
    // State
    interpretationText,
    revealedCards,
    isLoadingAI,
    aiError,
    retryAttempt,
    currentCardName,
    styleSentence,

    // Computed
    hasInterpretation,
    canUndo,
    interpretationWordCount,

    // Actions
    addCardInterpretation,
    clearInterpretation,
    undoLastSegment,
    setStyleSentence,
  };
}
