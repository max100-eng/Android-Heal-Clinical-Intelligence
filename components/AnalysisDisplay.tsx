
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  AlertTriangleIcon, 
  SparklesIcon, 
  ClipboardIcon, 
  CheckIcon, 
  FileTextIcon, 
  DownloadIcon,
  MessageCircleIcon,
  SendIcon
} from './icons/Icons';
import { AnalysisResult, ChatMessage } from '../types';
import { chatWithClinicalAI } from '../services/geminiService';

interface AnalysisDisplayProps {
  loading: boolean;
  error: string;
  result: AnalysisResult | null;
  previewUrl?: string | null;
  base64Image?: string | null;
  mimeType?: string | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  loading, 
  error, 
  result, 
  previewUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleCopyToEHR = () => {
    if (!result) return;
    const text = `
=== INFORME DE INTELIGENCIA CLÍNICA ===
FECHA: ${new Date().toLocaleString()}
MODALIDAD: ${result.modalityDetected}
CONFIANZA: ${result.confidenceScore}%

HALLAZGOS CLÍNICOS:
${result.clinicalFindings}

DIAGNÓSTICO DIFERENCIAL:
${result.differentialDiagnoses.map(d => `- ${d.condition} [Probabilidad ${d.probability}]: ${d.reasoning}`).join('\n')}

RECOMENDACIÓN:
${result.suggestedFollowUp}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || chatLoading) return;

    const userMsg = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await chatWithClinicalAI(chatHistory, userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: response || "No se pudo procesar la consulta." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Error de conexión con el asistente clínico." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-6 animate-pulse text-center">
      <div className="relative">
        <SparklesIcon className="h-20 w-20 text-brand-secondary animate-spin-slow" />
        <div className="absolute inset-0 bg-brand-secondary/30 rounded-full blur-2xl animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <p className="text-brand-primary dark:text-brand-accent font-black uppercase tracking-[0.2em] text-xl">Escaneando...</p>
        <p className="text-gray-500 text-sm italic">Procesando hallazgos con IA de grado médico</p>
      </div>
      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-brand-secondary animate-shimmer w-1/3"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
      <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full mb-4">
        <AlertTriangleIcon className="h-10 w-10 text-red-600" />
      </div>
      <h3 className="text-xl font-black text-red-700 dark:text-red-400 uppercase tracking-tighter">Análisis Fallido</h3>
      <p className="text-red-600 dark:text-red-300 mt-2 font-medium">{error}</p>
    </div>
  );

  if (!result) return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8 space-y-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-white/40 dark:bg-gray-800/20">
      <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-full shadow-inner ring-4 ring-gray-100/50 dark:ring-gray-700/50">
        <FileTextIcon className="h-16 w-16 opacity-40" />
      </div>
      <div className="max-w-xs">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Núcleo de Inteligencia</h3>
        <p className="text-sm mt-2 font-medium">Sube una imagen clínica y selecciona la modalidad para recibir una interpretación profesional instantánea.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in pb-8">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 p-8 relative overflow-hidden">
        {result.urgentAlert && (
          <div className="mb-8 p-5 bg-red-600 text-white rounded-2xl flex items-center gap-5 animate-pulse shadow-xl ring-8 ring-red-600/10">
            <AlertTriangleIcon className="h-10 w-10 flex-shrink-0" />
            <div>
              <p className="font-black text-xl uppercase tracking-tighter">STAT: EMERGENCIA CLÍNICA</p>
              <p className="text-sm font-semibold opacity-90 leading-tight">Se han detectado hallazgos críticos. Requiere intervención inmediata.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Diagnóstico IA</h3>
            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-lg uppercase tracking-widest">{result.modalityDetected}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-brand-secondary leading-none">{result.confidenceScore}%</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Nivel de Confianza</p>
          </div>
        </div>

        <div className="space-y-8">
            <section>
              <h4 className="text-brand-primary dark:text-brand-accent font-black mb-4 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                <div className="w-2 h-5 bg-brand-secondary rounded-full shadow-sm"></div>
                Hallazgos Detallados
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner leading-relaxed">
                <ReactMarkdown>{result.clinicalFindings}</ReactMarkdown>
              </div>
            </section>

            <section>
              <h4 className="text-brand-primary dark:text-brand-accent font-black mb-4 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                <div className="w-2 h-5 bg-brand-secondary rounded-full shadow-sm"></div>
                Diagnóstico Diferencial
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {result.differentialDiagnoses.map((diff, idx) => (
                  <div key={idx} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-brand-secondary/10 hover:border-brand-secondary/30 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-black text-base text-gray-900 dark:text-white group-hover:text-brand-secondary transition-colors">{diff.condition}</span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        diff.probability === 'High' ? 'bg-red-100 text-red-700' :
                        diff.probability === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {diff.probability === 'High' ? 'Alta' : diff.probability === 'Moderate' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">"{diff.reasoning}"</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-6 bg-brand-secondary/5 dark:bg-brand-accent/5 rounded-[2rem] border border-brand-secondary/20 dark:border-brand-accent/20 ring-1 ring-brand-secondary/10">
              <h4 className="text-brand-secondary dark:text-brand-accent font-black uppercase text-xs tracking-[0.2em] mb-4">Sugerencias Médicas</h4>
              <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
                 <ReactMarkdown>{result.suggestedFollowUp}</ReactMarkdown>
              </div>
            </section>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
          <button 
            onClick={handleCopyToEHR}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 group"
          >
            {copied ? <CheckIcon className="h-5 w-5 animate-bounce" /> : <ClipboardIcon className="h-5 w-5 group-hover:rotate-6 transition-transform" />}
            {copied ? 'Copiado' : 'Copiar al Historial'}
          </button>
          <button className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-md active:scale-95">
            <DownloadIcon className="h-5 w-5" />
            Reporte PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col min-h-[500px] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-secondary/10 rounded-xl">
              <MessageCircleIcon className="h-6 w-6 text-brand-secondary" />
            </div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200">Consultas Clínicas</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">IA Sincronizada</span>
          </div>
        </div>
        
        <div className="flex-grow p-8 space-y-5 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12 opacity-50 space-y-4">
              <SparklesIcon className="h-12 w-12 text-brand-secondary/30" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest">Asistente Contextual</p>
                <p className="text-[10px] italic">Pregunta sobre intervalos, morfología o guías de tratamiento.</p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-sm shadow-sm font-medium ${
                  msg.role === 'user' 
                  ? 'bg-brand-primary text-white rounded-tr-none' 
                  : 'bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                }`}>
                  <ReactMarkdown className="prose prose-xs dark:prose-invert">{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-gray-900 p-5 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleChatSubmit} className="p-6 border-t border-gray-100 dark:border-gray-700 bg-slate-50/20 dark:bg-gray-900/10">
          <div className="relative group">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: ¿Qué sugiere la morfología de la onda P?"
              className="w-full pl-8 pr-16 py-5 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-secondary/20 focus:border-brand-secondary outline-none transition-all shadow-inner placeholder:font-medium"
            />
            <button 
              type="submit"
              disabled={!query.trim() || chatLoading}
              className="absolute right-4 top-3 p-3 bg-brand-secondary text-white rounded-2xl hover:bg-brand-primary disabled:opacity-50 transition-all shadow-xl active:scale-90"
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
