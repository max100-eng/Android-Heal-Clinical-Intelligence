
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  UploadCloudIcon, 
  XCircleIcon, 
  CameraIcon, 
  FileUpIcon, 
  ZoomInIcon, 
  ZoomOutIcon, 
  RefreshCwIcon, 
  TargetIcon, 
  SquareIcon, 
  EraserIcon 
} from './icons/Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File, isAnnotation?: boolean) => void;
  previewUrl: string | null | undefined;
  onClear: () => void;
}

type Tool = 'none' | 'arrow' | 'box';

interface Coordinate {
  x: number;
  y: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Viewport state
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [hasAnnotations, setHasAnnotations] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Coordinate | null>(null);
  const [drawEnd, setDrawEnd] = useState<Coordinate | null>(null);
  const [previewCoords, setPreviewCoords] = useState<{ start: Coordinate; end: Coordinate } | null>(null);

  // Touch handling
  const touchState = useRef({ lastDist: 0, lastPoint: { x: 0, y: 0 } });

  const resetViewport = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!previewUrl) {
      resetViewport();
      setActiveTool('none');
      setHasAnnotations(false);
      setOriginalFile(null);
    }
  }, [previewUrl, resetViewport]);

  const handleZoom = (delta: number, clientX: number, clientY: number) => {
    if (!containerRef.current || !previewUrl) return;

    setTransform((prev) => {
      const scaleSpeed = 0.002;
      const newScale = Math.min(Math.max(prev.scale - delta * scaleSpeed * prev.scale, 0.5), 20);
      
      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      // Calculate how much the mouse position moved in terms of image coordinates
      const dx = (mouseX - prev.x) / prev.scale;
      const dy = (mouseY - prev.y) / prev.scale;

      return {
        scale: newScale,
        x: mouseX - dx * newScale,
        y: mouseY - dy * newScale,
      };
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (activeTool !== 'none') return;
    e.preventDefault();
    handleZoom(e.deltaY, e.clientX, e.clientY);
  };

  const getNaturalCoords = (clientX: number, clientY: number): Coordinate | null => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    
    return {
      x: (x / rect.width) * imageRef.current.naturalWidth,
      y: (y / rect.height) * imageRef.current.naturalHeight,
    };
  };

  const getPercentCoords = (clientX: number, clientY: number): Coordinate | null => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewUrl || (e.target as HTMLElement).closest('button')) return;

    if (activeTool !== 'none') {
      const natural = getNaturalCoords(e.clientX, e.clientY);
      const percent = getPercentCoords(e.clientX, e.clientY);
      if (natural && percent) {
        setIsDrawing(true);
        setDrawStart(natural);
        setDrawEnd(natural);
        setPreviewCoords({ start: percent, end: percent });
      }
    } else {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && activeTool !== 'none') {
      const natural = getNaturalCoords(e.clientX, e.clientY);
      const percent = getPercentCoords(e.clientX, e.clientY);
      if (natural && percent && previewCoords) {
        setDrawEnd(natural);
        setPreviewCoords({ ...previewCoords, end: percent });
      }
    } else if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };

  const burnAnnotation = (start: Coordinate, end: Coordinate) => {
    if (!imageRef.current || !originalFile) return;
    const dist = Math.hypot(end.x - start.x, end.y - start.y);
    if (dist < 5) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    const lineWidth = Math.max(4, Math.min(img.naturalWidth, img.naturalHeight) * 0.008);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'box') {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(x, y, w, h);
    } else if (activeTool === 'arrow') {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const headLen = lineWidth * 6;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const newFile = new File([blob], originalFile.name, { type: originalFile.type });
        onImageUpload(newFile, true);
        setHasAnnotations(true);
      }
    }, originalFile.type || 'image/png', 0.95);
  };

  const handleMouseUp = () => {
    if (isDrawing && drawStart && drawEnd) {
      burnAnnotation(drawStart, drawEnd);
    }
    setIsDrawing(false);
    setIsPanning(false);
    setPreviewCoords(null);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      touchState.current.lastDist = d;
    } else if (e.touches.length === 1) {
      touchState.current.lastPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const delta = (touchState.current.lastDist - d) * 2;
      handleZoom(delta, centerX, centerY);
      touchState.current.lastDist = d;
    } else if (e.touches.length === 1 && !isDrawing) {
      const dx = e.touches[0].clientX - touchState.current.lastPoint.x;
      const dy = e.touches[0].clientY - touchState.current.lastPoint.y;
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      touchState.current.lastPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      onImageUpload(file, false);
    }
    event.target.value = '';
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  const toggleTool = (tool: Tool) => {
    setActiveTool((prev) => (prev === tool ? 'none' : tool));
    if (activeTool === 'none') resetViewport();
  };

  return (
    <div className="w-full">
      <input 
        ref={fileInputRef} 
        type="file" 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
      
      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border-2 border-dashed border-brand-secondary/30 bg-white dark:bg-gray-800 shadow-inner group">
          <div
            ref={containerRef}
            className={`absolute inset-0 touch-none flex items-center justify-center ${
              activeTool !== 'none' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
            }`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div
              ref={stageRef}
              className="relative will-change-transform"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transition: isPanning || isDrawing ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Clinical Preview"
                className="max-w-none block object-contain select-none pointer-events-none"
                style={{ height: '70vh' }}
              />
              
              {isDrawing && previewCoords && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  {activeTool === 'box' && (
                    <rect
                      x={`${Math.min(previewCoords.start.x, previewCoords.end.x)}%`}
                      y={`${Math.min(previewCoords.start.y, previewCoords.end.y)}%`}
                      width={`${Math.abs(previewCoords.end.x - previewCoords.start.x)}%`}
                      height={`${Math.abs(previewCoords.end.y - previewCoords.start.y)}%`}
                      fill="rgba(239, 68, 68, 0.2)"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  )}
                  {activeTool === 'arrow' && (
                    <line
                      x1={`${previewCoords.start.x}%`}
                      y1={`${previewCoords.start.y}%`}
                      x2={`${previewCoords.end.x}%`}
                      y2={`${previewCoords.end.y}%`}
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              )}
            </div>
          </div>

          {/* Overlay Controls */}
          <div className="absolute top-4 right-4 flex gap-3 z-30 pointer-events-none">
            <button 
              onClick={onClear} 
              className="p-3 bg-red-600/90 hover:bg-red-700 rounded-2xl text-white transition-all shadow-xl active:scale-90 pointer-events-auto"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900/95 backdrop-blur-xl p-2 rounded-2xl z-30 shadow-2xl border border-white/10 ring-1 ring-white/5 pointer-events-auto">
            <button 
              onClick={() => toggleTool('box')} 
              className={`p-3 rounded-xl transition-all ${activeTool === 'box' ? 'bg-brand-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <SquareIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => toggleTool('arrow')} 
              className={`p-3 rounded-xl transition-all ${activeTool === 'arrow' ? 'bg-brand-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <TargetIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button 
              onClick={() => { setOriginalFile(null); onImageUpload(originalFile!, false); setHasAnnotations(false); }} 
              disabled={!hasAnnotations} 
              className="p-3 text-gray-400 hover:text-red-400 disabled:opacity-20"
            >
              <EraserIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button onClick={() => setTransform(p => ({ ...p, scale: p.scale * 1.25 }))} className="p-3 text-gray-400 hover:text-white">
              <ZoomInIcon className="h-5 w-5" />
            </button>
            <button onClick={() => setTransform(p => ({ ...p, scale: p.scale * 0.8 }))} className="p-3 text-gray-400 hover:text-white">
              <ZoomOutIcon className="h-5 w-5" />
            </button>
            <button onClick={resetViewport} className="p-3 text-gray-400 hover:text-brand-accent">
              <RefreshCwIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="absolute bottom-6 left-6 pointer-events-none opacity-40">
            <div className="px-3 py-1 bg-black/60 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
              {(transform.scale * 100).toFixed(0)}% Zoom
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={triggerFileUpload}
          className="group flex flex-col justify-center items-center w-full aspect-video border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] bg-white dark:bg-gray-800/50 hover:border-brand-secondary/50 transition-all cursor-pointer shadow-inner relative overflow-hidden"
        >
          <div className="text-center relative z-10 p-10">
            <div className="p-6 bg-slate-50 dark:bg-gray-700/50 rounded-full inline-block mb-6 shadow-sm group-hover:scale-110 group-hover:bg-brand-secondary/10 transition-all duration-500">
                <UploadCloudIcon className="h-14 w-14 text-gray-300 group-hover:text-brand-secondary transition-colors" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight mb-2">Entrada de Imagen Clínica</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-8 max-w-[240px] mx-auto">Sube una captura diagnóstica de alta resolución para interpretación.</p>
            <div className="flex gap-4 items-center justify-center">
                <div className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl shadow-xl font-black text-sm uppercase tracking-widest">
                  <FileUpIcon className="h-5 w-5" /> Subir Archivo
                </div>
                <div className="hidden sm:flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md font-black text-sm uppercase tracking-widest">
                  <CameraIcon className="h-5 w-5" /> Cámara
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
