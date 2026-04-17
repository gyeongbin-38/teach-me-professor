import { useState } from 'react';
import { useStore } from '../store/useStore';
import ExamScheduler from '../components/plan/ExamScheduler';
import LearningModeSelector from '../components/plan/LearningModeSelector';
import { createStudyPlan } from '../services/claudeService';
import { Loader2, Sparkles, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';

export default function PlanPage() {
  const { exams, files, currentExamId, currentMode, apiKey, plans, addPlan } = useStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const currentExam = exams.find((e) => e.id === currentExamId);
  const currentPlan = plans.find((p) => p.examId === currentExamId && p.mode === currentMode);

  const handleGenerate = async () => {
    if (!apiKey) { setError('API 키를 먼저 설정해주세요. (설정 메뉴)'); return; }
    if (!currentExam) { setError('시험을 선택해주세요.'); return; }
    if (files.length === 0) { setError('학습 자료를 먼저 업로드해주세요.'); return; }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const plan = await createStudyPlan(apiKey, currentExam, files, currentMode);
      addPlan(plan);
      setSuccess(true);
      setExpandedDay(0);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || '플랜 생성에 실패했습니다. API 키를 확인해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const taskTypeLabel: Record<string, string> = {
    read: '📖 읽기',
    quiz: '❓ 퀴즈',
    summary: '📝 요약',
    review: '🔄 복습',
    practice: '✏️ 연습',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">학습 플랜</h1>
        <p className="text-gray-500">시험 일정과 학습 모드를 설정하면 Claude Opus가 최적의 플랜을 만들어 드립니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <ExamScheduler />
          </div>
          <div className="card">
            <LearningModeSelector />
          </div>
          <div>
            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-sm">
                <CheckCircle className="w-4 h-4" />
                플랜이 생성되었습니다!
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating || !currentExamId || files.length === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Opus가 플랜 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI 학습 플랜 생성
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Claude Opus로 고품질 플랜 생성</p>
          </div>
        </div>

        {/* Right Panel - Plan Display */}
        <div className="lg:col-span-2">
          {currentPlan ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-lg">
                  {currentExam?.subject} — {currentPlan.totalDays}일 플랜
                </h2>
                <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  Claude Opus 작성
                </span>
              </div>

              {currentPlan.dailyPlans.map((day, idx) => (
                <div key={idx} className="card p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-bold text-sm">{day.day}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{day.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{day.date}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {Math.round(day.estimatedMinutes / 60 * 10) / 10}시간
                        </span>
                        <span className="text-xs text-gray-500">{day.tasks.length}개 과제</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {day.tasks.filter((t) => t.completed).length}/{day.tasks.length}
                      </span>
                      {expandedDay === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {expandedDay === idx && (
                    <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {day.topics.map((t) => (
                          <span key={t} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{t}</span>
                        ))}
                      </div>
                      {day.tasks.map((task) => (
                        <div key={task.id} className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                          task.completed ? 'border-green-200 opacity-60' : 'border-gray-200'
                        }`}>
                          <span className="text-sm mt-0.5">{taskTypeLabel[task.type] || task.type}</span>
                          <div>
                            <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-600 text-lg mb-2">플랜이 아직 없습니다</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                자료를 업로드하고 시험 일정을 입력한 후<br />
                "AI 학습 플랜 생성" 버튼을 눌러주세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
