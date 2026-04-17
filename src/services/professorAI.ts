import { OR_MODELS, orComplete } from './openRouterClient';
import type { StudyPlan, LearningMode, DailyPlan, StudyTask, QuizQuestion, UploadedFile, ExamInfo } from '../types';
import type { Flashcard } from '../types';

const modeConfig = {
  quick:    { model: OR_MODELS.quick,    planModel: OR_MODELS.planner, label: '⚡ 빠른 학습', intensity: '핵심 개념과 자주 출제되는 내용만 빠르게', dailyHours: 2 },
  balanced: { model: OR_MODELS.balanced, planModel: OR_MODELS.planner, label: '📖 균형 학습', intensity: '개념 이해와 문제 풀이를 균형 있게', dailyHours: 4 },
  deep:     { model: OR_MODELS.deep,     planModel: OR_MODELS.planner, label: '🧠 심화 학습', intensity: '모든 개념을 깊이 이해하고 응용 문제까지', dailyHours: 6 },
} as const;

export async function buildStudyPlan(
  apiKey: string,
  exam: ExamInfo,
  materials: UploadedFile[],
  mode: LearningMode,
): Promise<StudyPlan> {
  const cfg = modeConfig[mode];
  const today = new Date();
  const examDate = new Date(exam.examDate);
  const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / 86_400_000));

  const materialSummary = materials.map((m) => `[${m.name}]\n${m.content.slice(0, 3000)}`).join('\n\n---\n\n');

  const prompt = `당신은 대학교 시험 전문 학습 전략가입니다.

## 시험 정보
- 과목: ${exam.subject}
- 시험일: ${exam.examDate.slice(0, 10)}
- 남은 일수: ${daysLeft}일
- 학습 모드: ${cfg.label}
- 학습 방침: ${cfg.intensity}
- 하루 목표: ${cfg.dailyHours}시간

## 강의 자료
${materialSummary}

## 출력 (JSON만)
{"dailyPlans":[{"day":1,"date":"YYYY-MM-DD","title":"제목","topics":["주제1"],"tasks":[{"id":"t1-1","type":"read","title":"제목","description":"설명","completed":false}],"estimatedMinutes":120}]}

type: "read"|"quiz"|"summary"|"review"|"practice". 마지막 1~2일은 전체 복습.`;

  const raw = await orComplete(apiKey, cfg.planModel, prompt, 4096);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('플랜 파싱 실패. API 키를 확인하세요.');

  const parsed = JSON.parse(match[0]);
  const dailyPlans: DailyPlan[] = parsed.dailyPlans.map((d: any, i: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return { ...d, date: date.toISOString().slice(0, 10), tasks: d.tasks.map((t: any) => ({ ...t, id: t.id || crypto.randomUUID() })) };
  });

  return { id: crypto.randomUUID(), examId: exam.id, mode, totalDays: daysLeft, dailyPlans, createdAt: new Date().toISOString(), createdBy: 'opus' };
}

export async function generateTaskContent(apiKey: string, task: StudyTask, context: string, mode: LearningMode): Promise<string> {
  const model = modeConfig[mode].model;
  const depth = mode === 'quick' ? '핵심만 2~3문장' : mode === 'deep' ? '배경·원리·응용까지 상세히' : '이해하기 쉽게 예시 포함';
  const prompts: Record<StudyTask['type'], string> = {
    read:     `다음 내용을 ${depth} 설명:\n\n${task.description}\n\n참고:\n${context.slice(0, 2000)}`,
    summary:  `시험 대비 핵심 요약 (마크다운):\n\n${task.description}\n\n참고:\n${context.slice(0, 2000)}`,
    review:   `복습 포인트 정리:\n\n${task.description}\n\n참고:\n${context.slice(0, 2000)}`,
    quiz:     `연습 문제 3개:\n\n${task.description}`,
    practice: `심화 연습 문제와 풀이:\n\n${task.description}`,
  };
  return orComplete(apiKey, model, prompts[task.type], 2048);
}

export async function generateQuiz(apiKey: string, context: string, subject: string, mode: LearningMode, count = 5): Promise<QuizQuestion[]> {
  const model = modeConfig[mode].model;
  const diff = mode === 'quick' ? 'easy' : mode === 'deep' ? 'hard' : 'medium';
  const diffKo = diff === 'easy' ? '쉬움' : diff === 'hard' ? '어려움' : '보통';
  const prompt = `${subject} 시험 대비 퀴즈 ${count}개 (난이도: ${diffKo})\n\n참고:\n${context.slice(0, 3000)}\n\nJSON만: [{"id":"q1","type":"multiple","question":"문제","options":["①","②","③","④"],"answer":"①","explanation":"해설","difficulty":"${diff}"}]`;
  const raw = await orComplete(apiKey, model, prompt, 2048);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch { return []; }
}

export async function generateFlashcards(apiKey: string, context: string, subject: string, mode: LearningMode, count = 10): Promise<Flashcard[]> {
  const model = modeConfig[mode].model;
  const diff = mode === 'quick' ? 'easy' : mode === 'deep' ? 'hard' : 'medium';
  const prompt = `${subject} 플래시카드 ${count}장\n\n참고:\n${context.slice(0, 3000)}\n\nJSON만: [{"id":"fc1","front":"앞면","back":"뒷면","subject":"${subject}","difficulty":"${diff}","reviewCount":0,"lastReviewed":null}]`;
  const raw = await orComplete(apiKey, model, prompt, 2048);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch { return []; }
}
