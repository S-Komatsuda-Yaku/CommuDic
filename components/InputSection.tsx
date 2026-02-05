import React, { useState, useRef } from 'react';
import {
  Type,
  ChevronRight,
  Loader2,
  Info,
  Sparkles,
  Upload,
  FileCheck,
  X,
  FileText,
} from 'lucide-react';
import { AnalysisInput, FileData } from '../types';

interface Props {
  onAnalyze: (input: AnalysisInput) => void;
  isLoading: boolean;
}

const InputSection: React.FC<Props> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<{ file: File; data: FileData }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini Developer API (2025-) only supports PDFs and plain text files as "document" inputs.
  // Other formats like .docx, .pptx, .xlsx work in AI Studio (Vertex) but are not accepted here,
  // which caused 400 errors such as "Unsupported MIME type" during composite analysis.
  const SUPPORTED_MIME_TYPES = ['application/pdf', 'text/plain'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allFiles = Array.from(e.target.files) as File[];

      const allowedFiles: File[] = [];
      const rejectedNames: string[] = [];

      allFiles.forEach((file) => {
        const type = file.type || '';
        if (SUPPORTED_MIME_TYPES.includes(type)) {
          allowedFiles.push(file);
        } else {
          rejectedNames.push(file.name);
        }
      });

      if (rejectedNames.length > 0) {
        // シンプルにブラウザ側でガードし、Gemini API への不正なリクエストを防ぐ
        alert(
          `以下のファイル形式は現在のAPIではサポートされていません。PDF（.pdf）またはテキスト（.txt）に変換してからアップロードしてください。\n\n` +
            rejectedNames.join('\n')
        );
      }

      if (allowedFiles.length === 0) return;

      const processed = await Promise.all(
        allowedFiles.map((file: File) => {
          return new Promise<{ file: File; data: FileData }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({
                file,
                data: {
                  base64,
                  mimeType: file.type || 'application/pdf',
                  fileName: file.name,
                },
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      setFiles((prev) => [...prev, ...processed]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      text: text.trim() || undefined,
      files: files.map((f) => f.data),
    });
  };

  const hasInput = !!text.trim() || files.length > 0;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-10 md:mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-400 text-[9px] md:text-[10px] font-black tracking-widest uppercase mb-2">
          <Sparkles size={12} />
          <span>Composite Multi-Input Analysis</span>
        </div>
        <h1 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tighter leading-tight px-2">
          複数の情報を、
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-violet-400">
            ひとつの物語
          </span>
          へ。
        </h1>
        <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed px-4">
          文章、資料を組み合わせて、
          <br className="hidden md:block" />
          多角的な人物解析を実現します。
        </p>
      </div>

      <div className="space-y-6">
        {/* Workspace Card */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] border border-slate-100 p-6 md:p-12 space-y-8 md:space-y-10">
          {/* Section 1: Text Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-black text-[11px] uppercase tracking-[0.2em]">
              <Type size={16} />
              <span>Free Description / 性格・エピソード</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="自分の強みや価値観、現在の取り組みなどを自由に記入..."
              className="w-full h-32 bg-slate-50/50 rounded-2xl p-6 text-slate-700 placeholder:text-slate-300 border border-slate-100 focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50/50 outline-none transition-all resize-none font-medium text-sm"
            />
          </div>

          {/* Section 2: File Multi-Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500 font-black text-[11px] uppercase tracking-[0.2em]">
              <FileText size={16} />
              <span>Documents / pdf</span>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-all group"
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt"
              />
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Upload size={20} className="text-green-500" />
                </div>
                <div className="text-[10px] font-black tracking-widest uppercase">
                  ファイルを選択またはドロップ
                </div>
              </div>
            </div>
          </div>

          {/* File List Display */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4">
              {files.map((f, i) => {
                const isPdf = f.file.name.toLowerCase().endsWith('.pdf');
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border group transition-all animate-in zoom-in-95 ${
                      isPdf
                        ? 'bg-green-50 border-green-100 text-green-600'
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    {isPdf ? <FileCheck size={14} /> : <FileText size={14} />}
                    <span className="text-[10px] font-black truncate max-w-[120px]">
                      {f.file.name}
                    </span>
                    {isPdf && (
                      <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded font-black tracking-tighter">
                        HQ
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Combined Info Panel */}
          <div className="bg-blue-50/30 rounded-2xl p-4 md:p-5 border border-blue-50/50 flex items-start gap-4">
            <div className="bg-white p-2 rounded-xl text-blue-400 shadow-sm flex-shrink-0">
              <Info size={16} />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold tracking-tight">
              AIは入力されたすべてのソースを読み込み、矛盾を解消しながら「あなた」という人物像を再構築します。
              <br className="hidden md:block" />
              <span className="text-blue-600 font-black underline decoration-blue-200">
                PDF形式の資料
              </span>
              を混ぜると、分析の根拠が強まり精度が向上します。
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !hasInput}
            className={`w-full py-4 md:py-5 rounded-full font-black text-base md:text-lg tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all ${
              isLoading || !hasInput
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-800 text-white shadow-2xl shadow-slate-200 hover:bg-slate-900 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>複合解析を開始する</span>
                <ChevronRight size={20} className="mt-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
