
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClinicalAppLogo, LogOutIcon, UserIcon, MailIcon, MessageCircleIcon, DownloadIcon, ActivityIcon } from './icons/Icons';

interface HeaderProps {
    onInstallClick: () => void;
    isAppInstalled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onInstallClick, isAppInstalled }) => {
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

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="shadow-md rounded-[10px] overflow-hidden bg-brand-dark">
                <ClinicalAppLogo className="h-10 w-10" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-tight">
              Android Heal
              <span className="block text-[10px] font-black uppercase text-brand-secondary dark:text-brand-accent tracking-widest">Protocolo de Inteligencia</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border ${isOnline ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-red-500/20 bg-red-500/5 text-red-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 pr-2 sm:pr-4 sm:mr-2 border-r border-gray-200 dark:border-gray-600">
                {!isAppInstalled && (
                    <button
                        onClick={onInstallClick}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary text-white font-black rounded-xl transition-all text-xs shadow-lg hover:scale-105 active:scale-95"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        <span className="hidden sm:inline tracking-tighter uppercase">Instalar</span>
                    </button>
                )}
                <a 
                    href="https://wa.me/34670887715" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-all"
                >
                    <MessageCircleIcon className="h-6 w-6" />
                </a>
            </div>
            
            {user && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 py-1 px-3 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{user.email}</span>
                </div>
            )}

            <button 
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 transition-colors"
                title="Cerrar Sesión"
            >
                <LogOutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
