import Anthropic from '@anthropic-ai/sdk';
import type { StudyPlan, LearningMode, DailyPlan, StudyTask, QuizQuestion, UploadedFile, ExamInfo } from '../types';

function getClient(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// MODE CONFIGURATIONS
const modeConfig = {
  quick: {
    model: 'claude-haiku-4-5-20251001' as const,
    plannerModel: 'claude-opus-4-7' as const,
    description: '빠른 학습 (핵심만)',
    intensity: '핵심 개념과 자주 출제되는 내용 위주로 빠르게',
    dailyHours: 2,
  },
  balanced: {
    model: 'claude-sonnet-4-6' as const,
    plannerModel: 'claude-opus-4-7' as const,
    description: '균형 학습 (표준)',
    intensity: '개념 이해와 문제 풀이를 균형있게',
    dailyHours: 4,
  },
  deep: {
    model: 'claude-sonnet-4-6' as const,
    plannerModel: 'claude-opus-4-7' as const,
    description: '심화 학습 (완전 마스터)',
    intensity: '모든 개념을 깊이 이해하고 응용 문제까지',
    dailyHours: 6,
  },
};

export async function createStudyPlan(
  apiKey: string,
  exam: ExamInfo,
  files: UploadedFile[],
  mode: LearningMode,
): Promise<StudyPlan> {
  const client = getClient(apiKey);
  const config = modeConfig[mode];
  const today = new Date();
  const examDate = new Date(exam.examDate);
  const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const filesSummary = files
    .map((f) => `[${f.name}]\n${f.content.slice(0, 3000)}`)
    .join('\n\n---\n\n');

  const prompt = `당신은 대학교 시험 전문 학습 플래너입니다. 다음 조건으로 최적의 학습 플랜을 만들어주세요.

## 시험 정보
- 과목: ${exam.subject}
- 시험일: ${exam.examDate.slice(0, 10)}
- 남은 일수: ${daysLeft}일
- 학습 모드: ${config.description}
- 학습 방식: ${config.intensity}
- 하루 목표 학습량: ${config.dailyHours}시간

## 학습 자료 내용
${filesSummary}

## 출력 형식 (반드시 JSON만 출력, 다른 텍스트 없이)
{
  "dailyPlans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "1일차 학습 주제",
      "topics": ["주제1", "주제2"],
      "tasks": [
        {
          "id": "task-1-1",
          "type": "read",
          "title": "과제 제목",
          "description": "구체적인 학습 내용",
          "completed": false
        }
      ],
      "estimatedMinutes": 120
    }
  ]
}

task type은 "read", "quiz", "summary", "review", "practice" 중 하나.
${daysLeft}일 동안 단계적으로 학습할 수 있도록 설계하세요.
마지막 1-2일은 반드시 전체 복습으로 구성하세요.`;

  const response = await client.messages.create({
    model: config.plannerModel,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('플랜 생성에 실패했습니다.');

  const parsed = JSON.parse(jsonMatch[0]);

  // Calculate dates from today
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
  const client = getClient(apiKey);
  const model = modeConfig[mode].model;

  const prompts: Record<StudyTask['type'], string> = {
    read: `다음 내용을 "${mode === 'quick' ? '핵심만 간단히' : mode === 'deep' ? '상세하게 깊이있게' : '이해하기 쉽게'}" 설명해주세요:\n\n${task.description}\n\n자료:\n${context.slice(0, 2000)}`,
    summary: `다음 내용을 시험 대비 핵심 요약으로 정리해주세요 (마크다운 형식):\n\n${task.description}\n\n자료:\n${context.slice(0, 2000)}`,
    review: `다음 내용의 복습 포인트를 정리해주세요:\n\n${task.description}\n\n자료:\n${context.slice(0, 2000)}`,
    quiz: `다음 주제로 연습 문제 3개를 만들어주세요:\n\n${task.description}`,
    practice: `다음 주제로 심화 연습 문제와 풀이를 만들어주세요:\n\n${task.description}`,
  };

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompts[task.type] }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateQuiz(
  apiKey: string,
  content: string,
  subject: string,
  mode: LearningMode,
  count: number = 5,
): Promise<QuizQuestion[]> {
  const client = getClient(apiKey);
  const model = modeConfig[mode].model;
  const difficulty = mode === 'quick' ? 'easy' : mode === 'deep' ? 'hard' : 'medium';

  const prompt = `${subject} 시험 대비 퀴즈 ${count}개를 만들어주세요.
난이도: ${difficulty === 'easy' ? '쉬움' : difficulty === 'hard' ? '어려움' : '보통'}

자료:
${content.slice(0, 3000)}

JSON 형식으로만 출력 (다른 텍스트 없이):
[
  {
    "id": "q1",
    "type": "multiple",
    "question": "문제",
    "options": ["①", "②", "③", "④"],
    "answer": "①",
    "explanation": "해설",
    "difficulty": "${difficulty}"
  }
]

type은 "multiple"(객관식), "ox"(O/X), "short"(단답형) 중 하나.`;

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

export async function explainConcept(
  apiKey: string,
  concept: string,
  context: string,
  mode: LearningMode,
): Promise<string> {
  const client = getClient(apiKey);
  const model = modeConfig[mode].model;

  const depthGuide = mode === 'quick'
    ? '핵심만 2-3문장으로 간단히'
    : mode === 'deep'
    ? '배경, 원리, 응용까지 상세하게'
    : '이해하기 쉽게 예시를 들어';

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `"${concept}"에 대해 ${depthGuide} 설명해주세요.\n\n참고 자료:\n${context.slice(0, 1000)}`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
