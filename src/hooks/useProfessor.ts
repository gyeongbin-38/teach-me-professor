import { useState, useCallback } from 'react';
import { orStream, OR_MODELS } from '../services/openRouterClient';
import { useExamStore } from '../store/useExamStore';
import type { LearningMode } from '../types';

const modelByMode: Record<LearningMode, keyof typeof OR_MODELS> = {
  quick:    'quick',
  balanced: 'balanced',
  deep:     'deep',
};

export function useProfessor() {
  const { apiKey, currentMode } = useExamStore();
  const [answer, setAnswer] = useState('');
  const [thinking, setThinking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ask = useCallback(async (prompt: string) => {
    if (!apiKey) { setErr('OpenRouter API 키를 먼저 설정해주세요.'); return; }
    setThinking(true);
    setErr(null);
    setAnswer('');
    try {
      const modelKey = modelByMode[currentMode];
      for await (const chunk of orStream(apiKey, OR_MODELS[modelKey], prompt)) {
        setAnswer(prev => prev + chunk);
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
