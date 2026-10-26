import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const InsightsScreen: React.FC = () => {
  const { showToast, openLightbox } = useApp();
  const [activePeriod, setActivePeriod] = useState<'7d' | '30d' | 'season'>('30d');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handlePeriodChange = (period: '7d' | '30d' | 'season') => {
    setActivePeriod(period);
    const label = period === '7d' ? '近7天' : period === '30d' ? '近30天' : '本年度赛季';
    showToast(`已切换水情分析周期至 [${label}]`, 'calendar_month');
  };

  const handleSaveReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsReportModalOpen(false);
      showToast('战报复盘卡已成功渲染并保存至本地图册！', 'download_done');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full px-margin pb-safe select-none pt-space-md gap-space-lg">
      {/* 顶部沉浸式状态与报告导流卡 */}
      <div className="w-full bg-inverse-surface rounded-xl p-space-lg text-inverse-on-surface shadow-md relative overflow-hidden">
        {/* 背景等深线与标尺肌理 SVG */}
        <svg
          className="absolute -right-8 -bottom-10 w-56 h-56 text-primary-container/20 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
        >
          <path d="M10 100 C 40 10, 80 180, 190 90" strokeDasharray="3 3" strokeWidth="1.2"></path>
          <path d="M20 130 C 60 40, 110 170, 190 120" strokeWidth="1.5"></path>
          <path d="M0 160 C 70 80, 130 190, 200 150" strokeWidth="1.5"></path>
          <circle cx="130" cy="110" fill="currentColor" r="4"></circle>
          <circle cx="130" cy="110" r="14" stroke="currentColor" strokeWidth="1"></circle>
        </svg>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-primary-fixed-dim uppercase tracking-wider">
              AI Hydrodynamic Inference v2.4
            </span>
          </div>
          <span className="font-label-data-sm text-[11px] text-surface-variant/80">
            {activePeriod === '7d' ? '样本量: 7 场 / 42 尾' : activePeriod === '30d' ? '样本量: 28 场 / 164 尾' : '样本量: 94 场 / 488 尾'}
          </span>
        </div>

        <div className="mt-space-sm relative z-10">
          <h2 className="font-headline-md text-headline-md tracking-tight text-surface-bright">
            水情规律与作钓决策分析
          </h2>
          <p className="font-body-sm text-body-sm text-surface-variant/90 mt-1 leading-relaxed">
            基于气压回升速率、水温差值梯度与咬钩窗口的实战归纳模型。
          </p>
        </div>

        {/* 周期筛选与报告导出工具条 */}
        <div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs relative z-10 border-t border-outline/20">
          <div className="inline-flex p-0.5 bg-inverse-surface/80 rounded-full border border-outline/20">
            <button
              type="button"
              onClick={() => handlePeriodChange('7d')}
              className={`px-2.5 py-1 rounded-full font-label-data-sm text-[11px] transition-all cursor-pointer ${
                activePeriod === '7d'
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-surface-bright'
              }`}
            >
              近7天
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('30d')}
              className={`px-2.5 py-1 rounded-full font-label-data-sm text-[11px] transition-all cursor-pointer ${
                activePeriod === '30d'
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-surface-bright'
              }`}
            >
              近30天
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('season')}
              className={`px-2.5 py-1 rounded-full font-label-data-sm text-[11px] transition-all cursor-pointer ${
                activePeriod === 'season'
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-surface-bright'
              }`}
            >
              本年度赛季
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-primary rounded-xl font-label-data-sm text-label-data-sm font-medium hover:bg-surface-bright active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">summarize</span>
            <span>战报复盘卡</span>
          </button>
        </div>
      </div>

      {/* 1. 核心研判引擎推荐卡 (AI推演) */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-tertiary-container text-[18px]">
              psychology_alt
            </span>
            <span className="font-label-caps text-label-caps text-on-surface uppercase font-semibold">
              次日水情策略推演
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-[10px] font-semibold">
            命中置信度 91%
          </span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-sm text-headline-sm text-primary">明日 05:30 强窗口期</span>
            <span className="font-label-data-sm text-[11px] text-tertiary-container font-semibold">
              气压梯度 +7 hPa (跃变)
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface leading-snug">
            气压将自 <span className="font-label-data-sm text-on-surface font-semibold">1008</span> 上升至{' '}
            <span className="font-label-data-sm text-primary font-semibold">1015 hPa</span>
            。建议抢占<span className="font-body-md font-semibold text-primary">界首桦树林铧尖</span>
            ，拟使用 <span className="font-label-data-sm text-on-surface font-medium">6.3m</span>{' '}
            中硬调竿钓 <span className="font-label-data-sm text-on-surface font-medium">3.2m</span>{' '}
            草坎底，目标偏重大体型原塘鲤鱼。
          </p>
          <div className="flex flex-wrap items-center gap-space-xs mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-highest rounded-full text-on-surface font-label-data-sm text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 线组: 主2.0# / 子1.2# 碳线
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-highest rounded-full text-on-surface font-label-data-sm text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 钩型: 新关东 0.8#
            </span>
          </div>
        </div>
      </div>

      {/* 2. 核心判断模型：气压与温差中鱼命中矩阵 */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              气压区间中鱼率与温差相关性
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              气压曲线中段稳压与水温表底差联动
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            ssid_chart
          </span>
        </div>

        {/* 气压与咬钩折线模拟仪表 */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              中鱼命中率 (气压台阶分布)
            </span>
            <span className="font-label-data-sm text-[11px] text-tertiary-container font-semibold">
              峰值: 1012-1016 hPa (84%)
            </span>
          </div>

          {/* 纯 SVG 气压中鱼率分布折线与高亮区域 */}
          <div className="w-full h-32 relative">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 320 100"
            >
              <defs>
                <linearGradient id="optimumZone" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#24718a" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="#24718a" stopOpacity="0.02"></stop>
                </linearGradient>
              </defs>
              {/* 刻度线 */}
              <line
                stroke="#bfc8cd"
                strokeDasharray="2 4"
                strokeOpacity="0.4"
                x1="0"
                x2="320"
                y1="20"
                y2="20"
              ></line>
              <line
                stroke="#bfc8cd"
                strokeDasharray="2 4"
                strokeOpacity="0.4"
                x1="0"
                x2="320"
                y1="55"
                y2="55"
              ></line>
              <line
                stroke="#bfc8cd"
                strokeOpacity="0.3"
                x1="0"
                x2="320"
                y1="90"
                y2="90"
              ></line>

              {/* 黄金咬钩窗口 (1012 - 1016) 浅底背景 */}
              <rect
                fill="url(#optimumZone)"
                height="80"
                rx="4"
                width="75"
                x="145"
                y="10"
              ></rect>

              {/* 折线曲线 */}
              <path
                d="M 10,84 C 50,82 80,75 110,65 C 130,55 155,16 182,16 C 210,16 230,42 260,60 C 290,75 310,79 320,82"
                fill="none"
                stroke="#24718a"
                strokeLinecap="round"
                strokeWidth="2.5"
              ></path>

              {/* 数据锚点 */}
              <circle cx="70" cy="78" fill="#ffffff" r="3" stroke="#24718a" strokeWidth="2"></circle>
              <circle cx="182" cy="16" fill="#ba400a" r="4.5" stroke="#ffffff" strokeWidth="2"></circle>
              <circle cx="260" cy="60" fill="#ffffff" r="3" stroke="#24718a" strokeWidth="2"></circle>

              {/* 顶点标注 */}
              <text
                className="font-label-caps"
                fill="#ba400a"
                fontSize="8"
                fontWeight="700"
                textAnchor="middle"
                x="182"
                y="10"
              >
                84% 活跃峰
              </text>
            </svg>

            {/* 横坐标轴 */}
            <div className="flex justify-between items-center text-[10px] font-label-data-sm text-outline mt-1 px-1">
              <span>&lt;1000</span>
              <span>1004</span>
              <span>1008</span>
              <span className="text-tertiary-container font-semibold">1012-1016</span>
              <span>1020</span>
              <span>&gt;1024 hPa</span>
            </div>
          </div>
        </div>

        {/* 温差柱状剖析条 */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              气温与浅层水温温差 (|ΔT|)
            </span>
            <span className="font-label-data-sm text-[11px] text-primary font-medium">
              温差 &lt; 5℃ 接口最干脆
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="flex flex-col items-center gap-1.5 p-2 bg-surface-container rounded-xl">
              <span className="font-label-caps text-[10px] text-on-surface-variant">&lt; 3℃ (极优)</span>
              <div className="w-full bg-surface-container-highest h-14 rounded flex flex-col justify-end p-0.5">
                <div className="w-full bg-primary-container rounded h-[90%] flex items-center justify-center">
                  <span className="font-label-caps text-[9px] text-on-primary font-semibold">92%</span>
                </div>
              </div>
              <span className="font-label-data-sm text-[10px] text-on-surface">稳浮送漂</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-surface-container rounded-xl">
              <span className="font-label-caps text-[10px] text-on-surface-variant">3-5℃ (常态)</span>
              <div className="w-full bg-surface-container-highest h-14 rounded flex flex-col justify-end p-0.5">
                <div className="w-full bg-secondary rounded h-[72%] flex items-center justify-center">
                  <span className="font-label-caps text-[9px] text-on-primary font-semibold">72%</span>
                </div>
              </div>
              <span className="font-label-data-sm text-[10px] text-on-surface">顿口清晰</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-surface-container rounded-xl">
              <span className="font-label-caps text-[10px] text-on-surface-variant">6-8℃ (水温滞后)</span>
              <div className="w-full bg-surface-container-highest h-14 rounded flex flex-col justify-end p-0.5">
                <div className="w-full bg-secondary-fixed-dim rounded h-[38%] flex items-center justify-center">
                  <span className="font-label-caps text-[9px] text-on-surface font-semibold">38%</span>
                </div>
              </div>
              <span className="font-label-data-sm text-[10px] text-outline">滑口轻触</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-surface-container rounded-xl">
              <span className="font-label-caps text-[10px] text-on-surface-variant">&gt; 8℃ (骤降温)</span>
              <div className="w-full bg-surface-container-highest h-14 rounded flex flex-col justify-end p-0.5">
                <div className="w-full bg-error-container rounded h-[15%] flex items-center justify-center">
                  <span className="font-label-caps text-[9px] text-error font-semibold">12%</span>
                </div>
              </div>
              <span className="font-label-data-sm text-[10px] text-error">离底闭口</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 饵料与鱼种命中构成分析 */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              饵系选择与目标鱼种战损比
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              实操统计：各饵法实战中鱼占比与主攻鱼种
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            set_meal
          </span>
        </div>

        {/* 饵料分布卡列表 */}
        <div className="flex flex-col gap-space-xs">
          {/* 谷麦发酵料 */}
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                <span className="font-body-md font-semibold text-on-surface">谷麦/老玉米发酵料</span>
              </div>
              <span className="font-label-data-md font-bold text-primary">
                52% <span className="font-label-caps text-[10px] font-normal text-on-surface-variant">命中率</span>
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '52%' }}></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-data-sm text-[11px] pt-0.5">
              <span>主攻鱼种: 野生大鲤鱼、草鱼 (底栖巨物)</span>
              <span className="text-primary font-medium">85 尾记录</span>
            </div>
          </div>

          {/* 螺肉腥香搓饵 */}
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                <span className="font-body-md font-semibold text-on-surface">活螺粒 / 腥香硬搓饵</span>
              </div>
              <span className="font-label-data-md font-bold text-tertiary">
                28% <span className="font-label-caps text-[10px] font-normal text-on-surface-variant">命中率</span>
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div className="bg-tertiary-container h-full rounded-full" style={{ width: '28%' }}></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-data-sm text-[11px] pt-0.5">
              <span>主攻鱼种: 水库青鱼、老塘鳊鱼 (深水静音区)</span>
              <span className="text-tertiary font-medium">46 尾记录</span>
            </div>
          </div>

          {/* 路亚软饵亮片 */}
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span className="font-body-md font-semibold text-on-surface">
                  微物软饵 / 慢摇复合亮片
                </span>
              </div>
              <span className="font-label-data-md font-bold text-secondary">
                20% <span className="font-label-caps text-[10px] font-normal text-on-surface-variant">命中率</span>
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '20%' }}></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-data-sm text-[11px] pt-0.5">
              <span>主攻鱼种: 倒木石缝鳜鱼、开阔水面红尾翘嘴</span>
              <span className="text-secondary font-medium">33 尾记录</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 科学手绘鱼种生态图鉴与水层习性对照 */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              鱼种生态水层与习性手记
            </h3>
          </div>
          <span className="font-label-caps text-label-caps text-outline">FIELD GUIDE</span>
        </div>

        {/* 典藏科学手绘插图卡 */}
        <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-low flex flex-col">
          <div
            onClick={() =>
              openLightbox(
                '/src/assets/images/fish_species_plate_1793009822638.jpg',
                'PLATE 04 · 原生拟饵与台钓共栖图谱：鳜鱼 & 鲫鱼'
              )
            }
            className="w-full h-52 relative overflow-hidden bg-surface-dim cursor-pointer group"
          >
            <img
              alt="Freshwater Fishes of Asia Field Guide"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src="/src/assets/images/fish_species_plate_1793009822638.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end p-space-md">
              <div className="text-surface-bright flex flex-col">
                <span className="font-label-caps text-[10px] text-tertiary-fixed tracking-widest uppercase">
                  PLATE 04 · BENTHIC & PREDATORY ECOSYSTEM
                </span>
                <span className="font-headline-sm text-[15px] font-semibold">
                  原生拟饵与台钓共栖图谱：鳜鱼 & 鲫鱼
                </span>
              </div>
            </div>
          </div>

          {/* 鱼种习性拆解对照列表 */}
          <div className="p-space-md flex flex-col gap-space-sm">
            <div className="grid grid-cols-2 gap-space-sm">
              {/* 鳜鱼 */}
              <div className="p-space-sm bg-surface-container rounded-xl flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-body-md font-semibold text-on-surface">鳜鱼 (鳌花)</span>
                  <span className="px-1.5 py-0.5 bg-tertiary-fixed-dim/40 text-tertiary font-label-caps text-[9px] rounded font-bold">
                    掠食性
                  </span>
                </div>
                <p className="font-label-data-sm text-[10px] text-on-surface-variant italic">
                  Siniperca chuatsi
                </p>
                <div className="mt-1 flex flex-col gap-0.5 text-on-surface font-body-sm text-[11px]">
                  <div>
                    <span className="text-outline">潜伏层:</span> 乱石缝底、倒木草脚
                  </div>
                  <div>
                    <span className="text-outline">窗口期:</span> 晨曦/黄昏微光时分
                  </div>
                  <div>
                    <span className="text-outline">策略:</span> 德州钓组轻跳慢拖，触底即收
                  </div>
                </div>
              </div>

              {/* 鲫鱼 */}
              <div className="p-space-sm bg-surface-container rounded-xl flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-body-md font-semibold text-on-surface">野生鲫鱼 (土鲫)</span>
                  <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container font-label-caps text-[9px] rounded font-bold">
                    底栖杂食
                  </span>
                </div>
                <p className="font-label-data-sm text-[10px] text-on-surface-variant italic">
                  Carassius carassius
                </p>
                <div className="mt-1 flex flex-col gap-0.5 text-on-surface font-body-sm text-[11px]">
                  <div>
                    <span className="text-outline">潜伏层:</span> 苦草带边缘、浅滩回水
                  </div>
                  <div>
                    <span className="text-outline">窗口期:</span> 阴雨天或气压微升下午
                  </div>
                  <div>
                    <span className="text-outline">策略:</span> 调四钓二，小细地瓜粉软粘饵
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">eco</span>
                <span className="font-body-sm text-[12px] text-on-surface">
                  水生植物提示：<strong className="font-medium">苦草(Vallisneria)</strong> 附近溶氧高，宜作标点
                </span>
              </div>
              <span className="font-label-caps text-[10px] text-secondary font-semibold">
                ECO DETECTED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 复盘分析弹层容器 (点击"战报复盘卡"展开) */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex flex-col justify-end p-margin animate-in fade-in"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  鱼迹 · 阶段作战复盘卡
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
              <div className="flex justify-between items-center text-on-surface font-label-data-sm text-[12px]">
                <span>
                  统计区间: <strong className="font-semibold text-primary">2024.03.01 ~ 2024.03.31</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-outline-variant text-[10px]">
                  校验通过
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="flex flex-col items-center bg-surface-container-lowest p-2 rounded-xl">
                  <span className="font-label-caps text-label-caps text-outline">总抛竿命中</span>
                  <span className="font-label-data-lg text-label-data-lg text-primary">
                    164 <span className="text-xs">尾</span>
                  </span>
                </div>
                <div className="flex flex-col items-center bg-surface-container-lowest p-2 rounded-xl">
                  <span className="font-label-caps text-label-caps text-outline">最佳钓获水深</span>
                  <span className="font-label-data-lg text-label-data-lg text-tertiary">
                    2.8 <span className="text-xs">m</span>
                  </span>
                </div>
                <div className="flex flex-col items-center bg-surface-container-lowest p-2 rounded-xl">
                  <span className="font-label-caps text-label-caps text-outline">有效口转化率</span>
                  <span className="font-label-data-lg text-label-data-lg text-secondary">
                    76.4 <span className="text-xs">%</span>
                  </span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                复盘结论：春季向浅滩推进过程中，气压回升后第 4-6 小时为进食最猛烈时期，应优先选用谷麦打重窝慢守。微物路亚宜沿倒木向深水区扇形抛投。
              </p>
            </div>

            <div className="flex gap-space-sm pt-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleSaveReport}
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-data-sm text-label-data-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
                  {isExporting ? 'sync' : 'download_for_offline'}
                </span>
                <span>{isExporting ? '正在生成图表并导出...' : '保存报告至手机相册'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
