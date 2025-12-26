
import React from 'react';
import { XCircleIcon, BarChartIcon } from './icons/Icons';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerformanceMetric: React.FC<{ label: string; value: string; description: string; }> = ({ label, value, description }) => (
    <div className="mb-4">
        <div className="flex justify-between items-baseline">
            <span className="text-gray-700 dark:text-gray-200 font-semibold">{label}:</span>
            <span className="font-mono font-bold text-brand-secondary text-lg">{value}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
);

const RocCurveChart: React.FC<{ auc: number }> = ({ auc }) => {
  const size = 100;
  const padding = 25;
  const viewBox = `0 0 ${size + padding * 2} ${size + padding * 2}`;
  
  const startX = padding;
  const startY = size + padding;
  const endX = size + padding;
  const endY = padding;
  const cp1x = padding + 5;
  const cp1y = padding + 60;
  const cp2x = padding + 60;
  const cp2y = padding + 5;
  
  const curvePath = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
  const diagonalPath = `M ${startX},${startY} L ${endX},${endY}`;

  return (
    <div className="flex justify-center items-center">
      <svg viewBox={viewBox} className="w-full max-w-[220px] h-auto text-gray-400 dark:text-gray-500">
        <line x1={padding} y1={padding} x2={padding} y2={size + padding} stroke="currentColor" strokeWidth="0.5" />
        <line x1={padding} y1={size + padding} x2={size + padding} y2={size + padding} stroke="currentColor" strokeWidth="0.5" />
        <text x={padding - 18} y={padding + size/2} transform={`rotate(-90, ${padding-18}, ${padding + size/2})`} textAnchor="middle" fontSize="9" className="fill-current text-gray-600 dark:text-gray-300 font-sans">True Positive Rate</text>
        <text x={padding + size/2} y={size + padding + 18} textAnchor="middle" fontSize="9" className="fill-current text-gray-600 dark:text-gray-300 font-sans">False Positive Rate</text>
        <text x={padding - 4} y={padding + 4} textAnchor="end" fontSize="8" className="fill-current font-mono">1.0</text>
        <text x={padding - 4} y={size + padding + 3} textAnchor="end" fontSize="8" className="fill-current font-mono">0.0</text>
        <text x={size + padding} y={size + padding + 10} textAnchor="middle" fontSize="8" className="fill-current font-mono">1.0</text>
        <text x={padding} y={size + padding + 10} textAnchor="middle" fontSize="8" className="fill-current font-mono">0.0</text>
        <path d={diagonalPath} fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d={curvePath} fill="none" stroke="#0a9396" strokeWidth="2.5" />
        <text x={padding + size/1.6} y={padding + size/1.5} textAnchor="middle" fontSize="14" className="fill-brand-primary dark:fill-brand-accent font-bold font-sans">AUC ≈ {auc}</text>
      </svg>
    </div>
  );
};

const performanceData = [
    { title: "Análisis ECG (Detección de Arritmias)", auc: 0.97, f1: 0.94 },
    { title: "Radiología (Detección de Patologías)", auc: 0.98, f1: 0.95 },
    { title: "Análisis de Retina (Retinopatía)", auc: 0.96, f1: 0.93 },
    { title: "Dermatoscopia (Clasificación de Lesiones)", auc: 0.95, f1: 0.92 },
    { title: "Multistix Siemens (Urianálisis)", auc: 0.94, f1: 0.91 },
    { title: "Panel Toxicológico (Detección de Sustancias)", auc: 0.96, f1: 0.93 },
];

const PerformanceModal: React.FC<PerformanceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BarChartIcon className="h-7 w-7 text-brand-primary dark:text-brand-accent" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Rendimiento Ilustrativo del Modelo AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XCircleIcon className="h-7 w-7" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Las métricas a continuación son <strong>ejemplos ilustrativos</strong> basados en datasets académicos para proporcionar una visión general de las capacidades de la IA. No son cálculos en tiempo real de su imagen, sino el rendimiento benchmark del modelo en tareas de clasificación específicas.
            </p>

            <div className="grid grid-cols-1 gap-4">
                {performanceData.map(data => (
                    <div key={data.title} className="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-brand-primary dark:text-brand-accent mb-3 text-base">{data.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center">
                            <RocCurveChart auc={data.auc} />
                            <div className="flex flex-col justify-center">
                                <PerformanceMetric 
                                    label="AUC-ROC" 
                                    value={`~${data.auc}`}
                                    description="Mide la capacidad del modelo para distinguir entre clases. Un valor de 1.0 representa un modelo perfecto."
                                />
                                <PerformanceMetric 
                                    label="F1-Score" 
                                    value={`~${data.f1}`}
                                    description="Equilibrio entre precisión y exhaustividad (recall). Un valor de 1.0 es la precisión máxima."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400 p-3 bg-amber-50 dark:bg-yellow-900/20 border border-amber-200 dark:border-yellow-800 rounded-lg">
                <strong>Importante:</strong> El rendimiento puede variar según la calidad de la imagen y el caso clínico específico. Esta información es educativa y no constituye una garantía de precisión. Siempre consulte a un profesional médico calificado.
            </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceModal;
