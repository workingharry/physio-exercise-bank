import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface Props {
  isOpen: boolean;
  imageUrl?: string;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Lightbox: React.FC<Props> = ({ isOpen, imageUrl, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-amber-400" />
            {title || '高解析分解圖示 / 關節剖析'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Detailed demonstration"}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};
