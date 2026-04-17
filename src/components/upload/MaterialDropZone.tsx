import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FolderUp, X, AlertCircle, Loader2 } from 'lucide-react';
import { useExamStore } from '../../store/useExamStore';
import { parseMaterial, formatBytes, fileEmoji } from '../../services/materialParser';
import type { UploadedFile } from '../../types';

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt', '.md'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
};

export default function MaterialDropZone() {
  const { files, addFile, removeFile } = useExamStore();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    setError(null);
    setUploading(true);

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i];
      setProgress(`처리 중 ${i + 1}/${accepted.length}: ${file.name}`);
      try {
        const content = await parseMaterial(file);
        const item: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
          uploadedAt: new Date().toISOString(),
        };
        addFile(item);
      } catch (e: any) {
        setError(e.message ?? '파일 처리 실패');
      }
    }

    setUploading(false);
    setProgress('');
  }, [addFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejected) => {
      const reasons = rejected.map((r) => r.errors.map((e) => e.message).join(', ')).join('\n');
      setError(`업로드 거부됨: ${reasons}`);
    },
  });

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none ${
          isDragActive
            ? 'border-exam-400 bg-exam-50 scale-[1.01]'
            : 'border-slate-300 hover:border-exam-300 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragActive ? 'bg-exam-100' : 'bg-slate-100'
          }`}>
            {uploading
              ? <Loader2 className="w-8 h-8 text-exam-500 animate-spin" />
              : <FolderUp className={`w-8 h-8 ${isDragActive ? 'text-exam-600' : 'text-slate-400'}`} />
            }
          </div>

          {uploading ? (
            <div className="space-y-2">
              <p className="text-slate-700 font-semibold">파싱 중...</p>
              <p className="text-xs text-slate-500">{progress}</p>
              <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-exam-500 rounded-full animate-pulse-slow w-2/3" />
              </div>
            </div>
          ) : (
            <div>
              <p className="font-bold text-slate-700 text-lg">
                {isDragActive ? '놓으면 바로 분석 시작!' : '강의자료를 드래그하거나 클릭'}
              </p>
              <p className="text-slate-400 text-sm mt-1">PDF · DOCX · TXT · MD &nbsp;|&nbsp; 최대 50MB</p>
              {!isDragActive && (
                <span className="inline-block mt-4 btn-primary text-sm pointer-events-none">
                  파일 선택
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm whitespace-pre-wrap">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            업로드된 자료 ({files.length}개)
          </p>
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-exam-200 transition-colors"
              >
                <span className="text-xl flex-shrink-0">{fileEmoji(f.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(f.size)} &nbsp;·&nbsp; {f.content.length.toLocaleString()}자 추출
                  </p>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
