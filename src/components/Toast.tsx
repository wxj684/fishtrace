import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-inverse-surface text-inverse-on-surface shadow-lg text-[13px] font-medium flex items-center gap-2 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      role="status"
    >
      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
        {toast.icon || 'check_circle'}
      </span>
      <span>{toast.message}</span>
    </div>
  );
};
