// Minimal client for Chat Completions.
// You pass messages; it returns the assistant text.
// NOTE: For production, proxy this on a server. Client-side keys are visible.

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const API_BASE =
  (import.meta.env.VITE_OPENAI_BASE as string | undefined) ??
  'https://api.openai.com/v1';

export type ChatRole = 'system' | 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; content: string };

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<{ text: string; raw: any }> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 320,
    signal,
  } = opts;

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[openai] ${res.status} ${res.statusText}: ${body}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content?.trim?.() ?? '';
  return { text, raw: data };
}
