import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CatchRecord } from '../types';
import { PressureTrendCard } from '../components/PressureTrendCard';
import { BaitRecommendationCard } from '../components/BaitRecommendationCard';

export const WorkstationScreen: React.FC = () => {
  const {
    tasks,
    toggleTask,
    addTask,
    catches,
    activeSpot,
    setIsSpotMapModalOpen,
    setIsBathymetryModalOpen,
    setInspectedCatch,
    chumMinutesElapsed,
    resetChumTimer,
    windowCountdownSeconds,
    recordQuickStrike,
    setActiveTab,
    showToast,
    openLightbox
  } = useApp();

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [selectedFish, setSelectedFish] = useState('野生鲤鱼');
  const [selectedSignal, setSelectedSignal] = useState('清脆下顿 (正口)');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');

  // Format countdown
  const formatCountdown = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;

  const handleQuickStrikeSubmit = () => {
    recordQuickStrike(selectedFish, selectedSignal);
    setIsQuickLogOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      tag: newTaskTag.trim() || '实战备战',
      desc: '钓场临场策略待办事项'
    });
    setNewTaskTitle('');
    setNewTaskTag('');
    setIsAddingTask(false);
  };

  return (
    <div className="flex flex-col w-full pb-safe">
      {/* Top Hydro & Telemetry Strip */}
      <section className="px-margin pt-space-md pb-space-sm">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          {/* Location & Status Beacon */}
          <div
            onClick={() => setIsSpotMapModalOpen(true)}
            className="flex items-center justify-between cursor-pointer group"
            title="点击切换当前监测水区"
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="material-symbols-outlined text-[18px] text-tertiary-container animate-pulse">
                place
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors">
                {activeSpot.title}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps uppercase tracking-wider shrink-0 flex items-center gap-1 group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {activeSpot.statusBadge}
            </span>
          </div>

          {/* Real-time Water & Weather Gauge Cards */}
          <div className="grid grid-cols-4 gap-gutter bg-surface-container-low p-space-sm rounded-lg">
            <div className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest rounded">
              <span className="font-label-caps text-label-caps text-on-surface-variant">表层水温</span>
              <span className="font-label-data-md text-label-data-md font-semibold text-primary mt-0.5">
                18.4℃
              </span>
              <span className="text-[9px] font-mono text-secondary mt-0.5">温差 -0.2</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest rounded">
              <span className="font-label-caps text-label-caps text-on-surface-variant">定点气压</span>
              <span className="font-label-data-md text-label-data-md font-semibold text-primary mt-0.5">
                1014<span className="text-[10px]">hPa</span>
              </span>
              <span className="text-[9px] font-mono text-tertiary-container mt-0.5 flex items-center">
                ↑ 旺咬期
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest rounded">
              <span className="font-label-caps text-label-caps text-on-surface-variant">风向/风力</span>
              <span className="font-label-data-md text-label-data-md font-semibold text-primary mt-0.5">
                东南 2级
              </span>
              <span className="text-[9px] font-mono text-secondary mt-0.5">轻拂微澜</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest rounded">
              <span className="font-label-caps text-label-caps text-on-surface-variant">水色/透光</span>
              <span className="font-label-data-md text-label-data-md font-semibold text-primary mt-0.5">
                1.2<span className="text-[10px]">m</span>
              </span>
              <span className="text-[9px] font-mono text-secondary mt-0.5">微浑沉实</span>
            </div>
          </div>

          {/* Quick Bathymetry Sounding Action */}
          <div className="pt-0.5">
            <button
              onClick={() => setIsBathymetryModalOpen(true)}
              className="w-full h-9 px-3 rounded-xl bg-surface-container-high/80 text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-between cursor-pointer border border-primary/20 shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">
                  radar
                </span>
                <span className="font-label-data-sm text-[12px] font-bold text-on-surface">
                  水底测绘与声呐探底 · 鱼群藏身处分析
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-primary font-semibold">
                <span>测录标定</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </div>
            </button>
          </div>

          {/* Monthly Empirical Science Dashboard */}
          <div className="pt-space-xs">
            <div className="flex items-center justify-between pb-1.5">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">query_stats</span>
                本月作钓经验沉淀 · 决策效能
              </span>
              <span className="font-label-caps text-label-caps text-secondary font-mono">
                OCTOBER METRICS
              </span>
            </div>
            <div className="grid grid-cols-4 gap-gutter text-center">
              <div className="p-2 bg-surface-container rounded-lg">
                <div className="font-label-caps text-label-caps text-on-surface-variant">出钓频次</div>
                <div className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                  09<span className="text-[12px] font-normal font-sans ml-0.5">次</span>
                </div>
              </div>
              <div className="p-2 bg-surface-container rounded-lg">
                <div className="font-label-caps text-label-caps text-on-surface-variant">累计渔获</div>
                <div className="font-label-data-lg text-label-data-lg text-primary font-bold">
                  42.8<span className="text-[12px] font-normal font-sans ml-0.5">kg</span>
                </div>
              </div>
              <div className="p-2 bg-surface-container rounded-lg">
                <div className="font-label-caps text-label-caps text-on-surface-variant">中大鱼率</div>
                <div className="font-label-data-lg text-label-data-lg text-tertiary font-bold">
                  38<span className="text-[12px] font-normal font-sans ml-0.5">%</span>
                </div>
              </div>
              <div className="p-2 bg-surface-container rounded-lg">
                <div className="font-label-caps text-label-caps text-on-surface-variant">历史空军率</div>
                <div className="font-label-data-lg text-label-data-lg text-primary-container font-bold">
                  04<span className="text-[12px] font-normal font-sans ml-0.5">%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="font-label-caps text-[11px] text-on-surface-variant">
                “把每一次抛竿，变成下一次的准确判断”
              </p>
            </div>
          </div>
        </div>
      </section>
 
      {/* 24-Hour Barometric Pressure Fluctuation & Warning Card */}
      <section className="px-margin py-space-xs">
        <PressureTrendCard />
      </section>

      {/* Today's AI Bait Ratio Recommendation Card */}
      <section className="px-margin py-space-xs">
        <BaitRecommendationCard />
      </section>

      {/* Live Scenario & Mission in Progress (Hero Card) */}
      <section className="px-margin py-space-xs">
        <div className="relative rounded-xl overflow-hidden shadow-md bg-inverse-surface text-inverse-on-surface">
          {/* Scenic Background Image */}
          <div
            className="h-56 w-full bg-cover bg-center relative"
            style={{
              backgroundImage:
                "url('/src/assets/images/scenic_water_surface_1793009818752.jpg')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-inverse-surface/80 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
              <span className="font-label-caps text-label-caps text-tertiary-fixed font-semibold">
                标点巡检中 · 3号老钓位
              </span>
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-inverse-surface/80 backdrop-blur-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary-fixed">water</span>
              <span className="font-label-caps text-label-caps text-primary-fixed">深水底层 (3.4m)</span>
            </div>
          </div>

          {/* Float State & Active Window Countdown Container */}
          <div className="p-space-lg flex flex-col gap-space-md -mt-10 relative z-10 bg-inverse-surface/95 backdrop-blur-md rounded-t-xl mx-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase">
                  野钓黄金窗口倒计时
                </span>
                <span className="font-label-data-lg text-label-data-lg text-primary-fixed font-bold tracking-tight">
                  {formatCountdown(windowCountdownSeconds)}
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-caps text-label-caps text-inverse-on-surface/70">
                  浮漂动态建议
                </span>
                <div className="font-headline-sm text-headline-sm text-surface-bright flex items-center gap-1 justify-end">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">
                    vertical_align_bottom
                  </span>
                  抓半目钝口 / 顿口
                </div>
              </div>
            </div>

            {/* Micro Tactical Action Dock */}
            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <button
                onClick={resetChumTimer}
                className="h-11 px-space-md rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-2 hover:bg-surface-variant active:scale-95 transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
                <div className="flex flex-col">
                  <span className="font-label-data-sm text-[12px] font-bold leading-tight">
                    一键打窝计时
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {chumMinutesElapsed === 0 ? '刚刚已精准补窝' : `已补窝 ${chumMinutesElapsed}min 前`}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsQuickLogOpen(true)}
                className="h-11 px-space-md rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px] animate-bounce">phishing</span>
                <span className="font-label-data-md text-label-data-md font-bold tracking-wide">
                  记录当前抛竿
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Task Checklist & Recent Trophy Spotlight */}
      <section className="px-margin py-space-sm flex flex-col gap-space-md">
        {/* Header with dynamic task counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">今日出钓优先级待办</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="text-[11px] font-label-caps text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              新增待办
            </button>
            <span
              className={`font-label-caps text-label-caps px-2 py-0.5 rounded font-bold transition-all ${
                completedTasksCount === tasks.length && tasks.length > 0
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-surface-container-high text-primary'
              }`}
            >
              已落实 {completedTasksCount}/{tasks.length} 项
            </span>
          </div>
        </div>

        {/* Task inline form */}
        {isAddingTask && (
          <form
            onSubmit={handleCreateTask}
            className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-2 border border-primary/20 animate-in fade-in"
          >
            <input
              type="text"
              placeholder="待办任务描述 (如：测试0.6号斑马线拉力)"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="h-9 px-2 text-sm bg-surface-container-low rounded focus:outline-none text-on-surface"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="标签 (如：线组调整)"
                value={newTaskTag}
                onChange={e => setNewTaskTag(e.target.value)}
                className="h-8 px-2 text-xs bg-surface-container-low rounded flex-1 focus:outline-none text-on-surface"
              />
              <button
                type="submit"
                className="px-3 h-8 bg-primary text-on-primary rounded text-xs font-semibold cursor-pointer"
              >
                添加
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-2 h-8 bg-surface-container text-on-surface-variant rounded text-xs cursor-pointer"
              >
                取消
              </button>
            </div>
          </form>
        )}

        {/* Interactive Task Items */}
        <div className="flex flex-col gap-space-sm">
          {tasks.map(task => (
            <label
              key={task.id}
              className="task-card flex items-start gap-space-md p-space-md bg-surface-container-lowest rounded-lg cursor-pointer transition-all shadow-sm hover:bg-surface-container-low"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="task-checkbox mt-1 w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`task-title font-body-md text-body-md font-semibold transition-colors ${
                      task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`font-label-caps text-[10px] px-1.5 py-0.5 rounded ${
                      task.tagColor || 'bg-surface-container text-secondary'
                    }`}
                  >
                    {task.tag}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{task.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Trophy Featured Card (Clickable to reveal modal) */}
        <div
          onClick={() => {
            const topTrophy = catches.find(c => c.weight >= 5.0) || catches[0];
            if (topTrophy) setInspectedCatch(topTrophy);
          }}
          className="bg-surface-container-low rounded-xl p-space-md flex gap-space-md items-center cursor-pointer hover:bg-surface-container transition-all"
        >
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
            <img
              className="w-full h-full object-cover"
              alt="野生大鲤"
              src="/src/assets/images/catch_trophy_carp_1793009820315.jpg"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-tertiary-container text-[16px]">
                military_tech
              </span>
              <span className="font-label-caps text-label-caps text-tertiary-container font-bold">
                巨物战报归档
              </span>
              <span className="font-label-caps text-[10px] text-on-surface-variant font-mono ml-auto">
                YESTERDAY 16:40
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
              野生大鲤 6.40kg / 68cm
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              发酵嫩甜玉米 · 5.4米轻量综合竿 · 3.4m深槽台阶处
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-surface-container-lowest text-primary font-mono font-medium">
                PE #1.2 / 碳线 2.5#
              </span>
              <span className="font-label-caps text-[10px] text-primary flex items-center gap-0.5 ml-auto">
                查看复盘参数 <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bathymetric & Field Log Timeline */}
      <section className="px-margin py-space-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">近期水情与渔获动态</h2>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">
            共记录 {catches.length} 组实测标定数据
          </span>
        </div>

        <div className="flex flex-col gap-gutter">
          {catches.slice(0, 3).map(item => (
            <div
              key={item.id}
              onClick={() => setInspectedCatch(item)}
              className="p-space-md bg-surface-container-lowest rounded-xl flex flex-col gap-space-xs shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.weight >= 5.0 ? 'bg-tertiary-container' : 'bg-primary-container'
                    }`}
                  ></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">{item.species}</span>
                  <span className="font-label-data-sm text-label-data-sm font-bold text-tertiary px-1.5 py-0.5 rounded bg-tertiary-fixed">
                    {item.weight.toFixed(1)} kg
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">
                  {item.time.includes(' ') ? item.time.split(' ')[1] : item.time}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-1 font-body-sm text-body-sm">
                <div className="flex items-center gap-1 truncate">
                  <span className="material-symbols-outlined text-[15px] text-primary">set_meal</span>
                  <span>{item.bait}</span>
                </div>
                <span className="font-mono text-[11px] text-secondary shrink-0">
                  水深 {item.depth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bathymetric Lake Map Preview Block */}
      <section className="px-margin py-space-sm mb-4">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">map</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                桦树林水下等深结构剖面图
              </span>
            </div>
            <button
              onClick={() => setIsSpotMapModalOpen(true)}
              className="font-label-caps text-label-caps text-primary cursor-pointer hover:underline flex items-center gap-0.5"
            >
              全图解算 <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>
          <div
            onClick={() => setIsSpotMapModalOpen(true)}
            className="w-full h-36 rounded-lg overflow-hidden relative cursor-pointer group"
            style={{
              backgroundImage:
                "url('/src/assets/images/bathymetric_depth_map_1793009822977.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-surface-tint/10 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-inverse-surface/85 text-inverse-on-surface text-[10px] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
              现标点：{activeSpot.title}
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 font-label-caps text-[10px] text-primary font-bold">
              等深落差: 0.5m ~ 18.2m
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Quick Strike Prompt Modal */}
      {isQuickLogOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-margin animate-in fade-in"
          onClick={() => setIsQuickLogOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-space-lg shadow-xl flex flex-col gap-space-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-tertiary-container">add_circle</span>
                <span className="font-headline-md text-headline-md">快速记一次有效抛竿</span>
              </div>
              <button
                onClick={() => setIsQuickLogOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              系统已自动关联当前环境：1014hPa · 18.4℃ · 水深 3.4m
            </p>
            <div className="flex flex-col gap-space-sm">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  目标中鱼类型
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {['野生鲤鱼', '大鲫鱼', '鲌鱼翘嘴'].map(fish => (
                    <button
                      key={fish}
                      type="button"
                      onClick={() => setSelectedFish(fish)}
                      className={`py-2 text-center rounded font-body-sm transition-all cursor-pointer ${
                        selectedFish === fish
                          ? 'bg-primary text-on-primary font-semibold'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {fish}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  咬钩信号特征
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {['清脆下顿 (正口)', '平稳送漂 (底层)'].map(sig => (
                    <button
                      key={sig}
                      type="button"
                      onClick={() => setSelectedSignal(sig)}
                      className={`py-1.5 px-2 rounded text-center font-label-data-sm text-[12px] transition-all cursor-pointer ${
                        selectedSignal === sig
                          ? 'bg-surface-container-high text-primary font-bold border border-primary/20'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {sig}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleQuickStrikeSubmit}
              className="w-full h-11 rounded-xl bg-tertiary-container text-on-tertiary font-headline-sm text-headline-sm flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all mt-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              确认入库并更新命中率
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
