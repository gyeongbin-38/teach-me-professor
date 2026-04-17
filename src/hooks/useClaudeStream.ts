import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { useStore } from '../store/useStore';
import type { LearningMode } from '../types';

const modelMap: Record<LearningMode, string> = {
  quick: 'claude-haiku-4-5-20251001',
  balanced: 'claude-sonnet-4-6',
  deep: 'claude-sonnet-4-6',
};

export function useClaudeStream() {
  const { apiKey, currentMode } = useStore();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stream = useCallback(async (prompt: string) => {
    if (!apiKey) {
      setError('API 키를 설정해주세요. 설정 페이지에서 입력할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setText('');

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const response = await client.messages.create({
        model: modelMap[currentMode],
        max_tokens: 2048,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of response) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const delta = event.delta as { type: 'text_delta'; text: string };
          setText((prev) => prev + delta.text);
        }
      }
    } catch (e: any) {
      setError(e.message || 'AI 응답 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [apiKey, currentMode]);

  const reset = useCallback(() => {
    setText('');
    setError(null);
  }, []);

  return { text, loading, error, stream, reset };
}
