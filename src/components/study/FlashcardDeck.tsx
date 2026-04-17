import { useState } from 'react';
import { useExamStore } from '../../store/useExamStore';
import { generateFlashcards } from '../../services/professorAI';
import type { Flashcard } from '../../types';
import { Loader2, RotateCcw, ChevronLeft, ChevronRight, Layers, Trash2, Check, X } from 'lucide-react';

export default function FlashcardDeck() {
  const { files, flashcards, currentExamId, exams, currentMode, apiKey, addFlashcards, removeFlashcard, reviewFlashcard } = useExamStore();
  const currentExam = exams.find(e => e.id === currentExamId);

  const [generating, setGenerating] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const subjectCards = currentExam
    ? flashcards.filter(c => c.subject === currentExam.subject)
    : flashcards;

  const context = files.map(f => f.content).join('\n\n').slice(0, 4000);

  const handleGenerate = async () => {
    if (!apiKey || !currentExam) return;
    setGenerating(true);
    try {
      const cards = await generateFlashcards(apiKey, context, currentExam.subject, currentMode, 10);
      addFlashcards(cards);
      startSession(cards);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const startSession = (cards: Flashcard[]) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
    setIdx(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
  };

  const current = sessionCards[idx];

  const handleKnow = () => {
    if (!current) return;
    reviewFlashcard(current.id);
    setKnown(prev => new Set([...prev, current.id]));
    next();
  };

  const handleDontKnow = () => {
    if (!current) return;
    setUnknown(prev => new Set([...prev, current.id]));
    next();
  };

  const next = () => {
    setFlipped(false);
    if (idx + 1 >= sessionCards.length) {
      setFinished(true);
    } else {
      setIdx(i => i + 1);
    }
  };

  const prev = () => {
    if (idx > 0) { setIdx(i => i - 1); setFlipped(false); }
  };

  if (subjectCards.length === 0 && sessionCards.length === 0) {
    return (
      <div className="text-center py-10">
        <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-semibold mb-2">플래시카드가 없어요</p>
        <p className="text-slate-400 text-sm mb-4">AI가 학습 자료에서 카드를 자동 생성해드려요</p>
        <button
          onClick={handleGenerate}
          disabled={generating || !currentExam || !apiKey}
          className="btn-primary flex items-center gap-2 mx-auto disabled:opacity-40"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
          {generating ? '생성 중...' : '플래시카드 생성'}
        </button>
      </div>
    );
  }

  if (finished) {
    const total = sessionCards.length;
    const knownCount = known.size;
    const pct = Math.round((knownCount / total) * 100);
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h3 className="font-black text-xl text-gray-900 mb-1">세션 완료!</h3>
        <p className="text-slate-500 text-sm mb-4">{total}장 중 {knownCount}장 알고 있어요 ({pct}%)</p>
        <div className="flex gap-3 justify-center mb-6">
          <div className="text-center p-3 bg-green-50 rounded-xl min-w-[72px]">
            <p className="text-2xl font-black text-green-600">{knownCount}</p>
            <p className="text-xs text-green-600">알아요</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl min-w-[72px]">
            <p className="text-2xl font-black text-red-600">{unknown.size}</p>
            <p className="text-xs text-red-600">몰라요</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => startSession(sessionCards)} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RotateCcw className="w-4 h-4" /> 다시 풀기
          </button>
          <button
            onClick={() => startSession(sessionCards.filter(c => unknown.has(c.id)))}
            disabled={unknown.size === 0}
            className="btn-primary text-sm disabled:opacity-40"
          >
            모르는 것만 ({unknown.size})
          </button>
        </div>
      </div>
    );
  }

  if (sessionCards.length > 0 && current) {
    const progress = ((idx) / sessionCards.length) * 100;
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500">{idx + 1} / {sessionCards.length}</span>
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              current.difficulty === 'easy' ? 'bg-green-100 text-green-700'
              : current.difficulty === 'hard' ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
            }`}>
              {current.difficulty === 'easy' ? '쉬움' : current.difficulty === 'hard' ? '어려움' : '보통'}
            </span>
            <button onClick={() => removeFlashcard(current.id)} className="text-slate-300 hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-exam-500 to-heat-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className={`relative w-full cursor-pointer select-none rounded-2xl border-2 p-6 min-h-[180px] flex flex-col items-center justify-center text-center transition-all ${
            flipped ? 'bg-exam-50 border-exam-300' : 'bg-white border-slate-200 hover:border-exam-200'
          }`}
        >
          <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${
            flipped ? 'bg-exam-100 text-exam-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {flipped ? '뒷면' : '앞면'}
          </div>
          <p className={`font-bold leading-relaxed ${flipped ? 'text-exam-800' : 'text-slate-800'}`}>
            {flipped ? current.back : current.front}
          </p>
          {!flipped && (
            <p className="text-xs text-slate-400 mt-3">클릭하면 답을 볼 수 있어요</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={prev} disabled={idx === 0} className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {flipped ? (
            <div className="flex gap-3">
              <button onClick={handleDontKnow} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 font-bold text-sm transition-all">
                <X className="w-4 h-4" /> 몰라요
              </button>
              <button onClick={handleKnow} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100 font-bold text-sm transition-all">
                <Check className="w-4 h-4" /> 알아요
              </button>
            </div>
          ) : (
            <button onClick={() => setFlipped(true)} className="btn-primary text-sm px-6">
              뒤집기
            </button>
          )}
          <button onClick={next} className="p-2 text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Has saved cards but no active session
  return (
    <div className="text-center py-6">
      <p className="font-bold text-slate-700 mb-1">{subjectCards.length}장의 플래시카드</p>
      <p className="text-slate-400 text-sm mb-4">복습 횟수: {subjectCards.reduce((a, c) => a + c.reviewCount, 0)}회</p>
      <div className="flex gap-2 justify-center">
        <button onClick={() => startSession(subjectCards)} className="btn-primary text-sm flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> 학습 시작
        </button>
        <button onClick={handleGenerate} disabled={generating || !currentExam} className="btn-secondary text-sm disabled:opacity-40">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : '카드 추가'}
        </button>
      </div>
    </div>
  );
}
