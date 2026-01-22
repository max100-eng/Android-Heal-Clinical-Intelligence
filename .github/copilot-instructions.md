# Android Heal: Clinical Intelligence - AI Coding Guide

## Project Overview
A cross-platform (Web + Android) medical imaging analysis app using Google Gemini 2.0 Flash for clinical interpretation. Built with React + TypeScript + Vite, deployable as PWA and native Android via Capacitor.

**Core Architecture**: Single-page React app with serverless API backend. Image analysis via external Cloud Run endpoint, with Gemini integration for AI-powered clinical insights.

## Development Setup

### Environment Variables
- **Local dev**: Create `.env.local` with `VITE_GEMINI_API_KEY=your_key`
- **Vercel deployment**: Set `API_KEY` or `VITE_API_KEY` in dashboard (see [vite.config.ts](vite.config.ts#L12))
- API key priority: System env → `VITE_GEMINI_API_KEY` (local)

### Commands
```bash
npm install          # Install dependencies
npm run dev          # Dev server on port 3000
npm run build        # Production build (drops console logs)
npm run preview      # Preview production build
```

### Android/Capacitor
- Config: [capacitor.config.ts](capacitor.config.ts) - App ID: `com.androidheal.clinical.ai`
- Native features detected via `window.Capacitor?.isNative`
- PWA manifest: [manifest.json](manifest.json) with 192/512px icons

## Critical Data Flow

### Image Analysis Pipeline
1. **Upload** → [ImageUploader.tsx](components/ImageUploader.tsx): User selects/captures image + modality type (ECG, X-Ray, etc.)
2. **Process** → [App.tsx#L116-L155](App.tsx#L116-L155) `handleAnalyze()`: 
   - Converts base64 → Blob → FormData
   - Fetches biosensor data from [healthService.ts](services/healthService.ts)
   - POSTs to Cloud Run endpoint: `https://copy-of-clinical-intelligence-image-analyzer-651390744915.us-west1.run.app/analyze`
3. **Display** → Renders `AnalysisResult` with differential diagnoses, confidence scores, urgent alerts

**Key**: Analysis **does NOT** use local [geminiService.ts](services/geminiService.ts) - that's for future chat features. Current flow uses external API.

## Type System ([types.ts](types.ts))

### Core Enums & Interfaces
- `ImageType`: 20 modalities (ECG, RX, TC, POCUS, DERMATOSCOPY, etc.)
- `AnalysisResult`: Structured response from API
  - `modalityDetected`, `clinicalFindings`, `differentialDiagnoses[]`
  - `confidenceScore` (0-100), `urgentAlert` (boolean)
  - Optional: `urinalysisData`, `rxOverlays`, `healthCorrelation`
- `PatientHealthContext`: Simulated biosensor data (HR, SpO2, steps, etc.)

## Authentication Pattern ([AuthContext.tsx](contexts/AuthContext.tsx))

Placeholder auth system with localStorage persistence. Comments indicate integration points for Firebase/Supabase:
- `login()`: Currently stores `{ id, email, name }` in `localStorage['clinical_user']`
- `logout()`: Clears storage
- **TODO for production**: Replace with real provider SDK (see inline `// 2. LOGIN LOGIC` comments)

## Component Conventions

### State Management
- App-level state in [App.tsx](App.tsx): `imageData`, `analysisResult`, `healthData`, `selectedType`
- Context for global: `AuthContext` only (no Redux/Zustand)
- Framer Motion for animations (install prompt, lightning effects)

### UI Patterns
- **Carousel navigation**: Bottom modality selector syncs with selected type
- **3-slide reel**: Upload (0) → Review (1) → Results (2) - controlled via `scrollToSlide()`
- **Vision mode**: Toggle for enhanced analysis UI ([App.tsx#L245](App.tsx#L245))
- **Stethoscope mode**: Special biosensor mode with cyan glow effects

### Icon System ([Icons.tsx](components/icons/Icons.tsx))
Custom SVG icons exported as React components. Used throughout with 20+ medical icons (HeartPulseIcon, LungIcon, etc.).

## API Integration

### Serverless Functions ([api/](api))
- [chat.ts](api/chat.ts): Vercel handler for future chat feature (not actively used)
- [gemini.ts](api/gemini.ts): Gemini SDK wrapper (prepared for chat expansion)
- [vercel.json](vercel.json): Routes `/api/*` to serverless, else SPA fallback

### External Dependencies
- **Gemini 2.0 Flash** (`@google/generative-ai`): Model ID `gemini-2.0-flash-exp`
- **Cloud Run**: Production analysis endpoint (hardcoded URL in `handleAnalyze`)
- **Health data**: Simulated locally; replace with native sensor integration for production

## Build & Deployment

### Production Optimizations ([vite.config.ts](vite.config.ts))
- Terser minification with `drop_console: true` in prod
- No source maps
- Service worker registration in [index.tsx](index.tsx) for offline PWA
- `sw.js`: Basic cache-first strategy for app shell

### Platform Targets
1. **Web/PWA**: Deploy to Vercel (uses `vercel-build` script)
2. **Android**: Capacitor wraps `dist/` folder - requires icon assets (192/512px)

## Code Style Notes

- TypeScript strict mode with interface types
- Framer Motion for all animations (no CSS transitions)
- Tailwind utility classes (not in config - inline styles with brand colors)
- Error handling: Try/catch with user-facing messages in Spanish
- Modality names: Spanish labels, English enum keys (e.g., `SPIROMETRY` → "Espiro")

## Common Pitfalls

1. **Don't modify geminiService.ts for image analysis** - it's for chat only
2. **Environment variables**: Use `VITE_` prefix for client-side access
3. **Base64 encoding**: Must split on comma and decode before blob conversion
4. **Modality sync**: Changing `selectedType` must also scroll carousel ([App.tsx#L162-L175](App.tsx#L162-L175))
5. **Capacitor native detection**: Check `window.Capacitor?.isNative` before using native APIs

## Key Files for Reference
- [App.tsx](App.tsx): Main app logic, analysis flow, UI orchestration
- [types.ts](types.ts): Complete type definitions
- [healthService.ts](services/healthService.ts): Biosensor data (mock implementation)
- [ImageUploader.tsx](components/ImageUploader.tsx): Advanced canvas-based image editor with zoom/pan/annotations
