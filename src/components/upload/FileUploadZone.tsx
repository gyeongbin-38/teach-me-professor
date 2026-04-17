import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { extractTextFromFile, formatFileSize, getFileIcon } from '../../services/fileService';
import type { UploadedFile } from '../../types';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export default function FileUploadZone() {
  const { files, addFile, removeFile } = useStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    setError(null);
    setUploading(true);

    try {
      for (const file of accepted) {
        const content = await extractTextFromFile(file);
        const uploadedFile: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
          uploadedAt: new Date().toISOString(),
        };
        addFile(uploadedFile);
      }
    } catch (e) {
      setError('파일 처리 중 오류가 발생했습니다. 다른 형식을 시도해보세요.');
    } finally {
      setUploading(false);
    }
  }, [addFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: () => setError('지원하지 않는 파일 형식이거나 크기가 너무 큽니다 (최대 50MB).'),
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragActive ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
          </div>
          {uploading ? (
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">처리 중...</p>
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-gray-700 font-medium text-lg">
                  {isDragActive ? '여기에 파일을 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
                </p>
                <p className="text-gray-400 text-sm mt-1">PDF, TXT, DOCX 지원 · 최대 50MB</p>
              </div>
              <button className="btn-primary text-sm">파일 선택하기</button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">업로드된 파일 ({files.length}개)</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)} · {file.content.length.toLocaleString()}자 추출됨</p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
