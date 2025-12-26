
import React from 'react';
import { ClinicalAppLogo, XCircleIcon } from './icons/Icons';

interface InstallPromptProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4 ring-1 ring-black/5">
      <div className="flex items-center gap-4 flex-1">
        {/* App Icon Preview */}
        <div className="flex-shrink-0 shadow-md rounded-xl overflow-hidden">
             <ClinicalAppLogo className="h-14 w-14" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Android Heal</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Install to your home screen for quick access.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onDismiss}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Dismiss"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
        <button
          onClick={onInstall}
          className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-white bg-brand-secondary hover:bg-brand-primary rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          Install App
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
