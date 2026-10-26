import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export const PlanScreen: React.FC = () => {
  const {
    catches,
    tasks,
    toggleTask,
    addTask,
    activeSpot,
    selectedDate,
    setSelectedDate,
    openLightbox,
    setActiveTab,
    setInspectedCatch,
    showToast
  } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [currentMonth, setCurrentMonth] = useState('2024-04');
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanTag, setNewPlanTag] = useState('');
  const [newPlanDate, setNewPlanDate] = useState('2024-04-20');

  // Days in month calculation (April 2024 has 30 days)
  const daysInApril = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2024-04-${String(dayNum).padStart(2, '0')}`;
    const dayCatches = catches.filter(c => c.date === dateStr);
    const hasTrophy = dayCatches.some(c => c.weight >= 5.0);
    const isToday = dateStr === '2024-04-18';
    return {
      dayNum,
      dateStr,
      catches: dayCatches,
      hasTrophy,
      isToday,
      pressure: 1010 + ((dayNum * 3) % 9)
    };
  });

  // Catches on selected date
  const selectedDateCatches = useMemo(() => {
    return catches.filter(c => c.date === selectedDate);
  }, [catches, selectedDate]);

  // Chronological timeline sorted by date desc
  const sortedCatches = useMemo(() => {
    return [...catches].sort((a, b) => b.date.localeCompare(a.date));
  }, [catches]);

  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    addTask({
      title: newPlanTitle.trim(),
      tag: newPlanTag.trim() || '出钓计划',
      desc: `计划出钓日期: ${newPlanDate} · 标点: ${activeSpot.title}`,
      dueDate: newPlanDate
    });
    setNewPlanTitle('');
    setNewPlanTag('');
    setIsAddPlanModalOpen(false);
    showToast(`已排程 ${newPlanDate} 出钓计划！`, 'event');
  };

  return (
    <div className="flex flex-col w-full pb-safe px-margin pt-space-md gap-space-md select-none">
      {/* 顶部计划与排程总览卡 */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">出钓计划与实战时序</h2>
          </div>
          <div className="inline-flex p-0.5 bg-surface-container rounded-lg border border-outline-variant/30">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 rounded font-label-caps text-[11px] transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              月历视图
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded font-label-caps text-[11px] transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              时序流
            </button>
          </div>
        </div>

        {/* 标定窗口期气压提示 */}
        <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg text-xs font-mono text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            当前排程水区: <strong className="text-on-surface">{activeSpot.title}</strong>
          </span>
          <span className="text-primary font-semibold">4月深秋回暖周期</span>
        </div>
      </section>

      {viewMode === 'calendar' ? (
        /* 月历视图 (Interactive Calendar Grid) */
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">2024年 4月</span>
              <span className="font-label-caps text-[11px] text-on-surface-variant">
                已沉淀 {catches.length} 场标定
              </span>
            </div>
            <button
              onClick={() => setIsAddPlanModalOpen(true)}
              className="h-8 px-2.5 rounded-xl bg-tertiary-container text-on-tertiary font-label-caps text-label-caps uppercase font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              排程新出钓
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 text-center font-label-caps text-[11px] text-on-surface-variant pb-1 border-b border-surface-container">
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span className="text-primary font-semibold">六</span>
            <span className="text-primary font-semibold">日</span>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for Monday start in Apr 2024 (Apr 1 was Monday, so 0 offset) */}
            {daysInApril.map(day => {
              const isSelected = selectedDate === day.dateStr;
              const hasLogs = day.catches.length > 0;
              return (
                <button
                  key={day.dayNum}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-on-primary font-bold shadow-md ring-2 ring-primary-container'
                      : day.isToday
                      ? 'bg-surface-container-high text-primary font-bold border border-primary/30'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <span className="font-label-data-sm text-[12px]">{day.dayNum}</span>
                  {/* Status indicator dot */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {hasLogs && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          day.hasTrophy
                            ? isSelected
                              ? 'bg-tertiary-fixed'
                              : 'bg-tertiary-container animate-pulse'
                            : isSelected
                            ? 'bg-white'
                            : 'bg-primary'
                        }`}
                      ></span>
                    )}
                  </div>
                  {day.hasTrophy && (
                    <span className="absolute top-0.5 right-0.5 text-[8px] text-tertiary font-bold">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Summary Well */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">event_available</span>
                选中日期记录: <strong className="text-primary font-mono">{selectedDate}</strong>
              </span>
              <span className="font-label-data-sm text-[11px] text-secondary">
                {selectedDateCatches.length > 0 ? `共 ${selectedDateCatches.length} 组渔获` : '未作钓 / 计划预留'}
              </span>
            </div>

            {selectedDateCatches.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedDateCatches.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setInspectedCatch(c)}
                    className="p-space-sm bg-surface-container-lowest rounded-lg flex items-center justify-between shadow-xs hover:bg-surface-container transition-all cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-body-md font-semibold text-on-surface truncate">
                        {c.title}
                      </span>
                      <span className="font-label-data-sm text-[10px] text-on-surface-variant truncate">
                        {c.spotName} · 水深 {c.depth} · {c.bait}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-label-data-md font-bold text-tertiary">
                        {c.weight.toFixed(1)}kg
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 flex flex-col items-center justify-center text-center text-on-surface-variant">
                <p className="font-body-sm text-xs">当日尚无出钓记录归档。气压适宜时可在该日期建立作战排程。</p>
                <button
                  onClick={() => setIsAddPlanModalOpen(true)}
                  className="mt-2 text-xs font-label-caps text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  为 {selectedDate} 设定出钓任务
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* 时序流视图 (Chronological Timeline Flow) */
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface">实战出钓历史时间轴</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">
              TIME SERIES ARCHIVE
            </span>
          </div>

          <div className="relative pl-6 flex flex-col gap-space-lg before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
            {sortedCatches.map(item => (
              <div key={item.id} className="relative flex flex-col gap-1 group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary-container border-2 border-surface-container-lowest flex items-center justify-center shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-primary"></span>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant font-mono text-[11px]">
                  <span className="font-semibold text-primary">{item.date}</span>
                  <span>{item.time.includes(' ') ? item.time.split(' ')[1] : item.time}</span>
                </div>

                <div
                  onClick={() => setInspectedCatch(item)}
                  className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-1.5 hover:bg-surface-container transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-headline-sm text-[15px] font-semibold text-on-surface truncate">
                      {item.title}
                    </h4>
                    <span className="font-label-data-md font-bold text-tertiary shrink-0">
                      {item.weight.toFixed(2)}kg
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-on-surface-variant font-body-sm text-[11px]">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px] text-primary">place</span>
                      {item.spotName}
                    </span>
                    <span>·</span>
                    <span>{item.method}</span>
                    <span>·</span>
                    <span>水深 {item.depth}</span>
                  </div>

                  {item.photoUrl && (
                    <div className="mt-1 h-28 w-full rounded-lg overflow-hidden relative">
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-caps text-[9px]">
                        实况留影
                      </div>
                    </div>
                  )}

                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                    {item.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 排程新出钓任务弹窗 */}
      {isAddPlanModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in"
          onClick={() => setIsAddPlanModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-t-2xl p-space-lg shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">event_note</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  排定出钓作战计划
                </h3>
              </div>
              <button
                onClick={() => setIsAddPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPlanSubmit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  目标出钓日期
                </label>
                <input
                  type="date"
                  required
                  value={newPlanDate}
                  onChange={e => setNewPlanDate(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-label-data-sm text-label-data-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  任务与验证重点
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：测试老水闸深潭清晨大翘嘴微物亮片搜寻"
                  value={newPlanTitle}
                  onChange={e => setNewPlanTitle(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  战术标签
                </label>
                <input
                  type="text"
                  placeholder="如：窗口期突击 / 线组验证"
                  value={newPlanTag}
                  onChange={e => setNewPlanTag(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  确认加入计划
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
