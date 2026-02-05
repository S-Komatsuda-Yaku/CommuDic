import React, { useState } from 'react';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import { AnalysisResult, AnalysisInput } from './types';
import { analyzePersonality } from './services/geminiService';
import { Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastLogId, setLastLogId] = useState<string | null>(null);

  const handleAnalyze = async (input: AnalysisInput) => {
    setLoading(true);
    setError(null);
    let logId: string | null = null;
    try {
      // 1. Log activity to Supabase immediately (Satisfies "at the timing the button is pressed")
      const { data, error: logError } = await supabase
        .from('activity_logs')
        .insert({
          text_flg: !!input.text,
          url_flg: !!input.url,
          file_flg: input.files.length > 0,
          file_count: input.files.length,
          result_type: 'processing',
        })
        .select('id')
        .single();

      if (logError) {
        console.error('Failed to log activity:', logError);
      } else if (data) {
        logId = data.id;
        setLastLogId(logId);
      }

      // 2. Perform Gemini analysis
      const analysis = await analyzePersonality(input);
      setResult(analysis);

      // 3. Update log with final result type
      if (logId) {
        const { error: updateError } = await supabase
          .from('activity_logs')
          .update({ result_type: analysis.type })
          .eq('id', logId);

        if (updateError) {
          console.error('Failed to update activity log:', updateError);
        }
      }
    } catch (err: any) {
      console.error('Gemini API error:', err);

      let message = '複合解析中にエラーが発生しました。';

      // よくあるパターンを人間が分かるメッセージに変換
      const status = err?.status ?? err?.response?.status;
      const errMsg = err?.message ?? err?.response?.statusText;

      if (status === 401 || status === 403) {
        message +=
          '\nAPIキーが無効か、権限が不足している可能性があります。`GEMINI_API_KEY` を確認してください。';
      } else if (status === 400) {
        message +=
          '\n入力形式（URL・ファイル形式など）が現在のAPI仕様と合っていない可能性があります。PDF かテキストのみ、または文章入力のみでお試しください。';
      } else if (status === 429) {
        message +=
          '\nGemini API の無料枠または現在のクォータを使い切っています。AI Studio でレートリミットと課金設定を確認してください。';
      }

      if (import.meta.env.DEV && errMsg) {
        message += `\n\n[開発用メモ] ${errMsg}`;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] selection:bg-rose-50 selection:text-rose-500 pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-[10%] -left-[5%] w-[60%] md:w-[40%] h-[40%] bg-rose-100 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[50%] md:w-[35%] h-[35%] bg-blue-50 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <nav className="relative z-10 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={handleReset}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Sparkles size={16} className="text-white md:hidden" />
            <Sparkles size={20} className="text-white hidden md:block" />
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-800">
            CommuDic
          </span>
        </div>
        <div className="flex gap-4 md:gap-8 items-center">
          <span className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-widest uppercase bg-slate-50 px-2 py-1 rounded-md md:bg-transparent md:p-0">
            v1.0.0
          </span>
        </div>
      </nav>

      <main className="relative z-10 px-4">
        {error && (
          <div className="max-w-xl mx-auto mb-8 p-5 bg-white border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-500 text-sm shadow-xl shadow-rose-500/5 animate-in slide-in-from-top duration-500">
            <div className="bg-rose-50 p-2 rounded-full">
              <AlertCircle size={20} />
            </div>
            <span className="font-bold">{error}</span>
          </div>
        )}

        {!result ? (
          <InputSection onAnalyze={handleAnalyze} isLoading={loading} />
        ) : (
          <ResultCard result={result} onReset={handleReset} logId={lastLogId} />
        )}
      </main>
    </div>
  );
};

export default App;
