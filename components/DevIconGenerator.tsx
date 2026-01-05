
import React from 'react';
import { DownloadIcon } from './icons/Icons';

export const DevIconGenerator: React.FC = () => {
  
  const generateAndDownload = (size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const svgString = `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#001219" />
        <defs>
          <linearGradient id="cad_grad_dev" x1="50" y1="20" x2="50" y2="80">
            <stop offset="0%" stop-color="#39ff14" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#001219" />
        <rect x="49" y="22" width="2" height="60" rx="1" fill="url(#cad_grad_dev)" />
        <path d="M50 80 Q 65 70, 50 60 Q 35 50, 50 40 Q 65 30, 50 22" stroke="#39ff14" stroke-width="1.5" fill="none" />
        <path d="M50 80 Q 35 70, 50 60 Q 65 50, 50 40 Q 35 30, 50 22" stroke="#0ea5e9" stroke-width="1.5" fill="none" />
        <path d="M50 25 C 65 15, 85 25, 85 45" stroke="white" stroke-width="1.5" opacity="0.4" fill="none" />
        <path d="M50 25 C 35 15, 15 25, 15 45" stroke="white" stroke-width="1.5" opacity="0.4" fill="none" />
        <circle cx="50" cy="22" r="3.5" fill="white" />
    </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `icon-${size}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = url;
  };

  return (
    <div className="flex gap-2 justify-center mt-2">
      <button 
        onClick={() => { generateAndDownload(192); setTimeout(() => generateAndDownload(512), 1000); }}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-secondary transition-colors cursor-pointer border border-dashed border-gray-300 dark:border-gray-700 px-2 py-1 rounded"
        title="Generates icon-192.png and icon-512.png"
      >
        <DownloadIcon className="h-3 w-3" />
        Dev: Download PWA Icons
      </button>
    </div>
  );
};
