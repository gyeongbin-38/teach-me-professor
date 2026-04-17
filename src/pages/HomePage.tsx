import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, Target, TrendingUp } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function HomePage() {
  const { exams, files, plans, apiKey } = useStore();
  const navigate = useNavigate();
  const today = new Date();

  const upcomingExams = exams
    .map((e) => ({ ...e, daysLeft: differenceInDays(new Date(e.examDate), today) }))
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const totalCompleted = plans.reduce(
    (acc, p) => acc + p.dailyPlans.reduce(
      (a, d) => a + d.tasks.filter((t) => t.completed).length, 0
    ), 0
  );
  const totalTasks = plans.reduce(
    (acc, p) => acc + p.dailyPlans.reduce((a, d) => a + d.tasks.length, 0), 0
  );

  const steps = [
    { step: 1, label: 'API 키 설정', done: !!apiKey, path: '/settings', icon: '🔑', desc: 'Anthropic API 키 입력' },
    { step: 2, label: '자료 업로드', done: files.length > 0, path: '/upload', icon: '📚', desc: `${files.length}개 파일 업로드됨` },
    { step: 3, label: '시험 일정 입력', done: exams.length > 0, path: '/plan', icon: '📅', desc: exams.length > 0 ? `${exams.length}개 시험 등록` : '시험일 설정 필요' },
    { step: 4, label: 'AI 플랜 생성', done: plans.length > 0, path: '/plan', icon: '✨', desc: plans.length > 0 ? `${plans.length}개 플랜 생성됨` : 'Claude Opus가 설계' },
    { step: 5, label: '학습 시작', done: totalCompleted > 0, path: '/study', icon: '🎓', desc: totalCompleted > 0 ? `${totalCompleted}개 완료` : '지금 시작하기' },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">DeepTutor</h1>
            <p className="text-primary-200 text-lg">AI 기반 대학 시험 대비 학습 플랫폼</p>
            <p className="text-primary-300 text-sm mt-2">
              파일을 업로드하면 Claude Opus가 최적의 학습 플랜을 설계하고,<br />
              Haiku/Sonnet이 개인화된 학습 콘텐츠를 제공합니다.
            </p>
          </div>
          <div className="text-6xl opacity-30">🎓</div>
        </div>

        {!apiKey && (
          <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <p className="text-sm text-primary-100">
              시작하려면 Anthropic API 키가 필요합니다.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="ml-auto text-xs bg-white text-primary-700 px-3 py-1.5 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              키 설정하기
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">학습 현황</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              <p className="text-xs text-gray-500 mt-1">업로드 자료</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              <p className="text-xs text-gray-500 mt-1">학습 플랜</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">
                {totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">완료율</p>
            </div>
          </div>
          {totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>전체 진도</span>
                <span>{totalCompleted}/{totalTasks}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all"
                  style={{ width: `${(totalCompleted / totalTasks) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900">다가오는 시험</h2>
          </div>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">등록된 시험이 없습니다</p>
              <button onClick={() => navigate('/plan')} className="btn-secondary mt-3 text-sm">
                시험 일정 추가
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingExams.slice(0, 4).map((exam) => (
                <div key={exam.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`text-center min-w-[52px] ${
                    exam.daysLeft <= 3 ? 'text-red-600' : exam.daysLeft <= 7 ? 'text-orange-500' : 'text-primary-600'
                  }`}>
                    <p className="text-xl font-bold">D-{exam.daysLeft}</p>
                    <p className="text-xs opacity-70">{exam.daysLeft}일</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{exam.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(exam.examDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/study')}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    학습하기 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>시작 가이드</span>
          <span className="text-xs font-normal text-gray-400">
            {steps.filter((s) => s.done).length}/{steps.length} 완료
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((s, i) => (
            <button
              key={s.step}
              onClick={() => navigate(s.path)}
              className={`text-left p-4 rounded-xl border transition-all hover:shadow-sm ${
                s.done
                  ? 'bg-green-50 border-green-200'
                  : i === steps.findIndex((x) => !x.done)
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{s.done ? '✅' : s.icon}</div>
              <p className={`text-sm font-medium ${s.done ? 'text-green-700' : 'text-gray-700'}`}>
                {s.step}. {s.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
