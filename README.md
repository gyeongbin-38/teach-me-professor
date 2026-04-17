# DeepTutor — AI 기반 대학 시험 대비 학습 플랫폼

대학 중간고사·기말고사를 위한 AI 맞춤 학습 서비스입니다.

## 주요 기능

- **파일 업로드** — PDF, TXT, DOCX 형식의 강의 자료 업로드 및 텍스트 추출
- **AI 학습 플랜** — Claude Opus가 시험일 기준으로 최적의 일별 학습 계획 수립
- **3가지 학습 모드**
  - ⚡ 빠른 학습 (Claude Haiku) — 핵심만 빠르게
  - 📖 균형 학습 (Claude Sonnet) — 표준 학습
  - 🧠 심화 학습 (Claude Sonnet) — 완벽 이해
- **시험 일정 관리** — D-Day 카운트다운 및 긴급도 시각화
- **퀴즈 시스템** — 객관식, O/X, 단답형 문제 자동 생성
- **AI Q&A** — 스트리밍 방식의 실시간 질의응답

## 시작하기

```bash
npm install
npm run dev
```

앱 내 **설정** 페이지에서 Anthropic API 키를 입력하세요.

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS
- Zustand (상태 관리)
- @anthropic-ai/sdk (Claude API)
- pdfjs-dist (PDF 파싱)
- react-dropzone (파일 업로드)
- date-fns (날짜 계산)
- lucide-react (아이콘)

## 모델 구성

| 용도 | 모델 |
|------|------|
| 학습 플랜 수립 | Claude Opus 4.7 |
| 심화/균형 학습 | Claude Sonnet 4.6 |
| 빠른 학습/퀴즈 | Claude Haiku 4.5 |
