import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { generateTaskContent, generateQuiz } from '../services/professorAI';
import { useProfessor } from '../hooks/useProfessor';
import { Loader2, CheckCircle2, HelpCircle, MessageSquare, X, ChevronDown, ChevronRight, FlameKindling } from 'lucide-react';
import type { StudyTask, QuizQuestion } from '../types';

export default function StudyPage() {
  const { exams, plans, files, currentExamId, currentMode, apiKey, completeTask } = useExamStore();
  const { answer, thinking, err: askErr, ask, clear } = useProfessor();

  const activePlan = plans.find((p) => p.examId === currentExamId);
  const currentExam = exams.find((e) => e.id === currentExamId);

  const [selDay, setSelDay] = useState(0);
  const [taskContent, setTaskContent] = useState<Record<string, string>>({});
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [showAsk, setShowAsk] = useState(false);

  const context = files.map(f => f.content).join('\n\n').slice(0, 4000);

  const handleTask = async (task: StudyTask) => {
    if (taskContent[task.id]) {
      setExpanded(expanded === task.id ? null : task.id);
      return;
    }
    if (!apiKey) return;
    setLoadingTask(task.id);
    try {
      const c = await generateTaskContent(apiKey, task, context, currentMode);
      setTaskContent(p => ({ ...p, [task.id]: c }));
      setExpanded(task.id);
    } catch (e: any) {
      setTaskContent(p => ({ ...p, [task.id]: `오류: ${e.message}` }));
    } finally {
      setLoadingTask(null);
    }
  };

  const handleQuiz = async () => {
    if (!apiKey || !currentExam) return;
    setQuizLoading(true);
    setQuiz([]);
    setAnswers({});
    setSubmitted(false);
    try {
      const qs = await generateQuiz(apiKey, context, currentExam.subject, currentMode, 5);
      setQuiz(qs);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    clear();
    await ask(`다음 학습 자료를 참고해서 한국어로 답변해 주세요.\n\n자료:\n${context}\n\n질문: ${question}`);
  };

  const correct = submitted ? quiz.filter(q => answers[q.id]?.trim() === q.answer?.trim()).length : 0;

  if (!activePlan || !currentExam) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-black text-slate-700 mb-2">학습 플랜이 없어요</h2>
        <p className="text-slate-400 text-sm">플랜 페이지에서 시험을 선택하고 AI 플랜을 만들어주세요.</p>
      </div>
    );
  }

  const day = activePlan.dailyPlans[selDay];
  const taskIcon: Record<string, string> = { read: '📖', quiz: '❓', summary: '📝', review: '🔄', practice: '✏️' };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FlameKindling className="w-7 h-7 text-heat-500" />
            {currentExam.subject}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activePlan.totalDays}일 플랜 · {currentMode === 'quick' ? '⚡ 빠른' : currentMode === 'deep' ? '🧠 심화' : '📖 균형'} 모드
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAsk(!showAsk)} className="btn-secondary flex items-center gap-1.5 text-sm">
            <MessageSquare className="w-4 h-4" /> AI에게 질문
          </button>
          <button onClick={handleQuiz} disabled={quizLoading} className="btn-heat flex items-center gap-1.5 text-sm">
            {quizLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
            퀴즈 생성
          </button>
        </div>
      </div>

      {/* Ask Panel */}
      {showAsk && (
        <div className="card-exam bg-exam-50 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-exam-900 text-sm">🎓 교수님께 질문</p>
            <button onClick={() => setShowAsk(false)}><X className="w-4 h-4 text-exam-400" /></button>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="궁금한 내용을 질문하세요..."
              className="flex-1 border-2 border-exam-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-exam-400 bg-white"
            />
            <button onClick={handleAsk} disabled={thinking} className="btn-primary text-sm">
              {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : '질문'}
            </button>
          </div>
          {(answer || thinking) && (
            <div className="bg-white rounded-xl p-4 text-sm text-slate-700 border-2 border-exam-200 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
              {answer || <span className="text-slate-400 animate-pulse">답변 생성 중...</span>}
            </div>
          )}
          {askErr && <p className="text-red-500 text-xs mt-2">{askErr}</p>}
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {activePlan.dailyPlans.map((d, i) => {
          const done = d.tasks.filter(t => t.completed).length;
          const all = d.tasks.length;
          return (
            <button
              key={i}
              onClick={() => setSelDay(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                selDay === i ? 'bg-exam-600 text-white border-exam-600'
                : done === all && all > 0 ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>{d.day}일차</div>
              <div className="opacity-70">{done}/{all}</div>
            </button>
          );
        })}
      </div>

      {/* Day Plan */}
      <div className="card mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-exam-100 rounded-2xl flex items-center justify-center font-black text-exam-700 text-sm flex-shrink-0">
            {day.day}
          </div>
          <div>
            <h2 className="font-black text-gray-900">{day.title}</h2>
            <p className="text-xs text-slate-500">{day.date} · {(day.estimatedMinutes / 60).toFixed(1)}시간</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {day.topics.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 bg-exam-100 text-exam-700 rounded-full font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {day.tasks.map(task => (
            <div key={task.id} className={`border-2 rounded-2xl overflow-hidden transition-all ${
              task.completed ? 'border-green-200 bg-green-50' : 'border-slate-200'
            }`}>
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleTask(task)}
              >
                <button
                  onClick={e => { e.stopPropagation(); completeTask(activePlan.id, selDay, task.id); }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {taskIcon[task.type] ?? '📌'} {task.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                </div>
                {loadingTask === task.id && <Loader2 className="w-4 h-4 animate-spin text-exam-500" />}
                {expanded === task.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>

              {expanded === task.id && taskContent[task.id] && (
                <div className="border-t-2 border-slate-100 p-4 bg-white">
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {taskContent[task.id]}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quiz */}
      {quiz.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">퀴즈 ({quiz.length}문제)</h3>
            {submitted && (
              <span className={`font-black text-lg ${correct >= quiz.length * 0.7 ? 'text-green-600' : 'text-orange-500'}`}>
                {correct}/{quiz.length} ✓
              </span>
            )}
          </div>
          <div className="space-y-4">
            {quiz.map((q, qi) => (
              <div key={q.id} className={`p-4 border-2 rounded-2xl ${
                submitted
                  ? answers[q.id]?.trim() === q.answer?.trim() ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                  : 'border-slate-200'
              }`}>
                <p className="font-bold text-gray-900 mb-3 text-sm">Q{qi + 1}. {q.question}</p>
                {q.type === 'multiple' && q.options?.map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm mb-1.5 cursor-pointer">
                    <input type="radio" name={q.id} value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => !submitted && setAnswers(p => ({ ...p, [q.id]: opt }))}
                      className="accent-exam-600"
                    />
                    <span className={submitted && opt === q.answer ? 'font-bold text-green-700' : ''}>{opt}</span>
                  </label>
                ))}
                {q.type === 'ox' && (
                  <div className="flex gap-2">
                    {['O', 'X'].map(v => (
                      <button key={v} onClick={() => !submitted && setAnswers(p => ({ ...p, [q.id]: v }))}
                        className={`w-12 h-12 rounded-xl font-black text-lg border-2 transition-all ${
                          answers[q.id] === v ? 'bg-exam-600 text-white border-exam-600' : 'border-slate-300 text-slate-600'
                        }`}>{v}</button>
                    ))}
                  </div>
                )}
                {q.type === 'short' && (
                  <input type="text" placeholder="답 입력" value={answers[q.id] ?? ''}
                    onChange={e => !submitted && setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-exam-400"
                  />
                )}
                {submitted && (
                  <div className="mt-3 p-3 bg-white rounded-xl border-2 border-current text-xs">
                    <p className="font-bold text-slate-700">정답: {q.answer}</p>
                    <p className="text-slate-500 mt-1">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!submitted && (
            <button onClick={() => setSubmitted(true)} className="btn-primary w-full mt-4">
              제출하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
