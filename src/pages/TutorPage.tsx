import { useState, useRef, useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';
import { useProfessor } from '../hooks/useProfessor';
import { checkServerHealth, connectDeepTutorChat } from '../services/deepTutorClient';
import type { DTEvent } from '../services/deepTutorClient';
import { MessageSquareText, Send, Loader2, Brain, BookOpen, Wifi, WifiOff, RotateCcw, GraduationCap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stage?: string;
  sources?: unknown[];
}

const CAPABILITY_PROMPTS = {
  chat:  (subject: string, ctx: string) => `당신은 ${subject} 전문 AI 튜터입니다. 학생이 시험을 준비할 수 있도록 소크라테스식 대화로 개념을 가르쳐 주세요. 참고 자료:\n${ctx.slice(0, 2000)}`,
  solve: (subject: string, ctx: string) => `${subject} 관련 문제를 단계별로 심층 분석해 주세요. 참고 자료:\n${ctx.slice(0, 2000)}`,
  quiz:  (subject: string, _ctx: string) => `${subject} 시험 대비 예상 문제를 출제하고 해설해 주세요.`,
};

export default function TutorPage() {
  const { exams, files, currentExamId, currentMode, apiKey } = useExamStore();
  const currentExam = exams.find(e => e.id === currentExamId);
  const { ask, answer, thinking, err, clear } = useProfessor();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [capability, setCapability] = useState<'chat' | 'solve' | 'quiz'>('chat');
  const [dtOnline, setDtOnline] = useState(false);
  const [dtConn, setDtConn] = useState<ReturnType<typeof connectDeepTutorChat> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAnswerRef = useRef('');

  const context = files.map(f => f.content).join('\n\n').slice(0, 3000);
  const subject = currentExam?.subject ?? '학습 중인 과목';

  useEffect(() => {
    let conn: ReturnType<typeof connectDeepTutorChat> | null = null;
    checkServerHealth().then(online => {
      setDtOnline(online);
      if (online) {
        conn = connectDeepTutorChat(handleDTEvent, () => setDtOnline(false));
        setDtConn(conn);
      }
    });
    return () => { conn?.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, answer]);

  // Sync streaming answer to messages
  useEffect(() => {
    if (answer && answer !== lastAnswerRef.current) {
      lastAnswerRef.current = answer;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === 'streaming') {
          return [...prev.slice(0, -1), { ...last, content: answer }];
        }
        return prev;
      });
    }
  }, [answer]);

  useEffect(() => {
    if (!thinking && lastAnswerRef.current) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === 'streaming') {
          return [...prev.slice(0, -1), { ...last, id: crypto.randomUUID() }];
        }
        return prev;
      });
      lastAnswerRef.current = '';
      clear();
    }
  }, [thinking]);

  const handleDTEvent = (ev: DTEvent) => {
    if (ev.type === 'content' || ev.type === 'result') {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === 'streaming-dt') {
          return [...prev.slice(0, -1), { ...last, content: last.content + ev.content, stage: ev.stage }];
        }
        return [...prev, { id: 'streaming-dt', role: 'assistant', content: ev.content, stage: ev.stage }];
      });
    }
    if (ev.type === 'done') {
      setMessages(prev => prev.map(m => m.id === 'streaming-dt' ? { ...m, id: crypto.randomUUID() } : m));
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!apiKey) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');

    if (dtOnline && dtConn) {
      setMessages(prev => [...prev, { id: 'streaming-dt', role: 'assistant', content: '', stage: 'thinking' }]);
      dtConn.send({ message: userInput, enable_rag: files.length > 0 });
    } else {
      setMessages(prev => [...prev, { id: 'streaming', role: 'assistant', content: '' }]);
      const sysPrompt = CAPABILITY_PROMPTS[capability](subject, context);
      await ask(`${sysPrompt}\n\n학생: ${userInput}\n\nAI 튜터:`);
    }
  };

  const handleQuickStart = async (type: 'explain' | 'quiz' | 'plan') => {
    const prompts = {
      explain: `${subject}의 핵심 개념부터 차근차근 설명해 주세요.`,
      quiz: `${subject} 시험에 자주 나오는 문제 유형을 알려주고 예제를 들어주세요.`,
      plan: `오늘부터 시험까지 어떻게 공부해야 하는지 단계별로 알려주세요.`,
    };
    setInput(prompts[type]);
  };

  const reset = () => { setMessages([]); clear(); lastAnswerRef.current = ''; };

  const capabilityConfig = {
    chat:  { label: '💬 대화 학습', icon: MessageSquareText, desc: '소크라테스식 1:1 튜터링' },
    solve: { label: '🔍 Deep Solve', icon: Brain,             desc: '문제 심층 분석' },
    quiz:  { label: '❓ 퀴즈 모드', icon: BookOpen,           desc: '예상 문제 출제' },
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-exam-500 to-heat-500 rounded-2xl flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 text-lg">AI 튜터</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500">{currentExam ? currentExam.subject : '과목을 선택하세요'}</p>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${dtOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {dtOnline ? <><Wifi className="w-2.5 h-2.5" /> DeepTutor</> : <><WifiOff className="w-2.5 h-2.5" /> OpenRouter</>}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Capability selector */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {(Object.keys(capabilityConfig) as Array<'chat' | 'solve' | 'quiz'>).map(cap => (
              <button key={cap} onClick={() => setCapability(cap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${capability === cap ? 'bg-white text-exam-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {capabilityConfig[cap].label}
              </button>
            ))}
          </div>
          <button onClick={reset} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-exam-500 to-heat-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl">
              <MessageSquareText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">교수님께 무엇이든 물어보세요</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">DeepTutor Agent가 업로드된 강의 자료를 기반으로<br />1:1 맞춤 튜터링을 제공합니다</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: '📖 핵심 개념 설명', type: 'explain' as const },
                { label: '❓ 예상 문제 출제', type: 'quiz' as const },
                { label: '📅 학습 계획 짜기', type: 'plan' as const },
              ].map(({ label, type }) => (
                <button key={type} onClick={() => handleQuickStart(type)}
                  className="px-4 py-2 bg-white border-2 border-slate-200 hover:border-exam-300 rounded-xl text-sm font-semibold text-slate-700 hover:text-exam-700 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-exam-500 to-heat-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-exam-600 text-white rounded-tr-md'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-sm'
            }`}>
              {msg.stage && msg.role === 'assistant' && (
                <p className="text-[10px] font-bold text-exam-400 mb-1 uppercase tracking-wider">{msg.stage}</p>
              )}
              {msg.content
                ? <p className="whitespace-pre-wrap">{msg.content}</p>
                : <div className="flex gap-1 items-center py-1"><div className="w-2 h-2 bg-exam-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><div className="w-2 h-2 bg-exam-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><div className="w-2 h-2 bg-exam-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div>
              }
            </div>
          </div>
        ))}

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{err}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-slate-200">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder={`${subject}에 대해 질문하거나 설명을 요청하세요... (Shift+Enter로 줄 바꿈)`}
            rows={1}
            className="flex-1 resize-none border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-exam-400 transition-colors max-h-32 overflow-y-auto leading-relaxed"
            style={{ height: 'auto', minHeight: '48px' }}
          />
          <button
            onClick={handleSend}
            disabled={thinking || !input.trim() || !apiKey}
            className="w-12 h-12 bg-gradient-to-br from-exam-600 to-heat-500 rounded-2xl flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {thinking ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          {dtOnline ? '🟢 DeepTutor 에이전트 연결됨' : '⚡ OpenRouter 직접 연결 중'} · {currentMode === 'quick' ? 'Haiku' : currentMode === 'deep' ? 'Sonnet (심화)' : 'Sonnet'} 모델 사용
        </p>
      </div>
    </div>
  );
}
