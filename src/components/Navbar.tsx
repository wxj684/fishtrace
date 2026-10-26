import React from 'react';
import { useApp, TabType } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: string;
  }> = [
    { id: 'home', label: '首页', icon: 'radar' },
    { id: 'logs', label: '记录库', icon: 'phishing' },
    { id: 'plan', label: '计划视图', icon: 'calendar_month' },
    { id: 'insights', label: '洞察', icon: 'analytics' },
    { id: 'media', label: '素材页', icon: 'photo_library' }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom,0px)] bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(20,50,61,0.06)] border-t border-surface-container/60">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-all gap-0.5 cursor-pointer ${
                isActive
                  ? 'text-primary-container font-semibold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className="material-symbols-outlined text-[22px] transition-transform"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="font-label-caps text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
