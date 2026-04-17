import { useStore } from '../../store/useStore';
import { Zap, BookOpen, Brain } from 'lucide-react';
import type { LearningMode } from '../../types';

const modes: {
  id: LearningMode;
  label: string;
  icon: typeof Zap;
  description: string;
  model: string;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
}[] = [
  {
    id: 'quick',
    label: '빠른 학습',
    icon: Zap,
    description: '시험까지 시간이 부족할 때',
    model: 'Claude Haiku',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    features: ['핵심 개념 위주', '자주 나오는 문제 유형', '하루 2시간 목표'],
  },
  {
    id: 'balanced',
    label: '균형 학습',
    icon: BookOpen,
    description: '표준적인 시험 준비',
    model: 'Claude Sonnet',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    features: ['개념 + 문제풀이 균형', '예상 문제 포함', '하루 4시간 목표'],
  },
  {
    id: 'deep',
    label: '심화 학습',
    icon: Brain,
    description: '완벽한 이해와 고득점 목표',
    model: 'Claude Sonnet',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
    features: ['심층 개념 분석', '응용 문제 포함', '하루 6시간 목표'],
  },
];

export default function LearningModeSelector() {
  const { currentMode, setMode } = useStore();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">학습 모드 선택</h3>
      <div className="grid gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setMode(mode.id)}
              className={`text-left p-4 border-2 rounded-xl transition-all ${
                isSelected
                  ? `${mode.borderColor} ${mode.bgColor} shadow-sm`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? mode.bgColor : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? mode.color : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${isSelected ? mode.color : 'text-gray-700'}`}>
                      {mode.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isSelected ? `${mode.bgColor} ${mode.color}` : 'bg-gray-100 text-gray-500'
                    }`}>
                      {mode.model}
                    </span>
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-current font-medium ml-auto">
                        선택됨
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{mode.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mode.features.map((f) => (
                      <span key={f} className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? `${mode.bgColor} ${mode.color}` : 'bg-gray-100 text-gray-600'
                      }`}>{f}</span>
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
