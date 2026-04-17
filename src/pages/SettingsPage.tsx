import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { KeyRound, Save, Eye, EyeOff, CheckCircle2, ExternalLink, Cpu, Brain } from 'lucide-react';

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
        <p className="text-slate-500 text-sm">OpenRouter API 키로 모든 AI 기능을 사용할 수 있어요.</p>
      </div>

      {/* OpenRouter API Key */}
      <div className="card-exam mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-exam-100 rounded-xl flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-exam-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">OpenRouter API 키</h2>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
              className="text-xs text-exam-500 hover:text-exam-700 flex items-center gap-1 mt-0.5">
              openrouter.ai/keys에서 발급 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="bg-exam-50 border border-exam-200 rounded-xl p-4 mb-4 text-xs text-exam-800 leading-relaxed">
          <strong>OpenRouter</strong>는 Claude, GPT-4, Gemini 등 모든 AI 모델을 하나의 API 키로 사용할 수 있는 통합 플랫폼입니다.<br />
          EXAM!!은 OpenRouter를 통해 최적의 모델을 자동으로 선택해 사용합니다.
        </div>

        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="sk-or-v1-..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-exam-400 transition-colors"
          />
          <button onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-exam-600 text-white hover:bg-exam-700'}`}>
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? '저장 완료!' : '저장하기'}
        </button>
      </div>

      {/* Model Info */}
      <div className="card mb-4">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-exam-600" /> EXAM!! 모델 구성
        </h2>
        <div className="space-y-3">
          {[
            { tag: 'claude-opus-4', color: 'purple', role: '플랜 수립', desc: '시험 전략·일정 설계 (Opus 최고 품질)', via: 'OpenRouter' },
            { tag: 'claude-sonnet-4-5', color: 'blue', role: '심화·균형 학습', desc: '개념 설명, 요약, 해설', via: 'OpenRouter' },
            { tag: 'claude-haiku-4-5', color: 'green', role: '빠른 학습·퀴즈', desc: '핵심 요약, 문제 생성', via: 'OpenRouter' },
          ].map(({ tag, color, role, desc, via }) => (
            <div key={tag} className="flex items-start gap-3 text-sm">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 mt-0.5 bg-${color}-100 text-${color}-700`}>{tag}</span>
              <div>
                <span className="font-semibold text-gray-700">{role}</span>
                <span className="text-slate-400 text-xs ml-2">{desc}</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">{via}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DeepTutor Backend */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" /> DeepTutor 백엔드 서버
        </h2>
        <p className="text-slate-500 text-sm mb-3 leading-relaxed">
          DeepTutor 에이전트 서버를 실행하면 멀티 에이전트, RAG, Deep Solve 등 고급 기능을 사용할 수 있습니다.<br />
          서버 없이도 OpenRouter 직접 연결로 기본 기능을 사용할 수 있습니다.
        </p>
        <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs text-slate-700">
          <p className="text-slate-400 mb-1"># EXAM 프로젝트 루트에서</p>
          <p>cd server && start.bat</p>
        </div>
      </div>
    </div>
  );
}
