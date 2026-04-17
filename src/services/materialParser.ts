import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// pdfjs-dist v5 uses .mjs worker — use local module URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export async function parseMaterial(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  try {
    if (ext === 'pdf') return await parsePdf(file);
    if (ext === 'docx' || ext === 'doc') return await parseDocx(file);
    return await readPlainText(file);
  } catch (err: any) {
    throw new Error(`"${file.name}" 파싱 실패: ${err.message ?? '알 수 없는 오류'}`);
  }
}

async function parsePdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const chunks: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const line = tc.items.map((it: any) => it.str ?? '').join(' ');
    if (line.trim()) chunks.push(line);
  }

  return chunks.join('\n\n');
}

async function parseDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  // mammoth browser API
  const result = await (mammoth as any).extractRawText({ arrayBuffer: buffer });
  return result.value ?? '';
}

function readPlainText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? '');
    reader.onerror = () => reject(new Error('텍스트 파일 읽기 실패'));
    reader.readAsText(file, 'utf-8');
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function fileEmoji(mime: string): string {
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('word') || mime.includes('doc')) return '📝';
  if (mime.includes('text')) return '📃';
  if (mime.includes('image')) return '🖼️';
  return '📎';
}
