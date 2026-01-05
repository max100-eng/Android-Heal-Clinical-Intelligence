
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ClinicalAppLogo, 
  LogOutIcon, 
  UserIcon, 
  MessageCircleIcon, 
  DownloadIcon, 
  ShieldCheckIcon 
} from './icons/Icons';

interface HeaderProps {
    onInstallClick?: () => void;
    isAppInstalled?: boolean;
    hideControls?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onInstallClick, isAppInstalled, hideControls = false }) => {
  const { logout, user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (hideControls) return null;

  return (
    <header className="bg-white dark:bg-gray-950 shadow-2xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center gap-4">
            <div className="bg-brand-dark rounded-2xl overflow-hidden shadow-lg border border-white/10 p-0.5">
                <ClinicalAppLogo className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none italic">
                ANDROID <span className="text-brand-secondary">HEAL</span>
              </h1>
              <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.3em]">Nodo Central de Inteligencia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User Access Badge */}
            {user && (
                <div className="hidden lg:flex items-center gap-3 bg-slate-50 dark:bg-white/5 py-2 px-5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="bg-brand-secondary/20 p-1.5 rounded-lg">
                      <ShieldCheckIcon className="h-4 w-4 text-brand-secondary" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">ID Especialista</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-none">{user.email.split('@')[0].toUpperCase()}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l border-gray-100 dark:border-white/10">
                {!isAppInstalled && onInstallClick && (
                    <button
                        onClick={onInstallClick}
                        className="p-3 bg-brand-secondary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                        title="Instalar Aplicación"
                    >
                        <DownloadIcon className="h-5 w-5" />
                    </button>
                )}
                <a 
                    href="https://wa.me/34670887715" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 text-gray-400 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-xl transition-all"
                >
                    <MessageCircleIcon className="h-6 w-6" />
                </a>
                <button 
                    onClick={logout}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl"
                    title="Cerrar Conexión"
                >
                    <LogOutIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
