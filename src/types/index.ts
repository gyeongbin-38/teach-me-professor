export type LearningMode = 'quick' | 'balanced' | 'deep';

export interface ExamInfo {
  id: string;
  subject: string;
  examDate: string; // ISO string
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // extracted text
  uploadedAt: string;
}

export interface StudyPlan {
  id: string;
  examId: string;
  mode: LearningMode;
  totalDays: number;
  dailyPlans: DailyPlan[];
  createdAt: string;
  createdBy: 'opus'; // always Opus creates the plan
}

export interface DailyPlan {
  day: number;
  date: string;
  title: string;
  topics: string[];
  tasks: StudyTask[];
  estimatedMinutes: number;
}

export interface StudyTask {
  id: string;
  type: 'read' | 'quiz' | 'summary' | 'review' | 'practice';
  title: string;
  description: string;
  completed: boolean;
  content?: string; // AI-generated content
}

export interface QuizQuestion {
  id: string;
  type: 'multiple' | 'short' | 'ox';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AppState {
  exams: ExamInfo[];
  files: UploadedFile[];
  plans: StudyPlan[];
  currentExamId: string | null;
  currentMode: LearningMode;
  apiKey: string;
  isLoading: boolean;
  error: string | null;
}
