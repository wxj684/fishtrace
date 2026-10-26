import React from 'react';
import { useApp } from '../context/AppContext';

export const LightboxModal: React.FC = () => {
  const { lightboxImage, closeLightbox } = useApp();

  if (!lightboxImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
      onClick={closeLightbox}
    >
      <div
        className="max-w-md mx-auto w-full flex items-center justify-between text-inverse-on-surface pt-2"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col min-w-0 pr-2">
          <span className="font-label-caps text-[10px] text-tertiary-fixed-dim uppercase tracking-wider">
            High-Resolution Macro View
          </span>
          <span className="font-headline-sm text-headline-sm truncate text-inverse-on-surface">
            {lightboxImage.title}
          </span>
        </div>
        <button
          onClick={closeLightbox}
          className="w-9 h-9 rounded-full bg-inverse-surface/80 hover:bg-surface-tint border border-outline/30 flex items-center justify-center text-inverse-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div
        className="max-w-md mx-auto w-full flex-1 flex items-center justify-center my-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <img
          alt={lightboxImage.title}
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform"
          src={lightboxImage.url}
        />
      </div>

      <div
        className="max-w-md mx-auto w-full flex items-center justify-around py-2.5 px-4 rounded-xl bg-inverse-surface/80 text-inverse-on-surface font-label-caps text-label-caps border border-outline/20"
        onClick={e => e.stopPropagation()}
      >
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary-fixed">straighten</span>
          电子标尺校验通过
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">gps_fixed</span>
          EXIF经纬度已隐匿保密
        </span>
      </div>
    </div>
  );
};
