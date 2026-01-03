import React, { useState } from 'react';

export default function App() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  // DEFINE AQUÍ TU CONTRASEÑA
  const ACCESS_PASSWORD = "gemini2026"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  // 1. PANTALLA DE BLOQUEO (Si no está autenticado)
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <main className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="backdrop-blur-3xl bg-white/[0.02] border border-white/10 rounded-[40px] p-12 shadow-2xl">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]">
              Gemini Studio
            </h1>
            <p className="text-gray-500 text-sm mb-10 tracking-widest uppercase">Acceso Protegido</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce la contraseña"
                className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all`}
              />
              {error && <p className="text-red-500 text-xs">Contraseña incorrecta. Inténtalo de nuevo.</p>}
              <button 
                type="submit"
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
              >
                Desbloquear Panel
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // 2. PANEL PRINCIPAL (Si la contraseña es correcta)
  return (
    <div className="min-h-screen bg-[#08090a] text-white p-10 font-sans">
      <nav className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]">
          Gemini Studio
        </h2>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">Análisis Clínico</h3>
          <p className="text-gray-400 text-sm">El sistema de inteligencia está listo para procesar datos médicos.</p>
        </div>
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Estado del Sistema</h3>
          <p className="text-gray-400 text-sm">Conexión encriptada y segura activa.</p>
        </div>
      </main>
    </div>
  );
}