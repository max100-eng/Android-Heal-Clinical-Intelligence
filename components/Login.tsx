
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LockIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ClinicalAppLogo, 
  SparklesIcon, 
  ArrowRightIcon 
} from './icons/Icons';
import { DevIconGenerator } from './DevIconGenerator';

interface LoginProps {
    onInstallClick: () => void;
    isAppInstalled: boolean;
}

const Login: React.FC<LoginProps> = ({ onInstallClick, isAppInstalled }) => {
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id && password) {
        // En un entorno real, aquí se validaría contra la base de datos clínica
        await login(`${id}@clinical-core.ai`, password);
      } else {
        setLoading(false);
        setError('Introduzca credenciales autorizadas.');
      }
    } catch (err) {
      setLoading(false);
      setError('Fallo en la autenticación del nodo. Verifique su ID.');
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    try {
      await login('dr.watson@androidheal.ai', 'demo123');
    } catch (err) {
      setError('Error al iniciar sesión de prueba.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo Dinámico Neural */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/5 rounded-full blur-[150px] animate-pulse-fast"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-fade-in">
        {/* Identidad de Marca Superior */}
        <div className="text-center mb-12">
           <div className="mb-6 inline-block transform hover:scale-105 transition-transform duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-secondary/20 blur-2xl rounded-full"></div>
                <ClinicalAppLogo className="h-28 w-28 relative z-10" />
              </div>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">
             Android <span className="text-brand-secondary">Heal</span>
           </h1>
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse"></span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocolo de Acceso Seguro</span>
           </div>
        </div>

        {/* Tarjeta de Acceso Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/5">
          <form onSubmit={handleLogin} className="p-10 sm:p-14 space-y-8">
            <div className="space-y-6">
              {/* Campo ID */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1">
                  <UserIcon className="h-3 w-3" /> Identificador de Especialista (ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-5 text-white font-bold placeholder:text-gray-600 focus:border-brand-secondary/50 focus:bg-black/60 outline-none transition-all shadow-inner group"
                    placeholder="Ej: DR-7715-AX"
                  />
                  <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-focus-within:border-brand-secondary/20 transition-all"></div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1">
                  <LockIcon className="h-3 w-3" /> Clave de Acceso Criptográfica
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-5 text-white font-bold placeholder:text-gray-600 focus:border-brand-secondary/50 focus:bg-black/60 outline-none transition-all shadow-inner"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-secondary transition-colors"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-brand-secondary hover:bg-brand-primary py-6 rounded-[1.5rem] shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50"
              >
                {loading && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                <span className="relative z-10 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs">
                  {loading ? (
                    <SparklesIcon className="animate-spin h-5 w-5" />
                  ) : (
                    <>Autenticar Nodo <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDemoMode}
                className="w-full py-5 rounded-[1.5rem] border border-white/5 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
              >
                Modo Consulta de Invitado
              </button>
            </div>
          </form>

          {/* Badge de Seguridad Inferior */}
          <div className="bg-white/5 px-10 py-5 flex items-center justify-center gap-3 border-t border-white/5">
             <ShieldCheckIcon className="h-4 w-4 text-brand-secondary" />
             <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
               Encriptación Punto a Punto Activa (AES-256)
             </p>
          </div>
        </div>

        {/* Soporte / Dev */}
        <div className="mt-12 flex flex-col items-center gap-6 opacity-40">
           <DevIconGenerator />
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-600">
             Android Heal Intelligence Core © 2025
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
