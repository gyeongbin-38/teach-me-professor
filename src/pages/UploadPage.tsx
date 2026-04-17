import { useStore } from '../store/useStore';
import FileUploadZone from '../components/upload/FileUploadZone';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const { files } = useStore();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">학습 자료 업로드</h1>
        <p className="text-gray-500">강의 자료, 교재, 필기 노트 등을 업로드하면 AI가 분석하여 맞춤 학습 플랜을 만들어 드립니다.</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI 분석 방식</h2>
            <p className="text-sm text-gray-500 mt-1">업로드한 자료를 바탕으로 핵심 개념을 추출하고, Claude Opus가 최적의 학습 순서와 일정을 설계합니다.</p>
          </div>
        </div>
        <FileUploadZone />
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
