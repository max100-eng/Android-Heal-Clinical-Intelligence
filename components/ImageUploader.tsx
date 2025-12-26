import React, { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react';
import { UploadCloudIcon, XCircleIcon, CameraIcon, FileUpIcon, ZoomInIcon, ZoomOutIcon, RefreshCwIcon, TargetIcon, SquareIcon, EraserIcon } from './icons/Icons';

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
  
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [hasAnnotations, setHasAnnotations] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Coordinate | null>(null);
  const [drawEnd, setDrawEnd] = useState<Coordinate | null>(null);
  const [previewCoords, setPreviewCoords] = useState<{start: Coordinate, end: Coordinate} | null>(null);

  useEffect(() => {
    if (!previewUrl) {
      resetZoom();
      setActiveTool('none');
      setHasAnnotations(false);
      setOriginalFile(null);
      setIsDrawing(false);
      setPreviewCoords(null);
    }
  }, [previewUrl]);

  const updateScale = (newScale: number) => {
    const clampedScale = Math.max(1, Math.min(newScale, 8));
    setScale(clampedScale);
    if (clampedScale === 1) setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (activeTool !== 'none' || !previewUrl) return;
    e.preventDefault();
    updateScale(scale - e.deltaY * 0.005);
  };

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const getNaturalCoords = (clientX: number, clientY: number): Coordinate | null => {
      if (!imageRef.current) return null;
      const rect = imageRef.current.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const y = clamp(clientY - rect.top, 0, rect.height);
      const normX = x / rect.width;
      const normY = y / rect.height;
      return { 
          x: normX * imageRef.current.naturalWidth, 
          y: normY * imageRef.current.naturalHeight 
      };
  };

  const getPercentCoords = (clientX: number, clientY: number): Coordinate | null => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    return { x, y };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!previewUrl || (e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    if (activeTool !== 'none') {
        const natural = getNaturalCoords(e.clientX, e.clientY);
        const percent = getPercentCoords(e.clientX, e.clientY);
        if (natural && percent) {
            setIsDrawing(true);
            setDrawStart(natural);
            setDrawEnd(natural);
            setPreviewCoords({ start: percent, end: percent });
        }
    } else if (scale > 1) {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDrawing && activeTool !== 'none') {
        const natural = getNaturalCoords(e.clientX, e.clientY);
        const percent = getPercentCoords(e.clientX, e.clientY);
        if (natural && percent && previewCoords) {
            setDrawEnd(natural);
            setPreviewCoords({ ...previewCoords, end: percent });
        }
    } else if (isPanning) {
        setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDrawing && drawStart && drawEnd) burnAnnotation(drawStart, drawEnd);
    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
    setPreviewCoords(null);
    setIsPanning(false);
  };

  const resetZoom = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      onImageUpload(file, false);
    }
    if (event.target) event.target.value = '';
  };

  const triggerFileUpload = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    fileInputRef.current?.click();
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
    ctx.save();
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
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.fillRect(x, y, w, h);
    } else if (activeTool === 'arrow') {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const headLen = lineWidth * 5;
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
    ctx.restore();
    
    canvas.toBlob((blob) => {
        if (blob) {
            const newFile = new File([blob], originalFile.name, { type: originalFile.type });
            onImageUpload(newFile, true);
            setHasAnnotations(true);
        }
    }, originalFile.type || 'image/png');
  };

  const undoAnnotations = () => {
    if (originalFile) {
        onImageUpload(originalFile, false);
        setHasAnnotations(false);
        setActiveTool('none');
    }
  };

  const toggleTool = (tool: Tool) => {
      if (activeTool === tool) setActiveTool('none');
      else { setActiveTool(tool); resetZoom(); }
  };

  return (
    <div className="w-full">
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/*" id="clinical-image-input" />
      {previewUrl ? (
        <div className="relative group w-full">
            <div
                ref={containerRef}
                className={`relative w-full aspect-video rounded-[2rem] overflow-hidden border-2 border-dashed border-brand-secondary/30 dark:border-gray-600 bg-white dark:bg-gray-800 touch-none flex items-center justify-center shadow-inner ${activeTool !== 'none' ? 'cursor-crosshair' : (scale > 1 ? 'cursor-move' : 'cursor-default')}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                <div className="relative transition-transform duration-75 ease-out origin-center max-w-full max-h-full flex items-center justify-center" style={{ transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)` }}>
                     <img ref={imageRef} src={previewUrl} alt="Vista previa clínica" className="block max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl rounded-lg" />
                    {isDrawing && previewCoords && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
                            {activeTool === 'box' && (
                                <rect x={`${Math.min(previewCoords.start.x, previewCoords.end.x)}%`} y={`${Math.min(previewCoords.start.y, previewCoords.end.y)}%`} width={`${Math.abs(previewCoords.end.x - previewCoords.start.x)}%`} height={`${Math.abs(previewCoords.end.y - previewCoords.start.y)}%`} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="3" />
                            )}
                            {activeTool === 'arrow' && (
                                <g>
                                    <line x1={`${previewCoords.start.x}%`} y1={`${previewCoords.start.y}%`} x2={`${previewCoords.end.x}%`} y2={`${previewCoords.end.y}%`} stroke="#ef4444" strokeWidth="3" />
                                    <circle cx={`${previewCoords.end.x}%`} cy={`${previewCoords.end.y}%`} r="5" fill="#ef4444" />
                                </g>
                            )}
                        </svg>
                    )}
                </div>
                <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${isDrawing || isPanning || activeTool !== 'none' ? 'hidden' : ''}`}>
                    <div className="bg-black/0 hover:bg-black/60 transition-all absolute inset-0 pointer-events-auto flex flex-col items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-sm">
                        <button onClick={triggerFileUpload} className="bg-white text-brand-primary px-8 py-3 rounded-2xl font-black text-sm shadow-2xl transform hover:scale-110 transition-all uppercase tracking-widest active:scale-95 mb-4">Cambiar Imagen</button>
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-3 pointer-events-auto z-30">
                     <button onClick={e => { e.stopPropagation(); onClear(); }} className="p-2 bg-red-600/90 hover:bg-red-700 rounded-2xl text-white transition-all shadow-lg active:scale-90" title="Quitar imagen"><XCircleIcon className="h-6 w-6" /></button>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-gray-900/95 backdrop-blur-xl p-2 rounded-2xl z-20 pointer-events-auto shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <button onClick={() => toggleTool('box')} className={`p-2.5 rounded-xl transition-all ${activeTool === 'box' ? 'bg-brand-secondary text-white ring-2 ring-brand-light shadow-lg scale-110' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} title="Dibujar Recuadro"><SquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => toggleTool('arrow')} className={`p-2.5 rounded-xl transition-all ${activeTool === 'arrow' ? 'bg-brand-secondary text-white ring-2 ring-brand-light shadow-lg scale-110' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} title="Dibujar Flecha"><TargetIcon className="h-5 w-5" /></button>
                    <div className="w-px h-8 bg-white/10 mx-1"></div>
                    <button onClick={undoAnnotations} disabled={!hasAnnotations} className="p-2.5 text-gray-400 hover:bg-white/10 hover:text-red-400 rounded-xl transition-all disabled:opacity-20 disabled:grayscale" title="Borrar Anotaciones"><EraserIcon className="h-5 w-5" /></button>
                    <div className="w-px h-8 bg-white/10 mx-1"></div>
                    <button onClick={() => updateScale(scale + 0.5)} className="p-2.5 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"><ZoomInIcon className="h-5 w-5" /></button>
                    <button onClick={() => updateScale(scale - 0.5)} className="p-2.5 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"><ZoomOutIcon className="h-5 w-5" /></button>
                    <button onClick={resetZoom} className="p-2.5 text-gray-400 hover:bg-white/10 hover:text-brand-accent rounded-xl transition-all"><RefreshCwIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
      ) : (
        <label htmlFor="clinical-image-input" className="group flex flex-col justify-center items-center w-full aspect-video px-10 py-16 border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] bg-white dark:bg-gray-800/50 hover:border-brand-secondary/50 hover:bg-brand-secondary/5 transition-all cursor-pointer shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-center relative z-10 pointer-events-none">
            <div className="p-6 bg-slate-50 dark:bg-gray-700/50 rounded-full inline-block mb-6 shadow-sm group-hover:scale-110 group-hover:bg-brand-secondary/10 transition-all duration-500">
                <UploadCloudIcon className="h-14 w-14 text-gray-300 group-hover:text-brand-secondary transition-colors" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight mb-2 leading-tight">Entrada de Imagen Clínica</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-8 max-w-[240px] mx-auto">Sube una captura diagnóstica para iniciar el análisis.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
                 <button type="button" onClick={triggerFileUpload} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl hover:bg-brand-secondary transition-all shadow-xl font-black text-sm uppercase tracking-widest active:scale-95">
                    <FileUpIcon className="h-5 w-5" /> Subir Archivo
                </button>
                <button type="button" onClick={() => { if(fileInputRef.current) { fileInputRef.current.setAttribute('capture', 'environment'); fileInputRef.current.click(); } }} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:border-brand-secondary/30 transition-all shadow-md font-black text-sm uppercase tracking-widest active:scale-95">
                    <CameraIcon className="h-5 w-5" /> Cámara
                </button>
            </div>
          </div>
        </label>
      )}
    </div>
  );
};

export default ImageUploader;