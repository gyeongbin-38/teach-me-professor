import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ExamInfo, UploadedFile, StudyPlan, LearningMode } from '../types';

interface Actions {
  setApiKey: (key: string) => void;
  addExam: (exam: ExamInfo) => void;
  removeExam: (id: string) => void;
  setCurrentExam: (id: string | null) => void;
  addFile: (file: UploadedFile) => void;
  removeFile: (id: string) => void;
  addPlan: (plan: StudyPlan) => void;
  setMode: (mode: LearningMode) => void;
  completeTask: (planId: string, dayIndex: number, taskId: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useExamStore = create<AppState & Actions>()(
  persist(
    (set) => ({
      exams: [],
      files: [],
      plans: [],
      currentExamId: null,
      currentMode: 'balanced',
      apiKey: '',
      isLoading: false,
      error: null,

      setApiKey: (key) => set({ apiKey: key }),
      addExam: (exam) => set((s) => ({ exams: [...s.exams, exam] })),
      removeExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
      setCurrentExam: (id) => set({ currentExamId: id }),
      addFile: (file) => set((s) => ({ files: [...s.files, file] })),
      removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
      addPlan: (plan) => set((s) => ({ plans: [...s.plans, plan] })),
      setMode: (mode) => set({ currentMode: mode }),
      completeTask: (planId, dayIndex, taskId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId ? p : {
              ...p,
              dailyPlans: p.dailyPlans.map((d, i) =>
                i !== dayIndex ? d : {
                  ...d,
                  tasks: d.tasks.map((t) => t.id === taskId ? { ...t, completed: true } : t)
                }
              )
            }
          )
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: 'exam-app-storage' }
  )
);
