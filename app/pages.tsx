import React from 'react';

export default function GeminiPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08090a] text-white">
      {/* Luces de fondo sutiles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-10 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gemini-blue via-gemini-purple to-gemini-red animate-pulse">
            Gemini Studio
          </span>
        </h1>
        
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="Introduce tu clave" 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-gemini-blue transition-all"
          />
          <button className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all">
            Acceder
          </button>
        </div>
      </div>
    </div>
  );
}