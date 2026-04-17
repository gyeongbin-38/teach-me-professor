import { useExamStore } from '../store/useExamStore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, Target, TrendingUp, GraduationCap, MessageSquareText, Layers, Brain, BookOpen } from 'lucide-react';
import { differenceInDays } from 'date-fns';

const CAPABILITIES = [
  { icon: MessageSquareText, label: 'AI 튜터',    desc: 'DeepTutor 에이전트와 1:1 대화', path: '/tutor',  color: 'from-exam-500 to-exam-700',   badge: 'DeepTutor Core' },
  { icon: Brain,             label: 'Deep Solve', desc: '복잡한 문제 단계별 심층 분석',   path: '/tutor',  color: 'from-purple-500 to-purple-700', badge: 'Multi-Agent' },
  { icon: Layers,            label: '플래시카드', desc: 'AI 생성 카드로 반복 학습',       path: '/study',  color: 'from-heat-500 to-heat-700',    badge: 'Active Recall' },
  { icon: BookOpen,          label: '학습 플랜',  desc: 'Opus가 설계하는 맞춤 전략',      path: '/plan',   color: 'from-green-500 to-green-700',  badge: 'Claude Opus' },
];

export default function HomePage() {
  const { exams, files, plans, apiKey } = useExamStore();
  const navigate = useNavigate();
  const today = new Date();

  const upcoming = exams
    .map(e => ({ ...e, d: differenceInDays(new Date(e.examDate), today) }))
    .filter(e => e.d >= 0)
    .sort((a, b) => a.d - b.d);

  const totalDone = plans.reduce((a, p) => a + p.dailyPlans.reduce((b, d) => b + d.tasks.filter(t => t.completed).length, 0), 0);
  const totalAll  = plans.reduce((a, p) => a + p.dailyPlans.reduce((b, d) => b + d.tasks.length, 0), 0);
  const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const steps = [
    { n: 1, label: 'API 키',     done: !!apiKey,         path: '/settings', icon: '🔑', hint: apiKey ? '등록됨' : '필수' },
    { n: 2, label: '자료 올리기', done: files.length > 0, path: '/upload',   icon: '📚', hint: `${files.length}개` },
    { n: 3, label: '시험 등록',  done: exams.length > 0, path: '/plan',     icon: '📅', hint: `${exams.length}개` },
    { n: 4, label: '플랜 생성',  done: plans.length > 0, path: '/plan',     icon: '✨', hint: plans.length > 0 ? '완료' : 'Opus' },
    { n: 5, label: 'AI 튜터',    done: false,            path: '/tutor',    icon: '🎓', hint: '대화 시작' },
  ];
  const firstPending = steps.findIndex(s => !s.done);

  return (
    <div className="p-8 max-w-5xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white mb-8 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #f97316 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-9 h-9 text-exam-200" />
            <div>
              <h1 className="text-4xl font-black tracking-tight">EXAM<span className="text-heat-400">!!</span></h1>
              <p className="text-exam-300 text-xs font-bold tracking-widest uppercase">Agent-Native Learning Platform</p>
            </div>
          </div>
          <p className="text-exam-100 font-semibold text-lg mt-2">교수님, 가르쳐 주세요</p>
          <p className="text-exam-200 text-sm mt-1 max-w-lg leading-relaxed">
            DeepTutor 멀티 에이전트 엔진이 강의 자료를 분석하고,<br />
            Claude Opus가 맞춤 학습 전략을 설계하며,<br />
            AI 튜터가 1:1로 시험을 준비시켜 드립니다.
          </p>
          {!apiKey && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span className="text-sm text-exam-100">OpenRouter API 키가 필요해요</span>
              <button onClick={() => navigate('/settings')}
                className="ml-2 text-xs bg-white text-exam-700 px-3 py-1 rounded-lg font-bold hover:bg-exam-50">
                설정하기
              </button>
            </div>
          )}
        </div>
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute right-8 bottom-4 w-32 h-32 bg-heat-500/10 rounded-full" />
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CAPABILITIES.map(({ icon: Icon, label, desc, path, color, badge }) => (
          <button key={label} onClick={() => navigate(path)}
            className="group text-left p-5 bg-white rounded-2xl border border-slate-200 hover:border-exam-300 hover:shadow-lg transition-all">
            <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-gray-900 text-sm mb-1">{label}</p>
            <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-exam-50 text-exam-600 rounded-full font-bold">{badge}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stats */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-exam-600" />
            <h2 className="font-bold text-gray-900 text-sm">학습 현황</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[{ v: files.length, l: '자료' }, { v: plans.length, l: '플랜' }, { v: `${pct}%`, l: '완료율' }].map(({ v, l }) => (
              <div key={l} className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-black text-exam-600">{v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          {totalAll > 0 && (
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-exam-500 to-heat-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>

        {/* D-Day */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-heat-500" />
            <h2 className="font-bold text-gray-900 text-sm">다가오는 시험</h2>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm mb-3">등록된 시험이 없어요</p>
              <button onClick={() => navigate('/plan')} className="btn-secondary text-sm">시험 일정 추가</button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className={`min-w-[56px] text-center font-black text-xl ${e.d <= 3 ? 'text-red-600' : e.d <= 7 ? 'text-orange-500' : 'text-exam-600'}`}>
                    {e.d === 0 ? 'D-DAY' : `D-${e.d}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{e.subject}</p>
                    <p className="text-xs text-slate-400">{new Date(e.examDate).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <button onClick={() => navigate('/tutor')} className="text-xs text-exam-600 font-bold flex items-center gap-0.5 hover:text-exam-700">
                    AI 튜터 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-bold text-gray-900 text-sm">시작 가이드</h2>
          <span className="text-xs text-slate-400">{steps.filter(s => s.done).length}/5</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s, i) => (
            <button key={s.n} onClick={() => navigate(s.path)}
              className={`text-center p-3 rounded-2xl border-2 transition-all hover:shadow-sm ${
                s.done ? 'bg-green-50 border-green-300' : i === firstPending ? 'bg-exam-50 border-exam-400 ring-2 ring-exam-200' : 'bg-slate-50 border-slate-200 opacity-50'
              }`}>
              <div className="text-2xl mb-1">{s.done ? '✅' : s.icon}</div>
              <p className={`text-xs font-bold ${s.done ? 'text-green-700' : 'text-slate-600'}`}>{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
