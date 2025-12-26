
import React from 'react';
import { DownloadIcon } from './icons/Icons';

// This component renders the SVG to a canvas and triggers a download.
// It allows the user to get the PNG assets needed for the manifest.json
export const DevIconGenerator: React.FC = () => {
  
  const generateAndDownload = (size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // We define the SVG string directly here to ensure it's standalone and renderable to canvas
    // This matches the ClinicalAppLogo from Icons.tsx
    const svgString = `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="blue_bg_gloss" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#0284c7" />
                <stop offset="1" stop-color="#0f172a" />
            </linearGradient>
            <linearGradient id="metal_grad" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ffffff" offset="0" />
                <stop stop-color="#d1d5db" offset="0.3" />
                <stop stop-color="#9ca3af" offset="0.8" />
                <stop stop-color="#4b5563" offset="1" />
            </linearGradient>
            <filter id="inner_shadow">
                <feOffset dx="0" dy="1" />
                <feGaussianBlur stdDeviation="1" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood flood-color="black" flood-opacity="0.6" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="22" fill="url(#blue_bg_gloss)" />
        <path d="M5 27 C 5 15, 15 5, 27 5 L 73 5 C 85 5, 95 15, 95 27 C 95 27, 95 50, 50 60 C 5 50, 5 27, 5 27 Z" fill="white" fill-opacity="0.1" />
        <circle cx="50" cy="50" r="32" stroke="#39ff14" stroke-width="2" opacity="0.6" fill="none" />
        <g transform="translate(0, 2)">
            <path d="M32 38 C 32 28, 68 28, 68 38 Z" fill="url(#metal_grad)" filter="url(#inner_shadow)" />
            <circle cx="41" cy="33" r="2" fill="#39ff14" />
            <circle cx="59" cy="33" r="2" fill="#39ff14" />
            <line x1="43" y1="24" x2="37" y2="17" stroke="url(#metal_grad)" stroke-width="2" stroke-linecap="round" />
            <line x1="57" y1="24" x2="63" y2="17" stroke="url(#metal_grad)" stroke-width="2" stroke-linecap="round" />
            <rect x="32" y="40" width="36" height="32" rx="4" fill="url(#metal_grad)" filter="url(#inner_shadow)" />
            <rect x="22" y="40" width="8" height="26" rx="4" fill="url(#metal_grad)" filter="url(#inner_shadow)" />
            <rect x="70" y="40" width="8" height="26" rx="4" fill="url(#metal_grad)" filter="url(#inner_shadow)" />
            <rect x="38" y="70" width="8" height="12" rx="4" fill="url(#metal_grad)" filter="url(#inner_shadow)" />
            <rect x="54" y="70" width="8" height="12" rx="4" fill="url(#metal_grad)" filter="url(#inner_shadow)" />
            <path d="M24 50 L28 50 M24 54 L28 54" stroke="#39ff14" stroke-width="0.8" opacity="0.8" />
            <path d="M72 50 L76 50 M72 54 L76 54" stroke="#39ff14" stroke-width="0.8" opacity="0.8" />
        </g>
        <g transform="translate(50, 56) scale(0.55)">
            <path d="M0 -18 C -20 -30, -35 -10, -3 -5" fill="#0ea5e9" stroke="#004e92" stroke-width="1" />
            <path d="M0 -18 C 20 -30, 35 -10, 3 -5" fill="#0ea5e9" stroke="#004e92" stroke-width="1" />
            <rect x="-1.5" y="-22" width="3" height="44" fill="#fbbf24" stroke="#b45309" stroke-width="0.5" />
            <circle cx="0" cy="-24" r="3.5" fill="#fbbf24" stroke="#b45309" stroke-width="0.5" />
            <path d="M-2 18 Q 8 12, -2 6 Q -8 0, -2 -6 Q 8 -12, -2 -18" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <path d="M2 18 Q -8 12, 2 6 Q 8 0, 2 -6 Q -8 -12, 2 -18" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" />
        </g>
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
