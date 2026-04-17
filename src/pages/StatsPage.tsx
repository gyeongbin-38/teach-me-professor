import { useExamStore } from '../store/useExamStore';
import { differenceInDays } from 'date-fns';
import { BarChart3, Flame, Target, BookOpen, Layers, Calendar } from 'lucide-react';

export default function StatsPage() {
  const { exams, plans, files, flashcards } = useExamStore();
  const today = new Date();

  const totalTasks = plans.reduce((a, p) => a + p.dailyPlans.reduce((b, d) => b + d.tasks.length, 0), 0);
  const doneTasks  = plans.reduce((a, p) => a + p.dailyPlans.reduce((b, d) => b + d.tasks.filter(t => t.completed).length, 0), 0);
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalReviews = flashcards.reduce((a, c) => a + c.reviewCount, 0);

  const upcomingExams = exams
    .map(e => ({ ...e, d: differenceInDays(new Date(e.examDate), today) }))
    .filter(e => e.d >= 0)
    .sort((a, b) => a.d - b.d);

  const statCards = [
    { icon: BookOpen, label: '업로드 자료', value: files.length, unit: '개', color: 'text-exam-600', bg: 'bg-exam-50' },
    { icon: Target, label: '등록 시험', value: exams.length, unit: '개', color: 'text-heat-600', bg: 'bg-heat-50' },
    { icon: BarChart3, label: '완료 과제', value: doneTasks, unit: `/${totalTasks}`, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Layers, label: '플래시카드 복습', value: totalReviews, unit: '회', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Per-plan progress
  const planStats = plans.map(p => {
    const exam = exams.find(e => e.id === p.examId);
    const all  = p.dailyPlans.reduce((a, d) => a + d.tasks.length, 0);
    const done = p.dailyPlans.reduce((a, d) => a + d.tasks.filter(t => t.completed).length, 0);
    const pct  = all > 0 ? Math.round((done / all) * 100) : 0;
    return { exam, plan: p, all, done, pct };
  });

  // Heatmap: last 30 days completion
  const heatData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = plans.reduce((a, p) =>
      a + p.dailyPlans.filter(dp => dp.date === dateStr)
                       .reduce((b, dp) => b + dp.tasks.filter(t => t.completed).length, 0)
    , 0);
    return { date: dateStr, count, day: d.getDate() };
  });

  const maxCount = Math.max(...heatData.map(d => d.count), 1);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-1">
          <BarChart3 className="w-7 h-7 text-exam-600" />
          학습 통계
        </h1>
        <p className="text-slate-500 text-sm">나의 시험 대비 현황을 한눈에 확인해요</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, unit, color, bg }) => (
          <div key={label} className="card text-center">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-3xl font-black ${color}`}>
              {value}<span className="text-base font-semibold text-slate-400">{unit}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall Progress */}
        <div className="card">
          <h2 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-heat-500" /> 전체 학습 진도
          </h2>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-5xl font-black text-exam-600">{pct}%</p>
            <p className="text-slate-400 text-sm pb-1">{doneTasks}/{totalTasks} 과제 완료</p>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-exam-500 to-heat-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* D-Day List */}
        <div className="card">
          <h2 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-exam-600" /> 시험 일정
          </h2>
          {upcomingExams.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">등록된 시험 없음</p>
          ) : (
            <div className="space-y-2">
              {upcomingExams.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className={`text-sm font-black min-w-[48px] text-center ${
                    e.d <= 3 ? 'text-red-600' : e.d <= 7 ? 'text-orange-500' : 'text-exam-600'
                  }`}>D-{e.d}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800">{e.subject}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          e.d <= 3 ? 'bg-red-500' : e.d <= 7 ? 'bg-orange-500' : 'bg-exam-500'
                        }`}
                        style={{ width: `${Math.max(5, 100 - (e.d / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per-Plan Progress */}
      {planStats.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">과목별 플랜 진도</h2>
          <div className="space-y-4">
            {planStats.map(({ exam, plan, all, done, pct }) => (
              <div key={plan.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-800">{exam?.subject ?? '알 수 없음'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      plan.mode === 'quick' ? 'bg-green-100 text-green-700'
                      : plan.mode === 'deep' ? 'bg-purple-100 text-purple-700'
                      : 'bg-exam-100 text-exam-700'
                    }`}>
                      {plan.mode === 'quick' ? '⚡빠른' : plan.mode === 'deep' ? '🧠심화' : '📖균형'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-exam-600">{pct}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-exam-500 to-heat-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{done}/{all} 과제 · {plan.totalDays}일 플랜</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <div className="card">
        <h2 className="font-bold text-gray-900 text-sm mb-4">최근 30일 학습 활동</h2>
        <div className="flex gap-1 flex-wrap">
          {heatData.map(({ date, count, day }) => {
            const intensity = count === 0 ? 0 : Math.ceil((count / maxCount) * 4);
            const colors = ['bg-slate-100', 'bg-exam-100', 'bg-exam-300', 'bg-exam-500', 'bg-exam-700'];
            return (
              <div key={date} title={`${date}: ${count}개 완료`}
                className={`w-7 h-7 rounded-lg ${colors[intensity]} transition-colors flex items-center justify-center`}
              >
                <span className={`text-[9px] font-bold ${intensity >= 3 ? 'text-white' : 'text-slate-400'}`}>{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
          <span>적음</span>
          {['bg-slate-100','bg-exam-100','bg-exam-300','bg-exam-500','bg-exam-700'].map(c => (
            <div key={c} className={`w-4 h-4 rounded ${c}`} />
          ))}
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}
