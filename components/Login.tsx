
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LockIcon, UserIcon, ShieldCheckIcon, EyeIcon, EyeOffIcon, ClinicalAppLogo, MailIcon, MessageCircleIcon, DownloadIcon, ActivityIcon } from './icons/Icons';
import { DevIconGenerator } from './DevIconGenerator';

interface LoginProps {
    onInstallClick: () => void;
    isAppInstalled: boolean;
}

const Login: React.FC<LoginProps> = ({ onInstallClick, isAppInstalled }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (email && password) {
        await login(email, password);
      } else {
        setLoading(false);
        setError('Please enter valid credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md relative">
        
        {/* Fixed Install Button - Always Visible on Top Right of Screen */}
        {!isAppInstalled && (
            <button
                onClick={onInstallClick}
                className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-full shadow-lg hover:bg-brand-secondary/90 transition-transform hover:scale-105 active:scale-95 font-medium text-sm animate-fade-in"
                title="Install Application"
            >
                <DownloadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Install App</span>
            </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-8 animate-fade-in flex flex-col items-center">
           <div className="mb-4 shadow-2xl rounded-[18px] overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <ClinicalAppLogo className="h-24 w-24" />
           </div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Clinical Intelligence AI</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2">Secure Access for Medical Professionals</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in relative z-10">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6 text-sm text-brand-secondary font-semibold bg-brand-secondary/10 p-3 rounded-lg border border-brand-secondary/20">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Secure Environment - Prototype</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Professional Email / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                    placeholder="dr.smith@hospital.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Credentials...
                  </span>
                ) : (
                  "Access Clinical Dashboard"
                )}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Unauthorized access is prohibited. All activity is logged and monitored for compliance purposes.
            </p>
          </div>
        </div>
        
        {/* Security / Data Protection Section */}
        <div className="mt-8 text-center animate-fade-in">
             <div className="mb-4">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Protección de datos garantizada</h2>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    Cumplimos con los más altos estándares de seguridad para proteger la información sensible de tus pacientes.
                 </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                 <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2 text-brand-primary dark:text-brand-accent">
                        <LockIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">Encriptación militar de extremo a extremo</span>
                 </div>

                 <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col items-center">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheckIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">Cumplimiento certificado GDPR, HIPAA y LOPD</span>
                 </div>

                 <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col items-center">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-2 text-amber-600 dark:text-amber-400">
                        <ActivityIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">Monitoreo 24/7 contra amenazas cibernéticas</span>
                 </div>
             </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-8">
                <a 
                    href="https://wa.me/34670887715?text=Hola,%20necesito%20ayuda%20con%20la%20app%20Clinical%20AI" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors text-sm font-medium"
                >
                     <MessageCircleIcon className="h-5 w-5" /> WhatsApp Help
                </a>
                <a 
                    href="mailto:support@clinicalai.com"
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                     <MailIcon className="h-5 w-5" /> Email Support
                </a>
            </div>
            
            {/* Developer Tool to Generate PNG Icons for PWA */}
            <DevIconGenerator />
            
            <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                v1.3.1 • Clinical Intelligence Module
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
