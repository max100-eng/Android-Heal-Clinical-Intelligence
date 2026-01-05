
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { XCircleIcon, BookOpenIcon } from './icons/Icons';

interface PRDModalProps { isOpen: boolean; onClose: () => void; }

const PRD_CONTENT = `
# Especificación del Producto (PRD): Android Heal v1.4 "NeuroReel"

## 1. Visión del Producto
**Android Heal** evoluciona hacia una experiencia inmersiva estilo "Reel", optimizando la interpretación de diagnósticos críticos de neurofisiología y cardiología.

## 2. Protocolos de Análisis Actualizados
* **Neurología Avanzada:** EEG (Cerebral) y **EMG (Muscular/Nervioso)**.
* **Cardiología Continua:** ECG, Holter 24-48h.
* **Diagnóstico Visual:** Radiología, Retina, Dermatoscopia.
* **Laboratorio:** Urianálisis y Toxicología digital.

## 3. Experiencia "Clinical Reel"
* **Navegación Snap:** Desplazamiento vertical por fases diagnósticas.
* **Hub Biométrico:** Integración en tiempo real de constantes vitales para contextualizar la imagen.
* **IA Cognitiva:** Generación de diagnósticos diferenciales con razonamiento profundo.

## 4. Seguridad
* Cumplimiento HIPAA y encriptación AES-256 para datos sensibles.
`;

const PRDModal: React.FC<PRDModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-10 border-b border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center space-x-5">
            <div className="p-3 bg-brand-primary/10 rounded-2xl"><BookOpenIcon className="h-7 w-7 text-brand-primary dark:text-brand-accent" /></div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Protocolo NeuroReel</h2>
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">v1.4.0 Active</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><XCircleIcon className="h-8 w-8" /></button>
        </div>
        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar text-white">
          <div className="prose prose-invert max-w-none"><ReactMarkdown>{PRD_CONTENT}</ReactMarkdown></div>
        </div>
      </div>
    </div>
  );
};
export default PRDModal;
