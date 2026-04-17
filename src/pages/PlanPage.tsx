import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import ExamCalendar from '../components/plan/ExamCalendar';
import StudyModeCard from '../components/plan/StudyModeCard';
import { buildStudyPlan } from '../services/professorAI';
import { Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, CalendarCheck } from 'lucide-react';

export default function PlanPage() {
  const { exams, files, currentExamId, currentMode, apiKey, plans, addPlan } = useExamStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const currentExam = exams.find((e) => e.id === currentExamId);
  const currentPlan = plans.find((p) => p.examId === currentExamId && p.mode === currentMode);

  const handleGenerate = async () => {
    if (!apiKey) { setError('API 키를 먼저 설정해주세요.'); return; }
    if (!currentExam) { setError('시험을 선택해주세요.'); return; }
    if (files.length === 0) { setError('학습 자료를 먼저 업로드해주세요.'); return; }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const plan = await buildStudyPlan(apiKey, currentExam, files, currentMode);
      addPlan(plan);
      setSuccess(true);
      setExpandedDay(0);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message ?? '플랜 생성 실패. API 키를 확인해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const taskIcon: Record<string, string> = {
    read: '📖', quiz: '❓', summary: '📝', review: '🔄', practice: '✏️',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
          <CalendarCheck className="w-7 h-7 text-exam-600" />
          플랜 짜기
        </h1>
        <p className="text-slate-500 text-sm">시험 일정 입력 → 모드 선택 → Claude Opus가 최적 플랜 설계</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="card"><ExamCalendar /></div>
          <div className="card"><StudyModeCard /></div>

          {error && (
            <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
              <CheckCircle2 className="w-4 h-4" /> 플랜 생성 완료!
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !currentExamId || files.length === 0}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating
              ? <><Loader2 className="w-5 h-5 animate-spin" />Opus가 분석 중...</>
              : <><Sparkles className="w-5 h-5" />AI 플랜 생성</>
            }
          </button>
          <p className="text-xs text-slate-400 text-center -mt-2">Claude Opus 4.7 사용</p>
        </div>

        {/* Right */}
        <div className="lg:col-span-2">
          {currentPlan ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-gray-900">
                  {currentExam?.subject} — {currentPlan.totalDays}일 플랜
                </h2>
                <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                  Claude Opus 작성
                </span>
              </div>

              {currentPlan.dailyPlans.map((day, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-exam-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-exam-700 font-black text-sm">{day.day}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{day.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <span>{day.date}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(day.estimatedMinutes / 60).toFixed(1)}시간
                        </span>
                        <span>{day.tasks.length}과제</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{day.tasks.filter(t => t.completed).length}/{day.tasks.length}</span>
                      {expandedDay === idx
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {expandedDay === idx && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-2">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {day.topics.map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-exam-100 text-exam-700 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                      {day.tasks.map(task => (
                        <div key={task.id} className={`flex items-start gap-3 p-3 bg-white rounded-xl border ${
                          task.completed ? 'border-green-200 opacity-60' : 'border-slate-200'
                        }`}>
                          <span className="text-sm mt-0.5">{taskIcon[task.type] ?? '📌'}</span>
                          <div>
                            <p className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card-exam flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="font-bold text-slate-600 text-lg mb-2">아직 플랜이 없어요</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                자료를 올리고 시험 일정을 입력한 후<br />
                AI 플랜 생성 버튼을 눌러주세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
