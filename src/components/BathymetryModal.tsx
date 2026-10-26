import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SoundingPoint, DepthZoneType } from '../types';

export const BathymetryModal: React.FC = () => {
  const {
    isBathymetryModalOpen,
    setIsBathymetryModalOpen,
    soundingPoints,
    addSoundingPoint,
    deleteSoundingPoint,
    activeSpot,
    setActiveSpotId,
    showToast,
    openLightbox
  } = useApp();

  // Mode: 'sonar' (sensor simulation) vs 'manual' (manual input)
  const [activeMode, setActiveMode] = useState<'sonar' | 'manual'>('sonar');
  const [depthFilter, setDepthFilter] = useState<'all' | DepthZoneType>('all');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(soundingPoints[0]?.id || null);

  // Map touch/click probe position (0-100%)
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 38, y: 46 });
  const [isPinging, setIsPinging] = useState(false);
  const [sonarFreq, setSonarFreq] = useState<'200kHz' | '83kHz'>('200kHz');

  // Manual Form States
  const [manualName, setManualName] = useState('');
  const [manualDepth, setManualDepth] = useState('3.8');
  const [manualBottom, setManualBottom] = useState<'沙泥底' | '碎石乱礁' | '腐殖淤泥' | '倒木沉树' | '硬质粘土'>('沙泥底');
  const [manualNotes, setManualNotes] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);

  if (!isBathymetryModalOpen) return null;

  // Selected sounding point details
  const selectedPoint = soundingPoints.find(p => p.id === selectedPointId) || soundingPoints[0];

  // Calculate simulated depth from probe coordinates
  const simulatedDepth = useMemo(() => {
    // Top-left is shallow bank (~1.0m to 2.5m)
    // Center diagonal is dropoff (~3.5m to 5.5m)
    // Deep trench in lower center (~6.5m to 9.2m)
    const distToCenter = Math.hypot(probePos.x - 50, probePos.y - 50);
    const depthVal = 8.5 - (distToCenter / 45) * 6.5;
    const clamped = Math.max(0.8, Math.min(9.8, parseFloat(depthVal.toFixed(1))));
    return clamped;
  }, [probePos]);

  // Determine depth zone
  const getDepthZone = (d: number): DepthZoneType => {
    if (d <= 2.0) return 'shallow';
    if (d <= 5.5) return 'dropoff';
    return 'deep';
  };

  // Inferred fish hiding intelligence
  const getFishHidingAnalysis = (d: number, bottom: string) => {
    if (d <= 2.0) {
      return {
        zoneLabel: '浅滩草区 (0 - 2.0m)',
        zoneColor: 'text-secondary bg-secondary/10 border-secondary/30',
        score: 86,
        targetFish: ['野生大板鲫', '小型草鱼'],
        insight: '水深浅、升温快、溶氧充沛。适合清晨与黄昏时分鲫鱼群巡游草脚就饵。建议调细漂短线轻挂红虫。'
      };
    }
    if (d <= 5.5) {
      return {
        zoneLabel: '陡坎铧尖过渡带 (2.0 - 5.5m)',
        zoneColor: 'text-primary bg-primary/10 border-primary/30',
        score: 96,
        targetFish: ['野生大鲤鱼', '老塘青鱼', '鳊鱼'],
        insight: '黄金中鱼钓棚！深浅交界处形成天然回流水阻台阶，大物最喜在此贴底寻觅沉积谷麦。绝佳守大鱼标点！'
      };
    }
    return {
      zoneLabel: '主河槽深潭区 (5.5m+)',
      zoneColor: 'text-tertiary bg-tertiary/10 border-tertiary/30',
      score: 79,
      targetFish: ['拟饵鳜鱼', '翘嘴红鲌', '巨物底栖青鱼'],
      insight: '深水光照微弱、底层水温恒定。高温或剧烈降温时鱼群潜底避难。常有乱石倒木障壁，藏匿大体型掠食鱼。'
    };
  };

  const currentAnalysis = getFishHidingAnalysis(simulatedDepth, manualBottom);

  // Handle map click to reposition sensor probe
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setProbePos({ x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) });

    // Trigger sonar ping pulse
    setIsPinging(true);
    setTimeout(() => setIsPinging(false), 900);
  };

  // Record sensor ping as new sounding point
  const handleSaveSonarPoint = () => {
    const zone = getDepthZone(simulatedDepth);
    const analysis = getFishHidingAnalysis(simulatedDepth, '沙泥底');
    const pointName = `测点 #${soundingPoints.length + 1} (${probePos.x.toFixed(0)}%, ${probePos.y.toFixed(0)}%)`;

    addSoundingPoint({
      name: pointName,
      xPercent: probePos.x,
      yPercent: probePos.y,
      depth: simulatedDepth,
      depthZone: zone,
      bottomType: zone === 'deep' ? '碎石乱礁' : zone === 'dropoff' ? '沙泥底' : '腐殖淤泥',
      fishHidingScore: analysis.score,
      predictedSpecies: analysis.targetFish,
      structureTag: analysis.zoneLabel.split(' ')[0],
      sonarFrequency: `CHIRP ${sonarFreq}`,
      source: 'sonar_sim',
      timeRecorded: '刚刚测录',
      notes: analysis.insight
    });
  };

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(manualDepth) || 3.5;
    const zone = getDepthZone(d);
    const analysis = getFishHidingAnalysis(d, manualBottom);

    addSoundingPoint({
      name: manualName.trim() || `标定测深点 #${soundingPoints.length + 1}`,
      xPercent: probePos.x,
      yPercent: probePos.y,
      depth: d,
      depthZone: zone,
      bottomType: manualBottom,
      fishHidingScore: analysis.score,
      predictedSpecies: analysis.targetFish,
      structureTag: analysis.zoneLabel.split(' ')[0],
      source: 'manual',
      timeRecorded: '刚刚测录',
      notes: manualNotes.trim() || analysis.insight
    });

    setManualName('');
    setManualNotes('');
  };

  // Filtered recorded points
  const filteredPoints = useMemo(() => {
    if (depthFilter === 'all') return soundingPoints;
    return soundingPoints.filter(p => p.depthZone === depthFilter);
  }, [soundingPoints, depthFilter]);

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/80 backdrop-blur-md flex flex-col justify-end p-margin animate-in fade-in select-none"
      onClick={() => setIsBathymetryModalOpen(false)}
    >
      <div
        className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">radar</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                水底测绘与声呐探底
              </span>
              <span className="font-label-caps text-[10px] text-outline font-mono">
                BATHYMETRIC SONAR SOUNDING & FISH HABITAT
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsBathymetryModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Mode Toggle: Sonar Sensor Simulation vs Manual Input */}
        <div className="flex items-center justify-between gap-space-xs bg-surface-container-low p-1 rounded-xl">
          <button
            onClick={() => setActiveMode('sonar')}
            className={`flex-1 py-1.5 rounded-lg font-label-data-sm text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'sonar'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>模拟声呐探头测深</span>
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-1.5 rounded-lg font-label-data-sm text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_location_alt</span>
            <span>手动录入水深底质</span>
          </button>
        </div>

        {/* Interactive Bathymetric Contour Map Container */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-label-caps text-on-surface-variant">
            <span>点击或移动测探探头标定水域坐标</span>
            <span className="text-primary font-mono font-bold">
              X: {probePos.x.toFixed(0)}% · Y: {probePos.y.toFixed(0)}%
            </span>
          </div>

          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            className="relative w-full rounded-xl overflow-hidden bg-inverse-surface aspect-[16/10] shadow-md cursor-crosshair border border-outline-variant/40 group select-none"
          >
            {/* Bathymetric background chart */}
            <img
              alt="水下等深测绘图"
              className="w-full h-full object-cover opacity-85 pointer-events-none"
              src="/src/assets/images/bathymetric_depth_map_1793009822977.jpg"
            />

            {/* Depth Zone Color Coded Overlays (Shallow, Dropoff, Deep) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Shallow Zone (Top right / edges) */}
              <div className="absolute top-[60%] right-0 w-36 h-24 bg-secondary/15 rounded-full blur-xl"></div>
              {/* Dropoff Zone (Center ridge) */}
              <div className="absolute top-[30%] left-[20%] w-48 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              {/* Deep channel (Middle) */}
              <div className="absolute top-[25%] left-[55%] w-36 h-36 bg-tertiary/20 rounded-full blur-2xl"></div>
            </div>

            {/* Existing Recorded Sounding Points Pins */}
            {soundingPoints.map(point => {
              const isSelected = point.id === selectedPointId;
              const isDropoff = point.depthZone === 'dropoff';
              const isShallow = point.depthZone === 'shallow';

              return (
                <div
                  key={point.id}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedPointId(point.id);
                    setProbePos({ x: point.xPercent, y: point.yPercent });
                    showToast(`已选定测点【${point.name}】水深 ${point.depth}m`, 'explore');
                  }}
                  style={{ top: `${point.yPercent}%`, left: `${point.xPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110 opacity-90'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center font-mono text-[9px] font-bold text-on-primary border border-surface-bright ${
                        isDropoff
                          ? 'bg-primary'
                          : isShallow
                          ? 'bg-secondary'
                          : 'bg-tertiary-container'
                      }`}
                    >
                      {point.depth}
                    </div>
                    {isSelected && (
                      <span className="mt-0.5 px-1 rounded bg-inverse-surface/95 text-inverse-on-surface text-[8px] font-mono whitespace-nowrap shadow-xs">
                        {point.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Active Sonar Probe Crosshair & Ping Wave */}
            <div
              style={{ top: `${probePos.y}%`, left: `${probePos.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
            >
              {/* Pulsing Sonar Beam Waves */}
              {isPinging && (
                <>
                  <div className="absolute w-16 h-16 rounded-full border-2 border-primary/60 animate-ping"></div>
                  <div className="absolute w-10 h-10 rounded-full border border-tertiary/80 animate-ping delay-100"></div>
                </>
              )}
              {/* Crosshair ring */}
              <div className="w-8 h-8 rounded-full border border-primary/80 bg-primary/20 backdrop-blur-xs flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
              </div>
            </div>

            {/* HUD Top Bar */}
            <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
              <div className="bg-inverse-surface/85 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm text-inverse-on-surface font-label-caps text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                <span>千岛湖·界首航道高精声呐回波</span>
              </div>
              <div className="bg-inverse-surface/85 backdrop-blur-md px-2 py-0.5 rounded text-surface-variant font-mono text-[9px]">
                {activeMode === 'sonar' ? `CHIRP ${sonarFreq}` : '手动标定'}
              </div>
            </div>

            {/* HUD Bottom Depth Zones Legend */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-inverse-surface/85 backdrop-blur-sm px-2 py-1 rounded font-label-caps text-[8px] text-inverse-on-surface pointer-events-none">
              <span className="flex items-center gap-1">
                <span className="w-2 h-1.5 rounded-xs bg-secondary"></span>
                浅滩草区 0-2m
              </span>
              <span className="flex items-center gap-1 font-bold text-primary-fixed">
                <span className="w-2 h-1.5 rounded-xs bg-primary"></span>
                陡坎铧尖 2-5.5m (黄金棚)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-1.5 rounded-xs bg-tertiary-container"></span>
                深槽深潭 5.5m+
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Bar for Current Probe Position */}
        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                waves
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                {activeMode === 'sonar' ? '声呐瞬时探测回波' : '当前标定水深'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 text-primary font-mono font-bold">
              <span className="text-xl">
                {activeMode === 'sonar' ? simulatedDepth : manualDepth}
              </span>
              <span className="text-xs">米</span>
            </div>
          </div>

          {/* Depth Zone & Substrate Classification */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-surface-container-lowest flex flex-col">
              <span className="font-label-caps text-[9px] text-outline">水深分区</span>
              <span className="font-semibold text-primary mt-0.5 truncate">
                {currentAnalysis.zoneLabel.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest flex flex-col">
              <span className="font-label-caps text-[9px] text-outline">水底底质研判</span>
              <span className="font-semibold text-on-surface mt-0.5 truncate">
                {activeMode === 'sonar'
                  ? simulatedDepth > 5.5
                    ? '碎石暗礁底'
                    : simulatedDepth > 2.0
                    ? '沙泥平缓底'
                    : '腐殖草根底'
                  : manualBottom}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest flex flex-col">
              <span className="font-label-caps text-[9px] text-outline">藏鱼指数</span>
              <span className="font-semibold text-tertiary font-mono mt-0.5">
                {currentAnalysis.score}% 极优
              </span>
            </div>
          </div>

          {/* Fish Hiding Prediction Callout */}
          <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-2 text-xs">
            <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">
              psychology_alt
            </span>
            <div className="flex flex-col leading-relaxed text-on-surface">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-on-surface">鱼群藏身与开口预测：</span>
                {currentAnalysis.targetFish.map((f, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-[10px] font-bold"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-on-surface-variant mt-1">{currentAnalysis.insight}</p>
            </div>
          </div>

          {/* Sonar Controls if in Sonar Mode */}
          {activeMode === 'sonar' && (
            <div className="flex items-center gap-space-sm pt-1">
              <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSonarFreq('200kHz')}
                  className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                    sonarFreq === '200kHz' ? 'bg-primary text-on-primary font-bold' : 'text-outline'
                  }`}
                >
                  200kHz (高精窄束)
                </button>
                <button
                  type="button"
                  onClick={() => setSonarFreq('83kHz')}
                  className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                    sonarFreq === '83kHz' ? 'bg-primary text-on-primary font-bold' : 'text-outline'
                  }`}
                >
                  83kHz (广角深潭)
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveSonarPoint}
                className="flex-1 h-10 rounded-xl bg-primary text-on-primary font-label-data-sm text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_location</span>
                <span>归档当前声呐测深点</span>
              </button>
            </div>
          )}

          {/* Manual Input Form if in Manual Mode */}
          {activeMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-space-sm pt-1">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-[10px] text-outline uppercase">
                    标点特称
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：孤岛下切铧尖"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    className="h-9 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-[10px] text-outline uppercase">
                    实测水深 (米)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={manualDepth}
                    onChange={e => setManualDepth(e.target.value)}
                    className="h-9 px-2.5 rounded-lg bg-surface-container-lowest text-primary font-mono font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-[10px] text-outline uppercase">
                    探底底质状况
                  </label>
                  <select
                    value={manualBottom}
                    onChange={e => setManualBottom(e.target.value as any)}
                    className="h-9 px-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="沙泥底">沙泥底 (平缓适合底钓)</option>
                    <option value="碎石乱礁">碎石乱礁 (易挂底/鳜鱼多)</option>
                    <option value="腐殖淤泥">腐殖淤泥 (水草浅滩大鲫)</option>
                    <option value="倒木沉树">倒木沉树 (巨物大鱼栖息)</option>
                    <option value="硬质粘土">硬质粘土 (走水微缓)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-[10px] text-outline uppercase">
                    实战心得标记
                  </label>
                  <input
                    type="text"
                    placeholder="如：倒木外侧3米有口"
                    value={manualNotes}
                    onChange={e => setManualNotes(e.target.value)}
                    className="h-9 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="h-10 rounded-xl bg-primary text-on-primary font-label-data-sm text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>确认录入水底测绘档案</span>
              </button>
            </form>
          )}
        </div>

        {/* Recorded Sounding Points Directory */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">
                format_list_bulleted
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                已测绘标点名录 ({soundingPoints.length})
              </span>
            </div>

            {/* Depth Zone Quick Filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDepthFilter('all')}
                className={`px-2 py-0.5 rounded font-label-caps text-[10px] cursor-pointer ${
                  depthFilter === 'all'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container text-outline'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setDepthFilter('shallow')}
                className={`px-2 py-0.5 rounded font-label-caps text-[10px] cursor-pointer ${
                  depthFilter === 'shallow'
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'bg-surface-container text-outline'
                }`}
              >
                浅滩 (0-2m)
              </button>
              <button
                onClick={() => setDepthFilter('dropoff')}
                className={`px-2 py-0.5 rounded font-label-caps text-[10px] cursor-pointer ${
                  depthFilter === 'dropoff'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container text-outline'
                }`}
              >
                铧尖陡坎 (2-5.5m)
              </button>
              <button
                onClick={() => setDepthFilter('deep')}
                className={`px-2 py-0.5 rounded font-label-caps text-[10px] cursor-pointer ${
                  depthFilter === 'deep'
                    ? 'bg-tertiary-container text-on-tertiary font-bold'
                    : 'bg-surface-container text-outline'
                }`}
              >
                深槽 (5.5m+)
              </button>
            </div>
          </div>

          {/* Sounding Points List */}
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredPoints.map(p => {
              const isSelected = p.id === selectedPointId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPointId(p.id);
                    setProbePos({ x: p.xPercent, y: p.yPercent });
                  }}
                  className={`p-space-sm rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-surface-container-high border-primary shadow-xs'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                      <span className="font-semibold text-on-surface text-xs truncate">{p.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-lowest text-primary font-mono text-[10px] font-bold">
                        {p.depth}m
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-tertiary font-bold">
                        藏鱼 {p.fishHidingScore}%
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          deleteSoundingPoint(p.id);
                        }}
                        className="text-outline hover:text-error text-xs cursor-pointer p-0.5"
                        title="删除测深记录"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete_outline</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span>{p.bottomType} · {p.structureTag}</span>
                    <span className="font-mono text-[10px] text-outline">{p.timeRecorded}</span>
                  </div>

                  {p.notes && (
                    <p className="text-[11px] text-outline leading-tight truncate">
                      {p.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action to switch Active Fishing Spot to this Sounding point */}
        <button
          onClick={() => {
            setIsBathymetryModalOpen(false);
            showToast(`已应用【${selectedPoint?.name || '测绘标点'}】水深数据至实战监测`, 'check_circle', 'success');
          }}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-data-sm text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>将选定测深数据设为当前作钓基准</span>
        </button>
      </div>
    </div>
  );
};
