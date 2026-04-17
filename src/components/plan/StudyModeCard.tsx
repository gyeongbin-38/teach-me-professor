import { useExamStore } from '../../store/useExamStore';
import { Zap, BookOpen, Brain } from 'lucide-react';
import type { LearningMode } from '../../types';

const MODES: {
  id: LearningMode;
  label: string;
  icon: typeof Zap;
  sub: string;
  model: string;
  cls: { ring: string; bg: string; text: string; tag: string };
  feats: string[];
}[] = [
  {
    id: 'quick', label: '⚡ 빠른 학습', icon: Zap,
    sub: '시간 없을 때', model: 'Haiku',
    cls: { ring: 'ring-green-400', bg: 'bg-green-50', text: 'text-green-700', tag: 'bg-green-100 text-green-700' },
    feats: ['핵심만', '2h/일', '자주 나오는 문제'],
  },
  {
    id: 'balanced', label: '📖 균형 학습', icon: BookOpen,
    sub: '표준 준비', model: 'Sonnet',
    cls: { ring: 'ring-exam-400', bg: 'bg-exam-50', text: 'text-exam-700', tag: 'bg-exam-100 text-exam-700' },
    feats: ['개념+문제 균형', '4h/일', '예상 문제 포함'],
  },
  {
    id: 'deep', label: '🧠 심화 학습', icon: Brain,
    sub: '완벽 이해·고득점', model: 'Sonnet',
    cls: { ring: 'ring-purple-400', bg: 'bg-purple-50', text: 'text-purple-700', tag: 'bg-purple-100 text-purple-700' },
    feats: ['심층 개념 분석', '6h/일', '응용 문제 포함'],
  },
];

export default function StudyModeCard() {
  const { currentMode, setMode } = useExamStore();

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900 text-sm">학습 모드</h3>
      <div className="space-y-2">
        {MODES.map((m) => {
          const sel = currentMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full text-left p-3 border-2 rounded-xl transition-all ${
                sel ? `${m.cls.bg} ring-2 ${m.cls.ring} border-transparent` : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 flex-shrink-0 ${sel ? m.cls.text : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${sel ? m.cls.text : 'text-slate-700'}`}>{m.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${sel ? m.cls.tag : 'bg-slate-100 text-slate-500'}`}>
                      {m.model}
                    </span>
                    {sel && <span className="ml-auto text-xs font-bold text-white bg-exam-600 px-2 py-0.5 rounded-full">선택됨</span>}
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {m.feats.map(f => (
                      <span key={f} className={`text-xs px-1.5 py-0.5 rounded-md ${sel ? m.cls.tag : 'bg-slate-100 text-slate-500'}`}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
