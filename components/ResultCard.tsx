
import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import RadarChart from './RadarChart';
import {
  Quote, Briefcase, Heart, MapPin, Zap, Users, MessageCircle,
  Download, Instagram, Copy, Check, Loader2, Image as ImageIcon, FileText
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { supabase } from '../services/supabaseClient';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  logId: string | null;
}

// Correct X (formerly Twitter) Icon SVG path
const XIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ResultCard: React.FC<Props> = ({ result, onReset, logId }) => {
  const [copied, setCopied] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Function to filter out interactive elements during capture
  const filter = (node: HTMLElement) => {
    const exclusionClasses = ['no-capture'];
    return !exclusionClasses.some((cls) => node.classList?.contains(cls));
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setIsSavingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#fdfcfe',
        filter: filter,
        pixelRatio: 3, // Very high quality for sharing
        style: { borderRadius: '3.5rem' }
      });
      const link = document.createElement('a');
      link.download = `CommuDic_Card_${result.type}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save image', err);
      alert('画像の生成に失敗しました。スクリーンショットをお試しください。');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSavePdf = async () => {
    if (!cardRef.current) return;
    setIsSavingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        filter: filter,
        pixelRatio: 2
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (cardRef.current.offsetHeight * imgWidth) / cardRef.current.offsetWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`CommuDic_Profile_${result.type}.pdf`);
    } catch (err) {
      console.error('Failed to save PDF', err);
      // Fallback to native print if jspdf fails
      window.print();
    } finally {
      setIsSavingPdf(false);
    }
  };

  const handleCopyText = () => {
    const text = `CommuDicで生成した私の人物図鑑カード！\n\n"${result.catchphrase}"\n分析タイプ: ${result.type}\n#CommuDic #AI人物図鑑`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToX = async () => {
    const text = encodeURIComponent(`CommuDicで私の「人物図鑑」を生成しました！\n\n"${result.catchphrase}"\n\n#CommuDic #AI人物分析`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');

    if (logId) {
      await supabase
        .from('activity_logs')
        .update({ sns_shared: true, platform: 'X' })
        .eq('id', logId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:p-0">
      <div
        ref={cardRef}
        id="capture-card"
        className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-50 relative p-6 md:p-14 space-y-10 md:space-y-14 print:shadow-none print:border-none print:rounded-none"
      >
        {/* Header catchphrase */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 border-b border-slate-50 pb-8 md:pb-10">
          <div className="bg-rose-50 p-3 md:p-4 rounded-2xl md:rounded-3xl flex-shrink-0">
            <Quote className="text-rose-400 rotate-180" size={24} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">
              "{result.catchphrase}"
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <span className="text-slate-400 text-[9px] md:text-[10px] font-black tracking-widest uppercase">AI Profiling Synthesis</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] md:text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded tracking-tighter uppercase">
                  TYPE: {result.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-50 shadow-inner">
              <div className="flex items-center gap-2 mb-4 md:mb-6 justify-center">
                <Zap className="text-rose-400" size={18} />
                <h3 className="text-xs font-black text-slate-700 tracking-widest uppercase">Core Balance</h3>
              </div>
              <div className="w-full aspect-square max-w-[280px] md:max-w-[320px] mx-auto">
                <RadarChart scores={result.scores} />
              </div>
            </div>

            <div className="bg-[#FFFBEB] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-yellow-100/50">
              <h3 className="text-xs font-black text-slate-500 mb-4 md:mb-6 uppercase tracking-widest">Profile Summary</h3>
              <p className="text-slate-600 text-sm leading-loose font-medium">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 space-y-10">
            {/* 業務適性 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#EFF6FF] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-blue-100/50 shadow-sm">
              <div className="md:col-span-2 flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-xl shadow-sm text-blue-500">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Professional: 業務適性</h3>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] md:text-[11px] font-black text-blue-500 uppercase tracking-widest">Work Style</p>
                <p className="text-slate-700 text-sm font-bold leading-relaxed">{result.businessAptitude.workStyle}</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest">Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {result.businessAptitude.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white text-slate-600 text-[10px] font-bold rounded-full border border-blue-50 shadow-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest">Suitable Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {result.businessAptitude.suitableRoles.map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-md shadow-blue-200">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 人・コミュニティ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FDF2F8] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-rose-100/50 shadow-sm">
              <div className="md:col-span-2 flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-xl shadow-sm text-rose-500">
                  <Users size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal: 人・コミュニティ</h3>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] md:text-[11px] font-black text-rose-500 uppercase tracking-widest">Social Style</p>
                <p className="text-slate-700 text-sm font-bold leading-relaxed">{result.personCommunity.socialStyle}</p>
                <div className="pt-2">
                  <p className="text-[10px] md:text-[11px] font-black text-rose-400 uppercase tracking-widest mb-3">Core Values</p>
                  <ul className="space-y-2">
                    {result.personCommunity.values.map((v, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 text-[11px] font-medium italic">
                        <Heart size={10} className="text-rose-300" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/60 p-5 rounded-2xl border border-rose-50 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <MessageCircle size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Interaction Tip</p>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium leading-loose italic">{result.personCommunity.interactionTips}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg text-white">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Optimal Environment</p>
                    <p className="text-slate-700 text-xs font-black">{result.personCommunity.optimalPlace}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 md:pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 print:hidden no-capture">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 order-2 md:order-1">
            <button
              onClick={shareToX}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <XIcon size={14} />
              <span>Share to X</span>
            </button>
            <button
              onClick={handleSaveImage}
              disabled={isSavingImage}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isSavingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
              <span>{isSavingImage ? 'Processing...' : 'Save for SNS'}</span>
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto order-1 md:order-2">
            <button
              onClick={handleSavePdf}
              disabled={isSavingPdf}
              className="flex-1 md:flex-none px-6 md:px-8 py-3 bg-rose-500 text-white text-xs font-black rounded-full hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSavingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{isSavingPdf ? 'PDF' : 'PDF保存'}</span>
            </button>
            <button
              onClick={onReset}
              className="px-6 md:px-8 py-3 border border-slate-200 text-slate-400 text-xs font-black rounded-full hover:bg-slate-50 transition-all"
            >
              再試行
            </button>
          </div>
        </div>
      </div>

      {/* Social Banner */}
      <div className="mt-10 flex flex-col items-center gap-4 print:hidden">
        <div className="px-8 py-4 glass rounded-[2rem] flex flex-col md:flex-row items-center gap-4 border border-white/60 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Instagram size={18} className="text-rose-400" />
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Instagram Story</span>
            </div>
            <div className="w-px h-4 bg-slate-100 hidden md:block" />
            <span className="text-[10px] font-bold text-slate-500 italic">「Save for SNS」ボタンで生成された画像をシェアしよう！</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
