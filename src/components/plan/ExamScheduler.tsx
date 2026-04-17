import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { differenceInDays } from 'date-fns';
import { Calendar, Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { ExamInfo } from '../../types';

export default function ExamScheduler() {
  const { exams, addExam, removeExam, setCurrentExam, currentExamId } = useStore();
  const [form, setForm] = useState({ subject: '', examDate: '' });
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
  };

  const getDaysLeft = (examDate: string) => {
    return differenceInDays(new Date(examDate), today);
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-gray-400';
    if (days <= 3) return 'text-red-600';
    if (days <= 7) return 'text-orange-500';
    if (days <= 14) return 'text-yellow-600';
    return 'text-green-600';
  };


  // Get minimum date (tomorrow)
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">시험 일정</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-1.5 text-sm py-1.5"
        >
          <Plus className="w-4 h-4" />
          시험 추가
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-blue-900">새 시험 등록</h4>
          <input
            type="text"
            placeholder="과목명 (예: 운영체제, 미시경제학)"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <input
              type="date"
              min={minDateStr}
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAdd}
              disabled={!form.subject.trim() || !form.examDate}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">등록된 시험이 없습니다</p>
          <p className="text-xs mt-1">위의 "시험 추가" 버튼을 눌러 시작하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map((exam) => {
            const daysLeft = getDaysLeft(exam.examDate);
            const isSelected = exam.id === currentExamId;
            return (
              <div
                key={exam.id}
                onClick={() => setCurrentExam(exam.id)}
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{exam.subject}</p>
                    {daysLeft <= 7 && daysLeft >= 0 && (
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(exam.examDate).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
                    })}
                  </p>
                </div>
                <div className={`text-right ${getUrgencyColor(daysLeft)}`}>
                  <p className="font-bold text-lg">
                    {daysLeft < 0 ? '종료' : daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`}
                  </p>
                  <p className="text-xs opacity-70">
                    {daysLeft < 0 ? '시험 완료' : `${daysLeft}일 남음`}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeExam(exam.id); }}
                  className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
