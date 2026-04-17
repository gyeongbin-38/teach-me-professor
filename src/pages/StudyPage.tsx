import { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateTaskContent, generateQuiz } from '../services/claudeService';
import { useClaudeStream } from '../hooks/useClaudeStream';
import { Loader2, CheckCircle, HelpCircle, MessageSquare, X, ChevronDown, ChevronRight } from 'lucide-react';
import type { StudyTask, QuizQuestion } from '../types';

export default function StudyPage() {
  const { exams, plans, files, currentExamId, currentMode, apiKey, completeTask } = useStore();
  const { text: streamText, loading: streamLoading, error: streamError, stream, reset } = useClaudeStream();

  const [activePlan] = [plans.find((p) => p.examId === currentExamId)];
  const currentExam = exams.find((e) => e.id === currentExamId);

  const [selectedDay, setSelectedDay] = useState(0);
  const [taskContent, setTaskContent] = useState<Record<string, string>>({});
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const fileContext = files.map((f) => f.content).join('\n\n').slice(0, 4000);

  const handleLoadTask = async (task: StudyTask) => {
    if (!apiKey || taskContent[task.id]) {
      setExpandedTask(expandedTask === task.id ? null : task.id);
      return;
    }
    setLoadingTask(task.id);
    try {
      const content = await generateTaskContent(apiKey, task, fileContext, currentMode);
      setTaskContent((prev) => ({ ...prev, [task.id]: content }));
      setExpandedTask(task.id);
    } catch (e: any) {
      setTaskContent((prev) => ({ ...prev, [task.id]: `오류: ${e.message}` }));
    } finally {
      setLoadingTask(null);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!apiKey || !currentExam) return;
    setLoadingQuiz(true);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const qs = await generateQuiz(apiKey, fileContext, currentExam.subject, currentMode, 5);
      setQuizQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAsk = async () => {
    if (!askInput.trim()) return;
    reset();
    await stream(`다음 학습 자료를 참고하여 한국어로 답변해주세요.\n\n자료:\n${fileContext}\n\n질문: ${askInput}`);
  };

  const handleSubmitQuiz = () => setQuizSubmitted(true);

  const correctCount = quizSubmitted
    ? quizQuestions.filter((q) => quizAnswers[q.id]?.trim() === q.answer?.trim()).length
    : 0;

  if (!activePlan || !currentExam) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-4xl">📚</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">학습 플랜이 없습니다</h2>
        <p className="text-gray-500 text-sm max-w-xs">플랜 페이지에서 시험을 선택하고 AI 학습 플랜을 생성해주세요.</p>
      </div>
    );
  }

  const todayPlan = activePlan.dailyPlans[selectedDay];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentExam.subject} 학습</h1>
          <p className="text-gray-500 text-sm mt-1">{activePlan.totalDays}일 플랜 · {currentMode === 'quick' ? '빠른' : currentMode === 'deep' ? '심화' : '균형'} 모드</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAsk(!showAsk)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            AI에게 질문
          </button>
          <button
            onClick={handleGenerateQuiz}
            disabled={loadingQuiz}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {loadingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
            퀴즈 생성
          </button>
        </div>
      </div>

      {/* Ask AI Panel */}
      {showAsk && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">AI에게 질문하기</h3>
            <button onClick={() => setShowAsk(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="궁금한 내용을 질문하세요..."
              className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <button onClick={handleAsk} disabled={streamLoading} className="btn-primary text-sm">
              {streamLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '질문'}
            </button>
          </div>
          {(streamText || streamLoading) && (
            <div className="bg-white rounded-lg p-4 text-sm text-gray-700 border border-blue-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {streamText || <span className="text-gray-400 animate-pulse">답변 생성 중...</span>}
            </div>
          )}
          {streamError && <p className="text-red-500 text-xs mt-2">{streamError}</p>}
        </div>
      )}

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {activePlan.dailyPlans.map((day, i) => {
          const completed = day.tasks.filter((t) => t.completed).length;
          const total = day.tasks.length;
          const allDone = completed === total && total > 0;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                selectedDay === i
                  ? 'bg-primary-600 text-white border-primary-600'
                  : allDone
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>{day.day}일차</div>
              <div className="opacity-70">{completed}/{total}</div>
            </button>
          );
        })}
      </div>

      {/* Today Plan */}
      <div className="card mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700">
            {todayPlan.day}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{todayPlan.title}</h2>
            <p className="text-sm text-gray-500">{todayPlan.date} · {Math.round(todayPlan.estimatedMinutes / 60 * 10) / 10}시간 예상</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {todayPlan.topics.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {todayPlan.tasks.map((task) => (
            <div key={task.id} className={`border rounded-xl overflow-hidden transition-all ${
              task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleLoadTask(task)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    completeTask(activePlan.id, selectedDay, task.id);
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {loadingTask === task.id && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
                  {expandedTask === task.id ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedTask === task.id && taskContent[task.id] && (
                <div className="border-t border-gray-100 p-4 bg-white">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {taskContent[task.id]}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Section */}
      {quizQuestions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">퀴즈 ({quizQuestions.length}문제)</h3>
            {quizSubmitted && (
              <span className={`font-bold ${correctCount >= quizQuestions.length * 0.7 ? 'text-green-600' : 'text-orange-500'}`}>
                {correctCount}/{quizQuestions.length} 정답
              </span>
            )}
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, idx) => (
              <div key={q.id} className={`p-4 border rounded-xl ${
                quizSubmitted
                  ? quizAnswers[q.id]?.trim() === q.answer?.trim()
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}>
                <p className="font-medium text-gray-900 mb-3 text-sm">
                  Q{idx + 1}. {q.question}
                </p>

                {q.type === 'multiple' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={quizAnswers[q.id] === opt}
                          onChange={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className="text-primary-600"
                        />
                        <span className={quizSubmitted && opt === q.answer ? 'font-semibold text-green-700' : ''}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'ox' && (
                  <div className="flex gap-3">
                    {['O', 'X'].map((v) => (
                      <button
                        key={v}
                        onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [q.id]: v }))}
                        className={`w-12 h-12 rounded-xl font-bold text-lg border-2 transition-all ${
                          quizAnswers[q.id] === v
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 text-gray-600'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'short' && (
                  <input
                    type="text"
                    placeholder="답을 입력하세요"
                    value={quizAnswers[q.id] || ''}
                    onChange={(e) => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}

                {quizSubmitted && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-current text-sm">
                    <p className="font-medium text-gray-700">정답: {q.answer}</p>
                    <p className="text-gray-500 mt-1">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted && quizQuestions.length > 0 && (
            <button onClick={handleSubmitQuiz} className="btn-primary mt-4 w-full">
              제출하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
