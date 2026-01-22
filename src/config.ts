// src/config.ts

export const CONFIG = {
  apiKey: __API_KEY__,
  analysisUrl: __ANALYSIS_URL__,
  chatUrl: __CHAT_URL__,
  env: __ENV__,

  // Feature flags
  enableChat: import.meta.env.VITE_ENABLE_CHAT === 'true',
  enableStethoscope: import.meta.env.VITE_ENABLE_STETHOSCOPE === 'true',
  enableVisionMode: import.meta.env.VITE_ENABLE_VISION_MODE === 'true',
} as const;
