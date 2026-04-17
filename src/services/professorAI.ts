import Anthropic from '@anthropic-ai/sdk';
import type { StudyPlan, LearningMode, DailyPlan, StudyTask, QuizQuestion, UploadedFile, ExamInfo } from '../types';

function client(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

const modeConfig = {
  quick: {
    model: 'claude-haiku-4-5-20251001' as const,
    planModel: 'claude-opus-4-7' as const,
    label: '⚡ 빠른 학습',
    intensity: '핵심 개념과 자주 출제되는 내용만 빠르게',
    dailyHours: 2,
  },
  balanced: {
    model: 'claude-sonnet-4-6' as const,
    planModel: 'claude-opus-4-7' as const,
    label: '📖 균형 학습',
    intensity: '개념 이해와 문제 풀이를 균형 있게',
    dailyHours: 4,
  },
  deep: {
    model: 'claude-sonnet-4-6' as const,
    planModel: 'claude-opus-4-7' as const,
    label: '🧠 심화 학습',
    intensity: '모든 개념을 깊이 이해하고 응용 문제까지',
    dailyHours: 6,
  },
} as const;

export async function buildStudyPlan(
  apiKey: string,
  exam: ExamInfo,
  materials: UploadedFile[],
  mode: LearningMode,
): Promise<StudyPlan> {
  const ai = client(apiKey);
  const cfg = modeConfig[mode];
  const today = new Date();
  const examDate = new Date(exam.examDate);
  const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / 86_400_000));

  const materialSummary = materials
    .map((m) => `[${m.name}]\n${m.content.slice(0, 3000)}`)
    .join('\n\n---\n\n');

  const prompt = `당신은 대학교 시험 전문 학습 전략가입니다. 아래 조건으로 최적의 학습 플랜을 설계하세요.

## 시험 정보
- 과목: ${exam.subject}
- 시험일: ${exam.examDate.slice(0, 10)}
- 남은 일수: ${daysLeft}일
- 학습 모드: ${cfg.label}
- 학습 방침: ${cfg.intensity}
- 하루 목표: ${cfg.dailyHours}시간

## 강의 자료
${materialSummary}

## 출력 (JSON만, 다른 텍스트 금지)
{
  "dailyPlans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "1일차 학습 주제",
      "topics": ["주제1", "주제2"],
      "tasks": [
        {
          "id": "t1-1",
          "type": "read",
          "title": "과제 제목",
          "description": "구체적인 학습 내용 설명",
          "completed": false
        }
      ],
      "estimatedMinutes": 120
    }
  ]
}

규칙:
- type: "read" | "quiz" | "summary" | "review" | "practice"
- 마지막 1~2일은 전체 복습
- ${daysLeft}일 전체에 걸쳐 단계적으로 구성`;

  const res = await ai.messages.create({
    model: cfg.planModel,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = res.content[0].type === 'text' ? res.content[0].text : '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('플랜 파싱 실패. API 키를 확인하세요.');

  const parsed = JSON.parse(match[0]);
  const dailyPlans: DailyPlan[] = parsed.dailyPlans.map((d: any, i: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      ...d,
      date: date.toISOString().slice(0, 10),
      tasks: d.tasks.map((t: any) => ({ ...t, id: t.id || crypto.randomUUID() })),
    };
  });

  return {
    id: crypto.randomUUID(),
    examId: exam.id,
    mode,
    totalDays: daysLeft,
    dailyPlans,
    createdAt: new Date().toISOString(),
    createdBy: 'opus',
  };
}

export async function generateTaskContent(
  apiKey: string,
  task: StudyTask,
  context: string,
  mode: LearningMode,
): Promise<string> {
  const ai = client(apiKey);
  const model = modeConfig[mode].model;
  const depth = mode === 'quick' ? '핵심만 2~3문장으로' : mode === 'deep' ? '배경·원리·응용까지 상세히' : '이해하기 쉽게 예시 포함';

  const prompts: Record<StudyTask['type'], string> = {
    read:     `다음 내용을 ${depth} 설명해주세요:\n\n${task.description}\n\n참고 자료:\n${context.slice(0, 2000)}`,
    summary:  `다음 내용을 시험 대비 핵심 요약으로 정리해주세요 (마크다운):\n\n${task.description}\n\n참고 자료:\n${context.slice(0, 2000)}`,
    review:   `다음 내용의 복습 포인트를 정리해주세요:\n\n${task.description}\n\n참고 자료:\n${context.slice(0, 2000)}`,
    quiz:     `다음 주제로 연습 문제 3개를 만들어 주세요:\n\n${task.description}`,
    practice: `다음 주제로 심화 연습 문제와 풀이를 만들어 주세요:\n\n${task.description}`,
  };

  const res = await ai.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompts[task.type] }],
  });

  return res.content[0].type === 'text' ? res.content[0].text : '';
}

export async function generateQuiz(
  apiKey: string,
  context: string,
  subject: string,
  mode: LearningMode,
  count = 5,
): Promise<QuizQuestion[]> {
  const ai = client(apiKey);
  const model = modeConfig[mode].model;
  const diff = mode === 'quick' ? 'easy' : mode === 'deep' ? 'hard' : 'medium';
  const diffKo = diff === 'easy' ? '쉬움' : diff === 'hard' ? '어려움' : '보통';

  const prompt = `${subject} 시험 대비 퀴즈 ${count}개를 만들어 주세요.
난이도: ${diffKo}

참고 자료:
${context.slice(0, 3000)}

JSON만 출력 (다른 텍스트 없이):
[
  {
    "id": "q1",
    "type": "multiple",
    "question": "문제",
    "options": ["①선지1", "②선지2", "③선지3", "④선지4"],
    "answer": "①선지1",
    "explanation": "해설",
    "difficulty": "${diff}"
  }
]
type은 "multiple" | "ox" | "short" 중 하나.`;

  const res = await ai.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = res.content[0].type === 'text' ? res.content[0].text : '[]';
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch { return []; }
}
