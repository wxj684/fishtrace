import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SpotMapModal: React.FC = () => {
  const {
    isSpotMapModalOpen,
    setIsSpotMapModalOpen,
    spots,
    activeSpot,
    setActiveSpotId,
    setIsBathymetryModalOpen,
    showToast
  } = useApp();
  const [selectedSpotId, setSelectedSpotId] = useState<string | number>(activeSpot.id);

  if (!isSpotMapModalOpen) return null;

  const currentSelectedSpot = spots.find(s => s.id === selectedSpotId) || activeSpot;

  const handleSelectSpot = (id: string | number) => {
    setSelectedSpotId(id);
    setActiveSpotId(id);
    showToast(`已切换当前工作台活跃水区: ${spots.find(s => s.id === id)?.title}`, 'place');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/80 backdrop-blur-md flex flex-col justify-end p-margin animate-in fade-in"
      onClick={() => setIsSpotMapModalOpen(false)}
    >
      <div
        className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">map</span>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">千岛湖·全域水下等深解算图</span>
              <span className="font-label-caps text-[10px] text-outline font-mono">
                HYDROGRAPHIC BATHYMETRY & WAYPOINTS
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSpotMapModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Bathymetric Map View with Pins */}
        <div className="relative w-full rounded-xl overflow-hidden bg-inverse-surface aspect-[16/9] shadow-md select-none">
          <img
            alt="等高水深测绘图"
            className="w-full h-full object-cover opacity-90"
            src="/src/assets/images/bathymetric_depth_map_1793009822977.jpg"
          />

          {/* Top HUD */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
            <div className="bg-inverse-surface/85 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-caps text-[10px] text-inverse-on-surface tracking-wider font-semibold">
                千岛湖·界首主航道
              </span>
            </div>
            <div className="bg-inverse-surface/85 backdrop-blur-md px-2 py-0.5 rounded font-label-data-sm text-[9px] text-surface-variant">
              36°15'N · 94°45'W
            </div>
          </div>

          {/* Pin A */}
          <button
            onClick={() => handleSelectSpot(1)}
            className={`absolute top-[44%] left-[26%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
              selectedSpotId === 1 ? 'scale-115 z-20' : 'opacity-85 hover:scale-105'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-tertiary/30 animate-ping"></span>
              <span className="relative w-4 h-4 rounded-full bg-tertiary-container shadow-md flex items-center justify-center text-on-tertiary font-label-caps text-[9px] font-bold">
                A
              </span>
            </div>
            <span className="mt-0.5 px-1 rounded bg-inverse-surface/90 text-inverse-on-surface text-[9px] font-mono whitespace-nowrap">
              铧尖 4.2m
            </span>
          </button>

          {/* Pin B */}
          <button
            onClick={() => handleSelectSpot(2)}
            className={`absolute top-[36%] left-[64%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
              selectedSpotId === 2 ? 'scale-115 z-20' : 'opacity-85 hover:scale-105'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="relative w-4 h-4 rounded-full bg-primary-container shadow-md flex items-center justify-center text-on-primary font-label-caps text-[9px] font-bold">
                B
              </span>
            </div>
            <span className="mt-0.5 px-1 rounded bg-inverse-surface/90 text-inverse-on-surface text-[9px] font-mono whitespace-nowrap">
              沉船 6.8m
            </span>
          </button>

          {/* Pin C */}
          <button
            onClick={() => handleSelectSpot(3)}
            className={`absolute bottom-[18%] left-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
              selectedSpotId === 3 ? 'scale-115 z-20' : 'opacity-85 hover:scale-105'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="relative w-4 h-4 rounded-full bg-secondary shadow-md flex items-center justify-center text-on-secondary font-label-caps text-[9px] font-bold">
                C
              </span>
            </div>
            <span className="mt-0.5 px-1 rounded bg-inverse-surface/90 text-inverse-on-surface text-[9px] font-mono whitespace-nowrap">
              芦苇荡 1.8m
            </span>
          </button>

          {/* Depth Legend */}
          <div className="absolute bottom-1 inset-x-2 flex items-center justify-between bg-inverse-surface/80 px-2 py-0.5 rounded font-label-caps text-[8px] text-surface-variant">
            <span>浅滩 0-2m</span>
            <span>斜坡 2-6m</span>
            <span>深槽 8m+</span>
          </div>
        </div>

        {/* Selected Spot Details */}
        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-xs border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary font-label-caps text-[11px] font-bold flex items-center justify-center">
                {currentSelectedSpot.letter || '★'}
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                {currentSelectedSpot.title}
              </h3>
            </div>
            <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-primary-container text-on-primary font-semibold">
              {currentSelectedSpot.statusBadge}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2 rounded-lg mt-1 text-center">
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] text-outline">适宜标靶水深</span>
              <span className="font-label-data-sm text-primary font-bold">
                {currentSelectedSpot.depthDisplay}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] text-outline">水底底质</span>
              <span className="font-label-data-sm text-on-surface font-medium truncate">
                {currentSelectedSpot.bottomType}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] text-outline">优势主攻鱼种</span>
              <span className="font-label-data-sm text-tertiary font-bold truncate">
                {currentSelectedSpot.targetFish}
              </span>
            </div>
          </div>

          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
            {currentSelectedSpot.note}
          </p>
        </div>

        {/* All Spots Quick List */}
        <div className="flex flex-col gap-1.5">
          <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
            点击快速设定当前出钓标点
          </span>
          <div className="grid grid-cols-2 gap-2">
            {spots.map(s => {
              const isCurr = s.id === selectedSpotId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSpot(s.id)}
                  className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                    isCurr
                      ? 'bg-surface-container-high border-primary text-primary font-semibold shadow-xs'
                      : 'bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold truncate">{s.letter}. {s.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-outline">{s.depthDisplay} · {s.targetFish}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-space-sm pt-1">
          <button
            onClick={() => {
              setIsSpotMapModalOpen(false);
              setIsBathymetryModalOpen(true);
            }}
            className="flex-1 h-11 rounded-xl bg-surface-container-high text-on-surface font-label-data-sm text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">radar</span>
            <span>水底测绘与探底</span>
          </button>
          <button
            onClick={() => setIsSpotMapModalOpen(false)}
            className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-data-sm text-[12px] font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>设为监测水区</span>
          </button>
        </div>
      </div>
    </div>
  );
};
