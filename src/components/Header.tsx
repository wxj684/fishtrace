import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { sessionSeconds, isSessionActive, toggleSessionTimer, triggerSync, isSyncing, showToast } = useApp();

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(20,50,61,0.05)] pt-safe">
      <div className="max-w-md mx-auto h-14 px-margin flex items-center justify-between gap-space-sm">
        {/* Brand & Ambient Status */}
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">phishing</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight whitespace-nowrap">
                鱼迹
              </span>
              <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase font-semibold hidden xs:inline">
                FishTrace
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-data-sm text-[10px] text-on-surface-variant truncate">
                1013hPa · 18.5℃ 旺咬
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-space-xs shrink-0">
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className={`h-8 px-2 rounded-xl bg-surface-container flex items-center gap-1 text-primary hover:bg-surface-container-high transition-all active:scale-95 ${
              isSyncing ? 'opacity-70 animate-pulse' : ''
            }`}
            title="云端已同步"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              {isSyncing ? 'sync' : 'cloud_done'}
            </span>
            <span className="font-label-caps text-label-caps text-primary uppercase">
              {isSyncing ? 'SYNCING' : 'SYNC'}
            </span>
          </button>

          <button
            onClick={toggleSessionTimer}
            className={`h-8 px-2 rounded-xl text-on-primary flex items-center gap-1 shadow-sm transition-all active:scale-95 ${
              isSessionActive ? 'bg-primary-container' : 'bg-secondary opacity-80'
            }`}
            title={isSessionActive ? '点击暂停计时' : '点击恢复计时'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSessionActive ? 'timer' : 'pause'}
            </span>
            <span className="font-label-data-sm text-label-data-sm font-semibold">
              {formatTimer(sessionSeconds)}
            </span>
          </button>

          <button
            onClick={() => showToast('已登录钓者账户: 资深实测会员 (千岛湖标定库)', 'verified_user')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all text-on-primary"
            title="个人中心"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
