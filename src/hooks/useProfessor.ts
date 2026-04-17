import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { useExamStore } from '../store/useExamStore';
import type { LearningMode } from '../types';

const MODEL: Record<LearningMode, string> = {
  quick:    'claude-haiku-4-5-20251001',
  balanced: 'claude-sonnet-4-6',
  deep:     'claude-sonnet-4-6',
};

export function useProfessor() {
  const { apiKey, currentMode } = useExamStore();
  const [answer, setAnswer] = useState('');
  const [thinking, setThinking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ask = useCallback(async (prompt: string) => {
    if (!apiKey) {
      setErr('API 키를 먼저 설정해주세요. (설정 메뉴)');
      return;
    }
    setThinking(true);
    setErr(null);
    setAnswer('');

    try {
      const ai = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const stream = await ai.messages.create({
        model: MODEL[currentMode],
        max_tokens: 2048,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const ev of stream) {
        if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
          const d = ev.delta as { type: 'text_delta'; text: string };
          setAnswer((prev) => prev + d.text);
        }
      }
    } catch (e: any) {
      setErr(e.message ?? 'AI 응답 오류');
    } finally {
      setThinking(false);
    }
  }, [apiKey, currentMode]);

  const clear = useCallback(() => { setAnswer(''); setErr(null); }, []);

  return { answer, thinking, err, ask, clear };
}
