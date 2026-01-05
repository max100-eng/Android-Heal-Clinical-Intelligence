
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  AlertTriangleIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ActivityIcon,
  TargetIcon
} from './icons/Icons';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  loading: boolean;
  error: string;
  result: AnalysisResult | null;
  previewUrl?: string | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ loading, error, result, previewUrl }) => {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
       <SparklesIcon className="h-16 w-16 text-brand-secondary animate-spin-slow mb-6" />
       <p className="text-xl font-black uppercase italic tracking-tighter">Procesando Reel...</p>
    </div>
  );

  if (!result) return null;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* HEADER RESULT */}
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 bg-brand-secondary/20 text-brand-secondary rounded-full border border-brand-secondary/30 text-[10px] font-black uppercase tracking-widest mb-4">
           {result.modalityDetected}
        </div>
        <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
          {result.confidenceScore}<span className="text-brand-secondary">%</span>
        </h3>
        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[9px]">Confianza de Diagnóstico</p>
      </div>

      {/* ALERT IF URGENT */}
      {result.urgentAlert && (
        <div className="p-6 bg-red-600 rounded-[2rem] shadow-[0_0_40px_rgba(220,38,38,0.3)] animate-pulse flex items-center gap-4">
           <AlertTriangleIcon className="h-10 w-10 text-white flex-shrink-0" />
           <p className="text-white font-black uppercase text-sm leading-tight italic">Hallazgo Crítico Detectado: <br/> Acción inmediata requerida.</p>
        </div>
      )}

      {/* INSIGHT IMAGE */}
      {previewUrl && (
        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 group">
           <img src={previewUrl} alt="Scan" className="w-full h-auto grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
           <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <TargetIcon className="h-5 w-5 text-brand-accent neon-text-green" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Análisis Clínico Multimodal Activo</span>
           </div>
        </div>
      )}

      {/* CLINICAL DATA CARDS */}
      <div className="glass-morphism p-8 rounded-[3rem] space-y-6">
        <div className="flex items-center gap-3 mb-2">
           <ActivityIcon className="h-5 w-5 text-brand-secondary" />
           <h4 className="text-xs font-black uppercase tracking-widest text-brand-secondary">Hallazgos</h4>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 font-medium leading-relaxed italic">
          <ReactMarkdown>{result.clinicalFindings}</ReactMarkdown>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {result.differentialDiagnoses.map((diff, i) => (
          <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
             <div>
                <h5 className="font-black text-lg uppercase italic tracking-tighter text-white/90">{diff.condition}</h5>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Probabilidad: {diff.probability}</p>
             </div>
             <div className="p-3 bg-brand-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="h-6 w-6 text-brand-primary" />
             </div>
          </div>
        ))}
      </div>

      <div className="p-10 border-2 border-brand-accent/20 bg-brand-accent/5 rounded-[3.5rem] text-center">
         <h4 className="text-brand-accent font-black uppercase tracking-widest text-xs mb-4">Recomendación</h4>
         <p className="text-lg font-black italic text-white/90">{result.suggestedFollowUp}</p>
      </div>

      <button className="w-full py-6 bg-white/5 rounded-full border border-white/10 font-black uppercase tracking-[0.3em] text-[10px] text-gray-400">
         Exportar Informe EHR v1.2
      </button>
    </div>
  );
};

export default AnalysisDisplay;
