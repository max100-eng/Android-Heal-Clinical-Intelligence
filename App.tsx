
import React, { useState, useCallback, useEffect } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header from './components/Header';
import ImageTypeSelector from './components/ImageTypeSelector';
import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import PerformanceModal from './components/PerformanceModal';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import InstallPrompt from './components/InstallPrompt';
import { ArrowRightIcon, SparklesIcon, BarChartIcon, DownloadIcon, XCircleIcon } from './components/icons/Icons';

interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

const ClinicalApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPerformanceModalOpen, setPerformanceModalOpen] = useState<boolean>(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Detectar si estamos en el bridge de Capacitor (Android/iOS Nativo)
    const isNativeEnv = (window as any).Capacitor?.isNative || false;
    setIsNative(isNativeEnv);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone || isNativeEnv) {
        setIsAppInstalled(true);
        setShowInstallBanner(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(() => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowInstallBanner(false);
            }
        });
    } else {
        setShowInstallInstructions(true);
    }
  }, [deferredPrompt]);

  const handleDismissBanner = () => {
      setShowInstallBanner(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
        setImageData(null);
        setAnalysisResult(null);
        setError('');
    }
  }, [isAuthenticated]);

  const handleImageUpload = (file: File, isAnnotation: boolean = false) => {
    if (!file) return;
    if (!isAnnotation) {
        setAnalysisResult(null);
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) {
          setError("Error: El archivo no se pudo leer.");
          return;
      }
      const base64Parts = result.split(',');
      const base64Data = base64Parts[1];
      const mimeType = file.type || 'image/png';

      setImageData({
        base64: base64Data,
        mimeType: mimeType,
        previewUrl: result,
      });
    };
    reader.onerror = () => {
        setError("Error crítico al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageClear = useCallback(() => {
    setImageData(null);
    setAnalysisResult(null);
    setError('');
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageData) {
      setError('Por favor, selecciona una imagen clínica primero.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await analyzeImage(imageData.base64, imageData.mimeType, selectedType);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado en el motor clínico.');
    } finally {
      setLoading(false);
    }
  }, [imageData, selectedType]);

  if (authLoading && !showSplash) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-brand-dark gap-4">
            <SparklesIcon className="animate-spin h-10 w-10 text-brand-secondary" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Estableciendo sesión segura...</p>
        </div>
      );
  }

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      
      {showInstallBanner && !isAppInstalled && (
          <InstallPrompt onInstall={handleInstallClick} onDismiss={handleDismissBanner} />
      )}
      
      {showInstallInstructions && !isNative && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowInstallInstructions(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowInstallInstructions(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                    <XCircleIcon className="h-6 w-6" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <DownloadIcon className="h-12 w-12 text-brand-secondary mb-6" />
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight leading-none">Instalar App</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium px-2">Añade Android Heal a tu pantalla de inicio para acceso inmediato.</p>
                    <button onClick={() => setShowInstallInstructions(false)} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95">Entendido</button>
                </div>
            </div>
        </div>
      )}

      {!isAuthenticated ? (
        <Login onInstallClick={handleInstallClick} isAppInstalled={isAppInstalled} />
      ) : (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-secondary/30">
          <Header onInstallClick={handleInstallClick} isAppInstalled={isAppInstalled} />
          <main className="container mx-auto p-4 md:p-8 max-w-7xl">
            {isNative && (
                <div className="mb-6 flex items-center justify-center">
                    <span className="px-4 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                        Native Core Active
                    </span>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="flex flex-col space-y-10">
                <section className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-6 bg-brand-secondary rounded-full"></div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic leading-snug">1. Modalidad Diagnóstica</h2>
                  </div>
                  <ImageTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />
                </section>
                <section className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-6 bg-brand-secondary rounded-full"></div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic leading-snug">2. Entrada de Imagen</h2>
                  </div>
                  <ImageUploader onImageUpload={handleImageUpload} previewUrl={imageData?.previewUrl} onClear={handleImageClear} />
                </section>
                <div className="pt-6 animate-fade-in">
                  <button
                      onClick={handleAnalyzeClick}
                      disabled={!imageData || loading}
                      className="w-full flex items-center justify-center text-xl font-black bg-brand-secondary hover:bg-brand-primary disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-[2rem] shadow-2xl px-8 py-6 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] group relative overflow-hidden"
                  >
                      {loading && <div className="absolute inset-0 bg-brand-primary animate-pulse opacity-50"></div>}
                      <span className="relative z-10 flex items-center gap-4">
                        {loading ? (
                          <>
                            <SparklesIcon className="animate-spin h-7 w-7" />
                            Razonando hallazgos...
                          </>
                        ) : (
                          <>
                            Ejecutar Análisis <ArrowRightIcon className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
                          </>
                        )}
                      </span>
                  </button>
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold text-sm animate-shake">
                        <XCircleIcon className="h-6 w-6 flex-shrink-0" />
                        {error}
                    </div>
                  )}
                </div>
                <div className="text-center pt-2">
                    <button onClick={() => setPerformanceModalOpen(true)} className="group text-[10px] text-gray-400 hover:text-brand-secondary font-black flex items-center justify-center mx-auto uppercase tracking-[0.3em] transition-colors">
                        <BarChartIcon className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
                        Benchmarks de Precisión AI
                    </button>
                </div>
              </div>
              <div className="flex flex-col h-full min-h-[700px] animate-fade-in">
                <AnalysisDisplay loading={loading} error={error} result={analysisResult} previewUrl={imageData?.previewUrl} base64Image={imageData?.base64} mimeType={imageData?.mimeType} />
              </div>
            </div>
          </main>
          <PerformanceModal isOpen={isPerformanceModalOpen} onClose={() => setPerformanceModalOpen(false)} />
          <footer className="container mx-auto px-8 pb-10 text-center opacity-30 select-none">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Android Heal Protocol v2.4.0 (AAB Ready)</p>
          </footer>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => <AuthProvider><ClinicalApp /></AuthProvider>;
export default App;
