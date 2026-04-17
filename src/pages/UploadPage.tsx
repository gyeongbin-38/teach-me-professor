import { useExamStore } from '../store/useExamStore';
import MaterialDropZone from '../components/upload/MaterialDropZone';
import { FolderUp, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const { files } = useExamStore();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
          <FolderUp className="w-7 h-7 text-exam-600" />
          자료 올리기
        </h1>
        <p className="text-slate-500 text-sm">강의 슬라이드, 교재, 필기 노트를 올리면 AI가 분석해 맞춤 학습 플랜을 만들어 드려요.</p>
      </div>

      <div className="card-exam mb-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 bg-exam-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-exam-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">어떻게 분석되나요?</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              PDF·DOCX 텍스트를 자동 추출 → 핵심 개념 파악 → Claude Opus가 최적 학습 순서 설계
            </p>
          </div>
        </div>
        <MaterialDropZone />
      </div>

      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/plan')}
            className="btn-primary flex items-center gap-2"
          >
            학습 플랜 만들기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
