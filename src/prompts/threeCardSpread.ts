import { chat, type ChatMessage } from '@/api/openai';

export type Orientation = 'upright' | 'reversed';
export interface Position {
  id: string;
  label: string;
}
export interface Card {
  name: string;
  reversed: boolean;
  faceUp?: boolean;
}
export interface CardDraw {
  positionId: string;
  card: Card;
}
export interface Interpretation {
  positionId: string;
  text: string;
}

const DEFAULT_STYLE_SENTENCE =
  'Listen for what is alive right now and choose one small step that honors your values.';

export const THREE_CARD_SYSTEM_PROMPT =
  'You are an experienced tarot reader. Be concise, grounded, and non-dogmatic. Avoid fatalism; offer agency.';

function fmtCard(c?: Card) {
  return c ? `${c.name}${c.reversed ? ' (reversed)' : ''}` : '—';
}
function squash(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Only include the current card and earlier *flipped* cards.
 * Everything else is marked "(face down)" (or omitted if showFaceDown=false).
 */
export function generateThreeCardSpreadPrompt(args: {
  question?: string;
  spreadName?: string;
  positions: Position[];
  focusPositionId: string;
  draws: CardDraw[]; // cards in the spread (some faceUp=false)
  prior?: Interpretation[]; // earlier interpretations
  styleSentence?: string;
  showFaceDown?: boolean; // default true: show placeholders instead of names
}): string {
  const {
    question = '',
    spreadName = 'Three-Card (Past / Present / Future)',
    positions,
    focusPositionId,
    draws,
    prior = [],
    styleSentence = DEFAULT_STYLE_SENTENCE,
    showFaceDown = true,
  } = args;

  const posById = new Map(positions.map((p) => [p.id, p]));
  const drawByPos = new Map(draws.map((d) => [d.positionId, d.card]));

  // Turned = current focus + any card with faceUp=true (already flipped)
  const turned = new Set<string>(
    draws
      .filter((d) => d.positionId === focusPositionId || d.card.faceUp)
      .map((d) => d.positionId),
  );

  const spreadLines = positions
    .map((p) => {
      if (turned.has(p.id)) {
        const marker = p.id === focusPositionId ? '  ← current' : '';
        return `• ${p.label}: ${fmtCard(drawByPos.get(p.id))}${marker}`;
      }
      return showFaceDown ? `• ${p.label}: (face down)` : null;
    })
    .filter(Boolean)
    .join('\n');

  // Earlier interpretations (only for positions that are actually turned)
  const priorByPos = new Map(prior.map((i) => [i.positionId, i.text]));
  const priorLines = positions
    .filter(
      (p) =>
        p.id !== focusPositionId && turned.has(p.id) && priorByPos.has(p.id),
    )
    .map(
      (p) =>
        `- ${p.label} — ${fmtCard(drawByPos.get(p.id))}: ${squash(
          priorByPos.get(p.id)!,
        )}`,
    )
    .join('\n');

  const focusPos = posById.get(focusPositionId)?.label ?? focusPositionId;
  const focusCard = drawByPos.get(focusPositionId);

  // Dynamic tie-in guidance based on how many prior cards exist
  const tieIn: string[] = [];
  const turnedPrior = positions.filter(
    (p) => p.id !== focusPositionId && turned.has(p.id),
  );
  if (turnedPrior.length === 0) {
    tieIn.push('- Do not refer to other positions.');
  } else if (turnedPrior.length === 1) {
    tieIn.push(
      `- Briefly compare or complement ${turnedPrior[0].label} in one clause.`,
    );
  } else {
    tieIn.push(
      '- Synthesize how this card confirms or challenges the themes from the earlier positions without repeating them.',
    );
  }

  return `
Question: ${question ? `"${question}"` : '(none supplied)'}
Spread: ${spreadName}

Current spread state:
${spreadLines}

Earlier interpretations:
${priorLines || '(none yet)'}

Now interpret ONLY this position:
${focusPos} — ${fmtCard(focusCard)}

Requirements:
- Write 2–3 sentences, no more.
- Tie the meaning to this position and the question.
- If reversed, address that orientation explicitly.
${tieIn.join('\n')}
- Do not mention or speculate about face-down positions.
- Plain text only; no headings, bullets, or disclaimers.

Style example to emulate:
“${styleSentence}”
`.trim();
}

/* Optional helpers */
export function buildThreeCardMessages(prompt: string): ChatMessage[] {
  return [
    { role: 'system', content: THREE_CARD_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];
}
export async function requestThreeCardInterpretation(
  args: Parameters<typeof generateThreeCardSpreadPrompt>[0],
) {
  const userPrompt = generateThreeCardSpreadPrompt(args);
  const { text } = await chat(buildThreeCardMessages(userPrompt), {
    model: 'gpt-4o-mini',
    maxTokens: 240,
    temperature: 0.7,
  });
  return text;
}
