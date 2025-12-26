
import React from 'react';
import { ImageType } from '../types';
import { HeartPulseIcon, LungIcon, EyeIcon, SkinIcon, BeakerIcon, FlaskIcon, ScanIcon, WavesIcon, RadioactiveIcon, ActivityIcon } from './icons/Icons';

interface ImageTypeSelectorProps {
  selectedType: ImageType;
  onTypeChange: (type: ImageType) => void;
}

const imageTypes = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.RX, label: 'Rayos X (RX)', icon: LungIcon },
  { type: ImageType.TC, label: 'Tomografía (TC)', icon: ScanIcon },
  { type: ImageType.RMN, label: 'Resonancia (RMN)', icon: ActivityIcon },
  { type: ImageType.ECO, label: 'Ecografía (ECO)', icon: WavesIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Dermatoscopia', icon: SkinIcon },
  { type: ImageType.URINALYSIS, label: 'Urianálisis', icon: BeakerIcon },
  { type: ImageType.TOXICOLOGY, label: 'Toxicología', icon: FlaskIcon },
  { type: ImageType.NUCLEAR_MEDICINE, label: 'Med. Nuclear', icon: RadioactiveIcon },
];

const ImageTypeButton: React.FC<{
    type: ImageType;
    label: string;
    icon: React.ElementType;
    isSelected: boolean;
    onClick: (type: ImageType) => void;
}> = ({ type, label, icon: Icon, isSelected, onClick }) => {
    return (
        <button
            onClick={() => onClick(type)}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-secondary/20 ${
                isSelected 
                ? "bg-brand-primary border-brand-primary text-white shadow-xl scale-105 z-10" 
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-secondary/50 hover:bg-brand-secondary/5"
            }`}
        >
            <div className={`p-2 rounded-xl mb-2 transition-colors ${isSelected ? "bg-white/20" : "bg-gray-50 dark:bg-gray-700"}`}>
                <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-brand-secondary"}`} />
            </div>
            <span className="font-black text-[10px] uppercase tracking-tighter text-center leading-tight">{label}</span>
        </button>
    );
};

const ImageTypeSelector: React.FC<ImageTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {imageTypes.map(({ type, label, icon }) => (
        <ImageTypeButton
            key={type}
            type={type}
            label={label}
            icon={icon}
            isSelected={selectedType === type}
            onClick={onTypeChange}
        />
      ))}
    </div>
  );
};

export default ImageTypeSelector;
