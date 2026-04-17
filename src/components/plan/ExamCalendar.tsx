import { useState } from 'react';
import { useExamStore } from '../../store/useExamStore';
import { differenceInDays } from 'date-fns';
import { CalendarDays, Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { ExamInfo } from '../../types';

export default function ExamCalendar() {
  const { exams, addExam, removeExam, setCurrentExam, currentExamId } = useExamStore();
  const [form, setForm] = useState({ subject: '', examDate: '' });
  const [open, setOpen] = useState(false);
  const today = new Date();

  const handleAdd = () => {
    if (!form.subject.trim() || !form.examDate) return;
    const exam: ExamInfo = {
      id: crypto.randomUUID(),
      subject: form.subject.trim(),
      examDate: new Date(form.examDate).toISOString(),
      createdAt: new Date().toISOString(),
    };
    addExam(exam);
    setCurrentExam(exam.id);
    setForm({ subject: '', examDate: '' });
    setOpen(false);
  };

  const dColor = (d: number) =>
    d < 0 ? 'text-slate-400' : d <= 3 ? 'text-red-600' : d <= 7 ? 'text-orange-500' : d <= 14 ? 'text-yellow-600' : 'text-green-600';

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">시험 일정</h3>
        <button onClick={() => setOpen(!open)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      {open && (
        <div className="bg-exam-50 border border-exam-200 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="과목명 (예: 자료구조, 거시경제학)"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-exam-400"
          />
          <div className="flex gap-2">
            <input
              type="date"
              min={minDate.toISOString().slice(0, 10)}
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-exam-400"
            />
            <button
              onClick={handleAdd}
              disabled={!form.subject.trim() || !form.examDate}
              className="btn-primary text-sm disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs">등록된 시험 없음</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map((exam) => {
            const d = differenceInDays(new Date(exam.examDate), today);
            const sel = exam.id === currentExamId;
            return (
              <div
                key={exam.id}
                onClick={() => setCurrentExam(exam.id)}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  sel ? 'border-exam-400 bg-exam-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-gray-900 text-sm">{exam.subject}</p>
                    {d >= 0 && d <= 7 && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(exam.examDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                  </p>
                </div>
                <div className={`text-right ${dColor(d)}`}>
                  <p className="font-black text-lg leading-none">
                    {d < 0 ? '종료' : d === 0 ? 'D-DAY' : `D-${d}`}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeExam(exam.id); }}
                  className="p-1 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
