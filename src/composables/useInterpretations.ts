import { ref } from 'vue';
import { requestThreeCardInterpretation } from '@/prompts/threeCardSpread';
import type { Card, SpreadPosition, Interpretation } from '@/types';

interface GenerateInterpretationParams {
  card: Card;
  position: SpreadPosition;
  question: string;
  spreadName: string;
  allPositions: SpreadPosition[];
  revealedCards: Array<{ positionId: string; card: Card }>;
  styleSentence?: string;
}

export function useInterpretations() {
  const interpretations = ref<Interpretation[]>([]);
  const isLoadingAI = ref(false);
  const aiError = ref<string | null>(null);
  const retryAttempt = ref(0);

  // Optional style sentence for AI generation
  const styleSentence = ref(
    'Listen for what is alive right now and choose one small step that honors your values.',
  );

  async function generateInterpretation(params: GenerateInterpretationParams) {
    // Avoid duplicate interpretations
    if (interpretations.value.some((i) => i.card === params.card)) {
      return;
    }

    const maxRetries = 3;
    let attempt = 0;
    retryAttempt.value = 0;

    while (attempt < maxRetries) {
      try {
        isLoadingAI.value = true;
        aiError.value = null;

        const text = await requestThreeCardInterpretation({
          question: params.question,
          spreadName: params.spreadName,
          positions: params.allPositions,
          focusPositionId: params.position.id,
          draws: params.revealedCards,
          prior: interpretations.value.map((i) => ({
            positionId: i.pos.id,
            text: i.text,
          })),
          styleSentence: params.styleSentence || styleSentence.value,
        });

        interpretations.value.push({
          card: params.card,
          pos: params.position,
          text,
        });

        break;
      } catch (err: any) {
        attempt++;
        retryAttempt.value = attempt;

        if (attempt >= maxRetries) {
          aiError.value = `Failed after ${maxRetries} attempts: ${
            err?.message ?? String(err)
          }`;
        } else {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      } finally {
        if (attempt >= maxRetries || !aiError.value) {
          isLoadingAI.value = false;
          retryAttempt.value = 0;
        }
      }
    }
  }

  function clearInterpretations() {
    interpretations.value = [];
    aiError.value = null;
  }

  function removeInterpretation(card: Card) {
    interpretations.value = interpretations.value.filter(
      (i) => i.card !== card,
    );
  }

  function setStyleSentence(sentence: string) {
    styleSentence.value = sentence;
  }

  return {
    interpretations,
    isLoadingAI,
    aiError,
    retryAttempt,
    styleSentence,
    generateInterpretation,
    clearInterpretations,
    removeInterpretation,
    setStyleSentence,
  };
}
