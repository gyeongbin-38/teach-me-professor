import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { KeyRound, Save, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { apiKey, setApiKey } = useExamStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">설정</h1>
        <p className="text-slate-500 text-sm">Anthropic API 키를 등록하면 AI 기능을 전부 사용할 수 있어요.</p>
      </div>

      <div className="card-exam mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-exam-100 rounded-xl flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-exam-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Anthropic API 키</h2>
            <p className="text-xs text-slate-500">claude.ai/settings 에서 발급</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>플랜 생성:</strong> Claude Opus (심층 분석)<br />
            <strong>학습 콘텐츠:</strong> Claude Haiku / Sonnet (실시간 생성)
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="sk-ant-api03-..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-exam-400 transition-colors"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-exam-600 text-white hover:bg-exam-700'
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? '저장 완료!' : '저장하기'}
        </button>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4 text-sm">EXAM!! 모델 구성</h2>
        <div className="space-y-3">
          {[
            { tag: 'Opus', color: 'purple', role: '플랜 수립', desc: '시험 전략·일정 설계' },
            { tag: 'Sonnet', color: 'blue', role: '심화·균형 학습', desc: '개념 설명, 요약, 해설' },
            { tag: 'Haiku', color: 'green', role: '빠른 학습·퀴즈', desc: '핵심 요약, 문제 생성' },
          ].map(({ tag, color, role, desc }) => (
            <div key={tag} className="flex items-center gap-3 text-sm">
              <span className={`px-2 py-0.5 bg-${color}-100 text-${color}-700 rounded-lg text-xs font-bold min-w-[54px] text-center`}>
                {tag}
              </span>
              <span className="font-medium text-gray-700">{role}</span>
              <span className="text-slate-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
