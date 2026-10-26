import React from 'react';
import { useApp } from '../context/AppContext';

export const CatchDetailModal: React.FC = () => {
  const { inspectedCatch, setInspectedCatch, openLightbox, setActiveTab, showToast } = useApp();

  if (!inspectedCatch) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-margin animate-in fade-in"
      onClick={() => setInspectedCatch(null)}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-space-lg shadow-2xl flex flex-col gap-space-md max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1 border-b border-surface-container">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="font-headline-md text-headline-md">作钓记录参数复盘</span>
          </div>
          <button
            onClick={() => setInspectedCatch(null)}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Photo if exists */}
        {inspectedCatch.photoUrl && (
          <div
            onClick={() =>
              openLightbox(
                inspectedCatch.photoUrl!,
                inspectedCatch.photoTitle || inspectedCatch.title
              )
            }
            className="relative w-full h-40 rounded-xl overflow-hidden cursor-pointer group bg-surface-container"
          >
            <img
              src={inspectedCatch.photoUrl}
              alt={inspectedCatch.title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/75 via-transparent to-transparent flex items-end p-2 justify-between">
              <span className="text-[10px] font-label-data-sm text-inverse-on-surface">
                标尺实测留影
              </span>
              <span className="h-5 px-1.5 rounded-full bg-inverse-surface/80 text-inverse-on-surface text-[9px] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">fullscreen</span>大图
              </span>
            </div>
          </div>
        )}

        {/* Telemetry specs well */}
        <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-xl">
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>记录渔获物种</span>
            <span className="font-bold text-on-surface font-headline-sm">
              {inspectedCatch.species}
            </span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>实测重量 / 规格</span>
            <span className="font-label-data-md text-label-data-md font-bold text-tertiary-container">
              {inspectedCatch.weight.toFixed(2)} kg {inspectedCatch.length ? `· ${inspectedCatch.length} cm` : ''}
            </span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>关联标点水区</span>
            <span className="font-body-sm text-on-surface text-right truncate max-w-[190px]">
              {inspectedCatch.spotName}
            </span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>时间与水文窗口</span>
            <span className="font-mono text-xs text-on-surface">
              {inspectedCatch.time} · {inspectedCatch.depth}
            </span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>水温 / 气压梯度</span>
            <span className="font-mono text-xs text-primary font-semibold">
              {inspectedCatch.temp}℃ · {inspectedCatch.pressure} hPa
            </span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>挂饵与用饵策略</span>
            <span className="font-body-sm text-on-surface text-right truncate max-w-[190px]">
              {inspectedCatch.bait}
            </span>
          </div>
        </div>

        {/* Rig details */}
        {inspectedCatch.rig && (
          <div className="flex flex-col gap-1 p-2.5 bg-surface-container rounded-lg">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
              线组与仕挂实配
            </span>
            <p className="font-mono text-xs text-on-surface leading-tight">
              {inspectedCatch.rig}
            </p>
          </div>
        )}

        {/* Field note */}
        {inspectedCatch.notes && (
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              作钓经验归纳
            </span>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container">
              {inspectedCatch.notes}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              setInspectedCatch(null);
              setActiveTab('logs');
            }}
            className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface font-label-data-sm text-label-data-sm flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">list_alt</span>
            在记录库中查看
          </button>
          <button
            onClick={() => {
              setInspectedCatch(null);
              showToast('已标记为实测标定模型并核准', 'verified');
            }}
            className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-data-sm text-label-data-sm flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            已核准模型
          </button>
        </div>
      </div>
    </div>
  );
};
