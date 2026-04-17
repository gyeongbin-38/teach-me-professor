import OpenAI from 'openai';

export type ORModel =
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-sonnet-4-5'
  | 'anthropic/claude-haiku-4-5'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'google/gemini-2.0-flash-001';

export const OR_MODELS = {
  planner:  'anthropic/claude-opus-4'        as ORModel,
  balanced: 'anthropic/claude-sonnet-4-5'    as ORModel,
  deep:     'anthropic/claude-sonnet-4-5'    as ORModel,
  quick:    'anthropic/claude-haiku-4-5'     as ORModel,
  fast:     'openai/gpt-4o-mini'             as ORModel,
};

export function getORClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/gyeongbin-38/teach-me-professor',
      'X-Title': 'EXAM!!',
    },
  });
}

export async function orComplete(
  apiKey: string,
  model: ORModel,
  prompt: string,
  maxTokens = 4096,
): Promise<string> {
  const client = getORClient(apiKey);
  const res = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.choices[0]?.message?.content ?? '';
}

export async function* orStream(
  apiKey: string,
  model: ORModel,
  prompt: string,
  maxTokens = 2048,
): AsyncGenerator<string> {
  const client = getORClient(apiKey);
  const stream = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}
