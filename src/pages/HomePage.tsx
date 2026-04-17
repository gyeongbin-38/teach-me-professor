import { useExamStore } from '../store/useExamStore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, Target, TrendingUp, GraduationCap } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function HomePage() {
  const { exams, files, plans, apiKey } = useExamStore();
  const navigate = useNavigate();
  const today = new Date();

  const upcoming = exams
    .map((e) => ({ ...e, d: differenceInDays(new Date(e.examDate), today) }))
    .filter((e) => e.d >= 0)
    .sort((a, b) => a.d - b.d);

  const totalDone = plans.reduce((a, p) => a + p.dailyPlans.reduce((b, d) => b + d.tasks.filter(t => t.completed).length, 0), 0);
  const totalAll  = plans.reduce((a, p) => a + p.dailyPlans.reduce((b, d) => b + d.tasks.length, 0), 0);
  const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const steps = [
    { n: 1, label: 'API 키 설정',   done: !!apiKey,          path: '/settings', icon: '🔑', hint: apiKey ? '등록됨' : '필수' },
    { n: 2, label: '자료 올리기',   done: files.length > 0,  path: '/upload',   icon: '📚', hint: `${files.length}개` },
    { n: 3, label: '시험 일정 입력', done: exams.length > 0,  path: '/plan',     icon: '📅', hint: `${exams.length}개` },
    { n: 4, label: 'AI 플랜 생성',  done: plans.length > 0,  path: '/plan',     icon: '✨', hint: plans.length > 0 ? '완료' : 'Opus 생성' },
    { n: 5, label: '지금 공부!',    done: totalDone > 0,     path: '/study',    icon: '🔥', hint: totalDone > 0 ? `${totalDone}완료` : '시작' },
  ];

  const firstPending = steps.findIndex(s => !s.done);

  return (
    <div className="p-8 max-w-5xl">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-exam-700 via-exam-600 to-exam-500 rounded-3xl p-8 text-white mb-8 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-8 h-8 text-exam-200" />
            <h1 className="text-3xl font-black tracking-tight">
              EXAM<span className="text-heat-400">!!</span>
            </h1>
          </div>
          <p className="text-exam-100 font-bold text-lg">교수님, 가르쳐 주세요</p>
          <p className="text-exam-200 text-sm mt-1 max-w-md">
            강의자료를 올리면 Claude Opus가 맞춤 학습 플랜을 짜고,<br />
            Haiku·Sonnet이 실시간으로 공부를 도와드려요.
          </p>
          {!apiKey && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span className="text-sm text-exam-100">시작하려면 API 키가 필요해요</span>
              <button
                onClick={() => navigate('/settings')}
                className="ml-2 text-xs bg-white text-exam-700 px-3 py-1 rounded-lg font-bold hover:bg-exam-50"
              >
                설정하기
              </button>
            </div>
          )}
        </div>
        {/* decorative */}
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -right-4 top-12 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-exam-600" />
            <h2 className="font-bold text-gray-900 text-sm">학습 현황</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { v: files.length, l: '자료' },
              { v: plans.length, l: '플랜' },
              { v: `${pct}%`, l: '완료율' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-black text-exam-600">{v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          {totalAll > 0 && (
            <>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>전체 진도</span><span>{totalDone}/{totalAll}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-exam-500 to-heat-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
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
              <p className="text-slate-400 text-sm mb-3">아직 등록된 시험이 없어요</p>
              <button onClick={() => navigate('/plan')} className="btn-secondary text-sm">
                시험 일정 추가
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`min-w-[52px] text-center font-black text-xl ${
                    e.d <= 3 ? 'text-red-600' : e.d <= 7 ? 'text-orange-500' : 'text-exam-600'
                  }`}>D-{e.d}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{e.subject}</p>
                    <p className="text-xs text-slate-400">{new Date(e.examDate).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <button
                    onClick={() => navigate('/study')}
                    className="text-xs text-exam-600 font-bold flex items-center gap-0.5 hover:text-exam-700"
                  >
                    공부 <ChevronRight className="w-3.5 h-3.5" />
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
          <span className="text-xs text-slate-400">{steps.filter(s => s.done).length}/5 완료</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s, i) => (
            <button
              key={s.n}
              onClick={() => navigate(s.path)}
              className={`text-center p-3 rounded-2xl border-2 transition-all hover:shadow-sm ${
                s.done
                  ? 'bg-green-50 border-green-300'
                  : i === firstPending
                  ? 'bg-exam-50 border-exam-400 ring-2 ring-exam-200'
                  : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
            >
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
