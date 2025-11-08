
import React from 'react';
import { AppMode } from '../types';

interface ModeSelectorProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const BookIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
);

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, setMode }) => {
  const getButtonClasses = (mode: AppMode) => {
    const baseClasses = "flex-1 text-center px-4 py-3 rounded-md font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 flex items-center justify-center gap-2";
    if (currentMode === mode) {
      return `${baseClasses} bg-cyan-500 text-white shadow-lg`;
    }
    return `${baseClasses} bg-slate-700 text-slate-300 hover:bg-slate-600`;
  };

  return (
    <div className="flex bg-slate-800 p-1 rounded-lg w-full max-w-md mx-auto space-x-1">
      <button onClick={() => setMode(AppMode.BANK)} className={getButtonClasses(AppMode.BANK)}>
        <BookIcon className="w-5 h-5" />
        Kho đề có sẵn
      </button>
      <button onClick={() => setMode(AppMode.IMAGE)} className={getButtonClasses(AppMode.IMAGE)}>
        <UploadIcon className="w-5 h-5" />
        Tải ảnh lên
      </button>
    </div>
  );
};
   