import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

// Preset scenarios for demonstration and actual analysis
export type PressureScenarioKey = 'sharp_drop' | 'steady_rise' | 'stable_optimum' | 'low_depress';

interface PressurePoint {
  hourOffset: number; // -24 to 0
  label: string;      // e.g. "04:00"
  pressure: number;   // in hPa
  temp: number;       // water temp
}

const generateScenarioData = (scenario: PressureScenarioKey): PressurePoint[] => {
  const points: PressurePoint[] = [];
  const nowHour = 16; // say current time is 16:00

  for (let i = 24; i >= 0; i--) {
    const h = (nowHour - i + 24) % 24;
    const timeLabel = `${String(h).padStart(2, '0')}:00`;
    let p = 1014;
    let t = 18.2;

    if (scenario === 'sharp_drop') {
      // High stable early, then rapid plunge in last 5 hours (e.g. approaching squall/cold front)
      if (i > 6) {
        p = 1015.5 - (24 - i) * 0.1 + Math.sin(i) * 0.3;
        t = 18.5;
      } else {
        // Drop precipitously from ~1014 to 1006.8
        const dropStep = (6 - i) * 1.35;
        p = 1014.2 - dropStep;
        t = 18.0 - dropStep * 0.2;
      }
    } else if (scenario === 'steady_rise') {
      // Steady climb from 1009 to 1015.4
      const progress = (24 - i) / 24;
      p = 1009.2 + progress * 6.2 + Math.sin(i * 0.5) * 0.2;
      t = 17.5 + progress * 0.8;
    } else if (scenario === 'stable_optimum') {
      // Optimal window hovering 1013.8 - 1015.2
      p = 1014.5 + Math.sin(i * 0.8) * 0.6;
      t = 18.4 + Math.cos(i * 0.5) * 0.3;
    } else {
      // Low depress 1002 - 1005 hPa
      p = 1003.8 + Math.sin(i * 0.7) * 0.8;
      t = 16.8 + Math.sin(i * 0.3) * 0.4;
    }

    points.push({
      hourOffset: -i,
      label: i === 0 ? '现在' : timeLabel,
      pressure: parseFloat(p.toFixed(1)),
      temp: parseFloat(t.toFixed(1))
    });
  }

  return points;
};

export const PressureTrendCard: React.FC = () => {
  const { showToast } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<PressureScenarioKey>('sharp_drop');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const dataPoints = useMemo(() => {
    return generateScenarioData(selectedScenario);
  }, [selectedScenario]);

  // Current reading and historical comparisons
  const currentPoint = dataPoints[dataPoints.length - 1];
  const point3hAgo = dataPoints[dataPoints.length - 4] || dataPoints[0];
  const point24hAgo = dataPoints[0];

  const delta3h = parseFloat((currentPoint.pressure - point3hAgo.pressure).toFixed(1));
  const delta24h = parseFloat((currentPoint.pressure - point24hAgo.pressure).toFixed(1));

  // Minimum & Maximum across 24h
  const pressures = dataPoints.map(d => d.pressure);
  const minPressure = Math.min(...pressures);
  const maxPressure = Math.max(...pressures);

  // Sharp drop criteria:
  // 1) 3h drop >= 2.2 hPa, or
  // 2) 24h drop >= 5.5 hPa with negative velocity
  const isSharpDrop = delta3h <= -2.2 || (delta24h <= -5.5 && delta3h < 0);

  // Fish bite probability score (0 - 100%)
  const biteProbability = useMemo(() => {
    if (isSharpDrop) {
      // Severe drop: fish swim bladders are compressed/uncomfortable, oxygen levels plummet
      return Math.max(15, Math.min(32, Math.round(30 + delta3h * 3.5)));
    }
    if (delta3h > 1.0 && currentPoint.pressure >= 1012 && currentPoint.pressure <= 1017) {
      return 92; // golden prime window
    }
    if (currentPoint.pressure >= 1012 && currentPoint.pressure <= 1016) {
      return 85;
    }
    if (currentPoint.pressure < 1006) {
      return 38;
    }
    return 68;
  }, [isSharpDrop, delta3h, currentPoint.pressure]);

  // SVG Chart Dimensions
  const svgWidth = 320;
  const svgHeight = 110;
  const padLeft = 28;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 22;

  const yMin = Math.min(1002, Math.floor(minPressure - 1.5));
  const yMax = Math.max(1018, Math.ceil(maxPressure + 1.5));

  const getX = (index: number) => {
    const usableWidth = svgWidth - padLeft - padRight;
    return padLeft + (index / (dataPoints.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = svgHeight - padTop - padBottom;
    const ratio = (val - yMin) / (yMax - yMin);
    return padTop + usableHeight * (1 - ratio);
  };

  // Build SVG path
  const pathD = useMemo(() => {
    return dataPoints.reduce((acc, pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.pressure);
      return idx === 0 ? `M ${x.toFixed(1)},${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)},${y.toFixed(1)}`;
    }, '');
  }, [dataPoints, yMin, yMax]);

  // Build closed area for gradient fill
  const areaD = useMemo(() => {
    if (dataPoints.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(dataPoints.length - 1);
    const bottomY = svgHeight - padBottom;
    return `${pathD} L ${lastX.toFixed(1)},${bottomY} L ${firstX.toFixed(1)},${bottomY} Z`;
  }, [pathD, dataPoints]);

  const inspectedPoint = hoveredPointIndex !== null ? dataPoints[hoveredPointIndex] : currentPoint;

  const handleScenarioChange = (scenario: PressureScenarioKey) => {
    setSelectedScenario(scenario);
    setHoveredPointIndex(null);
    if (scenario === 'sharp_drop') {
      showToast('已加载气压急剧下降实况：触发闭口预警', 'warning', 'warning');
    } else if (scenario === 'steady_rise') {
      showToast('已加载稳压爬升实况：开口率高达 92%', 'trending_up', 'success');
    } else if (scenario === 'stable_optimum') {
      showToast('已加载高位稳压水况：适合深水大物', 'verified', 'info');
    } else {
      showToast('已加载低压闷热气象：水表溶氧偏低', 'cloud', 'info');
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/30 transition-all">
      {/* Header bar: Title & 24h Scenario Switcher */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-[20px] ${isSharpDrop ? 'text-error animate-bounce' : 'text-primary'}`}>
              {isSharpDrop ? 'crisis_alert' : 'speed'}
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                24小时定点气压波动监测
              </h3>
              <span className="font-label-caps text-[10px] text-outline font-mono">
                BAROMETRIC 24H
              </span>
            </div>
          </div>

          {/* Real-time Open Rate Badge */}
          <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 font-label-caps text-[11px] font-bold ${
            isSharpDrop
              ? 'bg-error-container text-on-error-container'
              : biteProbability >= 80
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-surface-container-high text-primary'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSharpDrop ? 'bg-error animate-ping' : 'bg-primary'}`}></span>
            <span>开口率 {biteProbability}%</span>
          </div>
        </div>

        <p className="font-body-sm text-[12px] text-on-surface-variant leading-tight">
          鱼类内鳔对气压波动极其敏感，气压骤降致使水体溶氧暴跌并引发不适停口。
        </p>

        {/* Scenario Toggle Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] font-label-caps text-outline shrink-0 mr-1">水象推演:</span>
          <button
            onClick={() => handleScenarioChange('sharp_drop')}
            className={`px-2 py-0.5 rounded font-label-caps text-[11px] transition-all cursor-pointer whitespace-nowrap ${
              selectedScenario === 'sharp_drop'
                ? 'bg-error text-on-error font-bold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            ⚠️ 气压骤降 (预警)
          </button>
          <button
            onClick={() => handleScenarioChange('steady_rise')}
            className={`px-2 py-0.5 rounded font-label-caps text-[11px] transition-all cursor-pointer whitespace-nowrap ${
              selectedScenario === 'steady_rise'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            稳压爬升 (黄金期)
          </button>
          <button
            onClick={() => handleScenarioChange('stable_optimum')}
            className={`px-2 py-0.5 rounded font-label-caps text-[11px] transition-all cursor-pointer whitespace-nowrap ${
              selectedScenario === 'stable_optimum'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            高位恒压 (守大物)
          </button>
          <button
            onClick={() => handleScenarioChange('low_depress')}
            className={`px-2 py-0.5 rounded font-label-caps text-[11px] transition-all cursor-pointer whitespace-nowrap ${
              selectedScenario === 'low_depress'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            低压阴沉 (轻口)
          </button>
        </div>
      </div>

      {/* Prominent Sharp Drop Warning Banner if Pressure is Plunging */}
      {isSharpDrop ? (
        <div className="p-space-md rounded-xl bg-error-container/40 border border-error/50 flex flex-col gap-1.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-error font-bold text-sm">
              <span className="material-symbols-outlined text-[20px] animate-pulse">warning</span>
              <span className="tracking-wide">【气压骤降警报 · 闭口离底风险高】</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-error text-on-error font-mono text-[10px] font-bold">
              3H 变率 {delta3h} hPa
            </span>
          </div>
          <div className="text-xs text-on-surface leading-relaxed flex flex-col gap-1">
            <p>
              <strong className="text-error font-semibold">水文机理：</strong>
              近3小时内气压暴跌 <span className="font-mono font-bold text-error">{Math.abs(delta3h)} hPa</span>，底层溶氧急速析出，鱼类为平衡体内鳔压已离底上浮，出现典型的<strong className="text-error font-semibold">浮头、停口、拒绝吞饵</strong>现象。
            </p>
            <div className="mt-1 p-2 rounded-lg bg-surface-container-lowest/80 border border-error/20 text-[11px] flex items-start gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">lightbulb</span>
              <span className="text-on-surface-variant">
                <strong className="text-primary font-semibold">作钓策略调整：</strong>
                放弃底层重窝守钓，建议换至<strong>下风口浪花处/进出水口等高溶氧带</strong>；线组调灵（改飞铅或浮钓中上层），换小号细柄钩，使用皮薄活体红虫或清淡雾化饵轻轻拖逗抓轻触口。
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-space-sm rounded-xl bg-surface-container-low border border-primary/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping shrink-0"></span>
            <span className="text-on-surface">
              {delta3h >= 0 ? (
                <>
                  气压处于稳定上升区间（<span className="font-mono text-primary font-bold">+{delta3h} hPa/3h</span>），水体溶氧饱和，底层大物觅食积极。
                </>
              ) : (
                <>
                  气压微幅波动在常态阈值内（<span className="font-mono text-secondary font-bold">{delta3h} hPa/3h</span>），鱼情平稳，可按原定战术守点。
                </>
              )}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-mono text-[10px] shrink-0 font-semibold">
            状态健康
          </span>
        </div>
      )}

      {/* 24-Hour SVG Trend Curve Visualization */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
        {/* Telemetry Indicator Row */}
        <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="text-outline text-[11px]">查看时间:</span>
            <span className="text-primary font-bold">{inspectedPoint.label}</span>
            <span className="text-outline">·</span>
            <span className="text-outline text-[11px]">读数:</span>
            <span className={`font-bold ${isSharpDrop ? 'text-error' : 'text-primary'}`}>
              {inspectedPoint.pressure} hPa
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-outline">24h极差:</span>
            <span className="text-on-surface font-semibold">
              {minPressure} ~ {maxPressure} hPa
            </span>
            <span className={`font-bold ${delta24h >= 0 ? 'text-primary' : 'text-error'}`}>
              ({delta24h >= 0 ? `+${delta24h}` : delta24h})
            </span>
          </div>
        </div>

        {/* SVG Curve Container */}
        <div className="relative w-full h-[115px] select-none">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pressureCurveGrad" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isSharpDrop ? '#ba400a' : '#24718a'}
                  stopOpacity={isSharpDrop ? '0.35' : '0.25'}
                />
                <stop
                  offset="100%"
                  stopColor={isSharpDrop ? '#ba400a' : '#24718a'}
                  stopOpacity="0.0"
                />
              </linearGradient>

              {/* Optimum Feeding Band (1012 - 1016 hPa) Pattern */}
              <linearGradient id="optimumBandGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#24718a" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#24718a" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {/* Optimum 1012 - 1016 hPa Zone Rect */}
            {getY(1016) < getY(1012) && (
              <rect
                x={padLeft}
                y={getY(1016)}
                width={svgWidth - padLeft - padRight}
                height={getY(1012) - getY(1016)}
                fill="url(#optimumBandGrad)"
              />
            )}

            {/* Grid Lines */}
            {[1016, 1012, 1008, 1004].map(val => {
              if (val < yMin || val > yMax) return null;
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padLeft}
                    x2={svgWidth - padRight}
                    y1={y}
                    y2={y}
                    stroke="#bfc8cd"
                    strokeWidth="0.8"
                    strokeDasharray={val === 1012 || val === 1016 ? '2 2' : '1 3'}
                    strokeOpacity={val === 1012 || val === 1016 ? '0.6' : '0.25'}
                  />
                  <text
                    x={padLeft - 4}
                    y={y + 3}
                    textAnchor="end"
                    fill="#70787d"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Optimum Zone Label */}
            <text
              x={svgWidth - padRight - 2}
              y={getY(1014) + 2}
              textAnchor="end"
              fill="#24718a"
              fontSize="7"
              fontWeight="600"
              fontFamily="sans-serif"
              opacity="0.8"
            >
              黄金开口带 1012-1016
            </text>

            {/* Area Fill */}
            <path d={areaD} fill="url(#pressureCurveGrad)" />

            {/* Main Trend Line */}
            <path
              d={pathD}
              fill="none"
              stroke={isSharpDrop ? '#ba400a' : '#24718a'}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Plunge section highlight if sharp drop */}
            {isSharpDrop && (
              <path
                d={dataPoints.slice(dataPoints.length - 6).reduce((acc, pt, idx) => {
                  const globalIdx = dataPoints.length - 6 + idx;
                  const x = getX(globalIdx);
                  const y = getY(pt.pressure);
                  return idx === 0 ? `M ${x.toFixed(1)},${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)},${y.toFixed(1)}`;
                }, '')}
                fill="none"
                stroke="#b3261e"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Data Nodes */}
            {dataPoints.map((pt, idx) => {
              // Show key nodes every 3 hours
              const isKeyNode = idx % 3 === 0 || idx === dataPoints.length - 1;
              const isHovered = hoveredPointIndex === idx;
              const isCurrent = idx === dataPoints.length - 1;
              const x = getX(idx);
              const y = getY(pt.pressure);

              if (!isKeyNode && !isHovered) return null;

              return (
                <g key={idx}>
                  {isCurrent && isSharpDrop && (
                    <circle cx={x} cy={y} r="8" fill="#ba400a" opacity="0.25" className="animate-ping" />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 4.5 : isCurrent ? 3.5 : 2}
                    fill={isCurrent ? (isSharpDrop ? '#ba400a' : '#ba400a') : '#ffffff'}
                    stroke={isSharpDrop ? '#ba400a' : '#24718a'}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />
                </g>
              );
            })}

            {/* Vertical Scrubber Line when hovering */}
            {hoveredPointIndex !== null && (
              <line
                x1={getX(hoveredPointIndex)}
                x2={getX(hoveredPointIndex)}
                y1={padTop}
                y2={svgHeight - padBottom}
                stroke="#ba400a"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}
          </svg>

          {/* Transparent touch/click layers across all points for smooth scrubbing */}
          <div className="absolute inset-0 flex" style={{ paddingLeft: `${padLeft}px`, paddingRight: `${padRight}px` }}>
            {dataPoints.map((_, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onTouchStart={() => setHoveredPointIndex(idx)}
                onClick={() => setHoveredPointIndex(idx)}
                className="flex-1 h-full cursor-crosshair"
                title={`点击查看该时刻气压与鱼口`}
              />
            ))}
          </div>
        </div>

        {/* X Axis Time Labels */}
        <div className="flex justify-between items-center text-[10px] font-mono text-outline px-1">
          <span>-24h (昨日)</span>
          <span>-18h</span>
          <span>-12h</span>
          <span>-6h</span>
          <span>-3h</span>
          <span className={`font-bold ${isSharpDrop ? 'text-error' : 'text-primary'}`}>现在</span>
        </div>

        {/* Footer 3-Grid Quick Analysis Pill */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-container text-center">
          <div className="p-1.5 bg-surface-container rounded-lg flex flex-col">
            <span className="font-label-caps text-[9px] text-outline">近3小时走势</span>
            <span className={`font-mono text-xs font-bold flex items-center justify-center gap-0.5 ${
              delta3h < -2.0 ? 'text-error' : delta3h > 1.0 ? 'text-primary' : 'text-on-surface'
            }`}>
              {delta3h < 0 ? '↓' : '↑'} {delta3h} hPa
            </span>
          </div>

          <div className="p-1.5 bg-surface-container rounded-lg flex flex-col">
            <span className="font-label-caps text-[9px] text-outline">24h气压幅度</span>
            <span className="font-mono text-xs font-bold text-on-surface">
              Δ {(maxPressure - minPressure).toFixed(1)} hPa
            </span>
          </div>

          <div className="p-1.5 bg-surface-container rounded-lg flex flex-col">
            <span className="font-label-caps text-[9px] text-outline">鱼口预估评级</span>
            <span className={`font-label-caps text-[11px] font-bold ${
              isSharpDrop ? 'text-error' : biteProbability >= 80 ? 'text-primary' : 'text-secondary'
            }`}>
              {isSharpDrop ? '闭口浮头' : biteProbability >= 80 ? '旺咬大咬' : '常态觅食'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
