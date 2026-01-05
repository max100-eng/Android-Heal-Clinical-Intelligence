
import React from 'react';
import { ImageType } from '../types';
import { 
  HeartPulseIcon, 
  LungIcon, 
  EyeIcon, 
  SkinIcon, 
  BeakerIcon, 
  ScanIcon, 
  WavesIcon, 
  ActivityIcon,
  WindIcon,
  ZapIcon,
  BrainIcon,
  ClockIcon,
  TargetIcon
} from './icons/Icons';

interface ImageTypeSelectorProps {
  selectedType: ImageType;
  onTypeChange: (type: ImageType) => void;
}

const imageTypes = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.RX, label: 'Rayos X', icon: LungIcon },
  { type: ImageType.TC, label: 'TC Scan', icon: ScanIcon },
  { type: ImageType.RMN, label: 'Resonancia', icon: ActivityIcon },
  { type: ImageType.ECO, label: 'Ecografía', icon: WavesIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Derma', icon: SkinIcon },
  { type: ImageType.URINALYSIS, label: 'Orina', icon: BeakerIcon },
  { type: ImageType.TOXICOLOGY, label: 'Tóxico', icon: BeakerIcon },
  { type: ImageType.NUCLEAR_MEDICINE, label: 'Nuclear', icon: TargetIcon },
  { type: ImageType.EMG, label: 'EMG', icon: ZapIcon },
  { type: ImageType.SPIROMETRY, label: 'Espiro', icon: WindIcon },
  { type: ImageType.EEG, label: 'EEG', icon: BrainIcon },
  { type: ImageType.HOLTER, label: 'Holter', icon: ClockIcon },
];

const ImageTypeSelector: React.FC<ImageTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
      {imageTypes.map(({ type, label, icon: Icon }) => {
        const isSelected = selectedType === type;
        return (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`flex flex-col items-center justify-center py-5 px-2 rounded-3xl border-2 transition-all duration-300 transform active:scale-90 ${
              isSelected 
              ? "bg-brand-secondary/20 border-brand-secondary shadow-[0_0_20px_rgba(14,165,233,0.3)] text-white" 
              : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
            }`}
          >
            <div className={`p-3 rounded-2xl mb-2 transition-colors ${isSelected ? 'bg-brand-secondary text-white shadow-lg' : 'bg-white/5'}`}>
               <Icon className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{label}</span>
          </button>
        );
      })}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ImageTypeSelector;
