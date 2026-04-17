import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Key, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { apiKey, setApiKey } = useStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">설정</h1>
      <p className="text-gray-500 mb-8">DeepTutor 사용을 위한 API 키를 설정하세요.</p>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Anthropic API 키</h2>
            <p className="text-sm text-gray-500">Claude AI 모델 사용에 필요합니다</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>학습 플랜 생성:</strong> Claude Opus (고품질 플랜 수립)<br />
            <strong>학습 콘텐츠:</strong> Claude Haiku / Sonnet (빠른 실행)
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? '저장됨!' : '저장하기'}
        </button>
      </div>

      <div className="card mt-4">
        <h2 className="font-semibold text-gray-900 mb-3">사용 모델 안내</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium mt-0.5">Opus</span>
            <div><strong className="text-gray-700">플랜 수립</strong> — 시험 일정 분석, 전략적 학습 계획 생성</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium mt-0.5">Sonnet</span>
            <div><strong className="text-gray-700">심화 학습</strong> — 개념 설명, 요약, 문제 해설</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium mt-0.5">Haiku</span>
            <div><strong className="text-gray-700">빠른 학습</strong> — 플래시카드, 퀴즈 생성, 빠른 답변</div>
          </div>
        </div>
      </div>
    </div>
  );
}
