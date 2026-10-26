import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CatchRecord } from '../types';

export const LogsScreen: React.FC = () => {
  const {
    catches,
    spots,
    addCatch,
    updateCatch,
    deleteCatch,
    totalLogsCount,
    totalFishCount,
    recordWeight,
    openLightbox,
    showToast
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [editingCatchId, setEditingCatchId] = useState<string | null>(null);

  // Wizard form fields
  const [formLocation, setFormLocation] = useState('界首水库·西北湾回水区');
  const [formTemp, setFormTemp] = useState('18.5');
  const [formPressure, setFormPressure] = useState('1014');
  const [formDepth, setFormDepth] = useState('3.5');

  const [formTitle, setFormTitle] = useState('');
  const [formSpecies, setFormSpecies] = useState('鲤鱼');
  const [formMethod, setFormMethod] = useState('台钓');
  const [formWeight, setFormWeight] = useState('2.5');
  const [formCount, setFormCount] = useState('1');
  const [formRig, setFormRig] = useState('5.4米轻量竿 / 2.0#主线 1.2#子线 / 5号伊势尼');

  const [formBait, setFormBait] = useState('发酵嫩玉米颗粒 + 螺鲤基础窝料');
  const [formReleased, setFormReleased] = useState(true);

  // Delete modal state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Depth +/-
  const adjustDepth = (delta: number) => {
    let val = parseFloat(formDepth) || 3.0;
    val = Math.max(0.5, Math.min(15.0, val + delta));
    setFormDepth(val.toFixed(1));
  };

  // Open modal for new
  const handleOpenNewModal = () => {
    setEditingCatchId(null);
    setFormTitle('');
    setFormLocation('界首水库·回水湾老钓位');
    setFormSpecies('鲤鱼');
    setFormMethod('台钓');
    setFormWeight('2.5');
    setFormCount('1');
    setFormDepth('3.5');
    setFormTemp('18.4');
    setFormPressure('1014');
    setFormRig('6.3米大物综合竿 / 3.0#主线 2.0#子线 / 8号新关东');
    setFormBait('老坛谷麦 + 嫩甜玉米');
    setFormReleased(true);
    setCurrentStep(1);
    setIsWizardOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (c: CatchRecord) => {
    setEditingCatchId(c.id);
    setFormTitle(c.title);
    setFormLocation(c.spotName || c.location || '');
    setFormSpecies(c.species);
    setFormMethod(c.method);
    setFormWeight(String(c.weight));
    setFormCount(String(c.count || 1));
    setFormDepth(c.depth ? c.depth.replace(/[^0-9.]/g, '') || '3.5' : '3.5');
    setFormTemp(String(c.temp || 18.0));
    setFormPressure(String(c.pressure || 1013));
    setFormRig(c.rig || '');
    setFormBait(c.bait || '');
    setFormReleased(c.isReleased ?? true);
    setCurrentStep(2); // go directly to species & rig
    setIsWizardOpen(true);
  };

  // Submit wizard
  const handleSubmitWizard = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(formWeight) || 1.0;
    const countNum = parseInt(formCount, 10) || 1;
    const tempNum = parseFloat(formTemp) || 18.0;
    const pressureNum = parseInt(formPressure, 10) || 1013;
    const matchedSpot = spots.find(s => s.title === formLocation);

    if (editingCatchId) {
      updateCatch(editingCatchId, {
        title: formTitle || '实战归档记录',
        species: formSpecies,
        method: formMethod,
        weight: weightNum,
        count: countNum,
        spotId: matchedSpot?.id || 1,
        spotName: formLocation,
        location: formLocation,
        depth: `${formDepth} M`,
        temp: tempNum,
        pressure: pressureNum,
        rig: formRig,
        bait: formBait,
        isReleased: formReleased
      });
    } else {
      addCatch({
        title: formTitle || `${formSpecies} ${weightNum}kg 实战入护`,
        date: new Date().toISOString().split('T')[0],
        time: '刚刚录入',
        spotId: matchedSpot?.id || 1,
        spotName: formLocation,
        location: formLocation,
        species: formSpecies,
        method: formMethod,
        weight: weightNum,
        length: Math.round(weightNum * 12 + 10),
        count: countNum,
        depth: `${formDepth} M`,
        rig: formRig,
        bait: formBait,
        temp: tempNum,
        pressure: pressureNum,
        isReleased: formReleased,
        tags: [formMethod, formSpecies, `${countNum} 尾入网`]
      });
    }

    setIsWizardOpen(false);
  };

  // Filtered catches
  const filteredCatches = useMemo(() => {
    return catches.filter(c => {
      const matchSpecies = speciesFilter === 'all' || c.species === speciesFilter;
      const matchMethod = methodFilter === 'all' || c.method === methodFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.spotName && c.spotName.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        c.species.toLowerCase().includes(q) ||
        (c.rig && c.rig.toLowerCase().includes(q)) ||
        (c.bait && c.bait.toLowerCase().includes(q));
      return matchSpecies && matchMethod && matchQuery;
    });
  }, [catches, speciesFilter, methodFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setSpeciesFilter('all');
    setMethodFilter('all');
    showToast('筛选条件已重置', 'restart_alt');
  };

  return (
    <div className="flex flex-col w-full pb-safe">
      {/* 统计概览仪表板 (Summary Telemetry) */}
      <section className="px-margin pt-space-md pb-space-sm">
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Logbook Telemetry / 季度概览
              </span>
            </div>
            <span className="font-label-data-sm text-label-data-sm text-primary font-semibold">
              Q2 · 实战归档
            </span>
          </div>
          <div className="grid grid-cols-3 gap-gutter pt-space-xs">
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex flex-col justify-between">
              <span className="font-label-caps text-label-caps text-outline uppercase">总计记录</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg text-headline-lg text-primary leading-none">
                  {totalLogsCount}
                </span>
                <span className="font-label-caps text-[11px] text-on-surface-variant">次</span>
              </div>
              <span className="font-label-data-sm text-[10px] text-secondary mt-1 truncate">
                稳定归档中
              </span>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex flex-col justify-between">
              <span className="font-label-caps text-label-caps text-outline uppercase">本季中鱼</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg text-headline-lg text-primary-container leading-none">
                  {totalFishCount}
                </span>
                <span className="font-label-caps text-[11px] text-on-surface-variant">尾</span>
              </div>
              <span className="font-label-data-sm text-[10px] text-tertiary font-medium mt-1 truncate">
                +12 较上月
              </span>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex flex-col justify-between">
              <span className="font-label-caps text-label-caps text-outline uppercase">巨物纪录</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg text-headline-lg text-tertiary leading-none">
                  {recordWeight.toFixed(1)}
                </span>
                <span className="font-label-caps text-[11px] text-on-surface-variant">kg</span>
              </div>
              <span className="font-label-data-sm text-[10px] text-on-surface truncate">金鳞野鲤</span>
            </div>
          </div>
        </div>
      </section>

      {/* 搜索与多维过滤条 (Filters & Search) */}
      <section className="px-margin py-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索钓点、鱼种、线组号数..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={handleOpenNewModal}
            className="h-10 px-3.5 rounded-xl bg-tertiary text-on-tertiary flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="font-label-data-sm text-label-data-sm font-semibold tracking-wide">
              记一笔
            </span>
          </button>
        </div>

        {/* 过滤器滑动胶囊 (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto py-space-sm no-scrollbar">
          {[
            { id: 'all', label: '全部鱼种' },
            { id: '鲤鱼', label: '野生鲤鱼' },
            { id: '鳜鱼', label: '拟饵鳜鱼' },
            { id: '鲫鱼', label: '大板鲫' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSpeciesFilter(chip.id)}
              className={`px-3 py-1 rounded-full font-label-data-sm text-label-data-sm whitespace-nowrap transition-all cursor-pointer ${
                speciesFilter === chip.id
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {chip.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-outline-variant shrink-0 mx-1"></div>

          {[
            { id: '台钓', label: '台钓底钓' },
            { id: '路亚', label: '路亚搜底' },
            { id: '传统钓', label: '谷麦短线' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setMethodFilter(methodFilter === chip.id ? 'all' : chip.id)}
              className={`px-2.5 py-1 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-all cursor-pointer ${
                methodFilter === chip.id
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container text-secondary hover:bg-surface-container-high'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* 渔获实战日志流 (Catch Log Feed) */}
      {filteredCatches.length > 0 ? (
        <section className="px-margin py-space-xs flex flex-col gap-space-lg">
          {filteredCatches.map(catchItem => (
            <article
              key={catchItem.id}
              className="log-card bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md"
            >
              {/* Header metadata */}
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {catchItem.tags &&
                      catchItem.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded font-label-caps text-[10px] ${
                            idx === 0
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold'
                              : 'bg-surface-container text-primary'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    {catchItem.isReleased && (
                      <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                        放生归水
                      </span>
                    )}
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1.5 truncate">
                    {catchItem.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant font-label-data-sm text-[11px]">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {catchItem.spotName || catchItem.location}
                    </span>
                    <span>·</span>
                    <span>{catchItem.time}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-baseline gap-0.5 text-tertiary">
                    <span className="font-label-data-lg text-label-data-lg leading-none font-bold">
                      {catchItem.weight.toFixed(2)}
                    </span>
                    <span className="font-label-caps text-label-caps">KG</span>
                  </div>
                  {catchItem.length ? (
                    <span className="font-label-caps text-[10px] text-outline mt-0.5">
                      净长 {catchItem.length} CM
                    </span>
                  ) : (
                    <span className="font-label-caps text-[10px] text-outline mt-0.5">实测记录</span>
                  )}
                </div>
              </div>

              {/* 实拍相片展区 (带点击放大交互) */}
              {catchItem.photoUrl && (
                <div
                  onClick={() => openLightbox(catchItem.photoUrl!, catchItem.photoTitle || catchItem.title)}
                  className="relative w-full h-52 rounded-xl overflow-hidden cursor-pointer group select-none"
                >
                  <img
                    alt={catchItem.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={catchItem.photoUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-space-md justify-between">
                    <div className="flex items-center gap-1.5 text-inverse-on-surface font-label-data-sm text-label-data-sm">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
                        straighten
                      </span>
                      <span>
                        {catchItem.length
                          ? `标尺实测: ${catchItem.length}cm · 鱼体无伤`
                          : '实景标定定妆照'}
                      </span>
                    </div>
                    <span className="h-6 px-2 rounded-full bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-label-caps text-[10px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">fullscreen</span>
                      查看原图
                    </span>
                  </div>
                </div>
              )}

              {/* 钓组参数与水情气象沉浸栏 */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">hardware</span>
                    钓组与线组实配
                  </span>
                  <span className="font-label-data-sm text-[11px] text-outline">
                    水深 {catchItem.depth || '3.5M'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {catchItem.rig ? (
                    catchItem.rig.split('/').map((part, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-data-sm text-[11px]"
                      >
                        {part.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-data-sm text-[11px]">
                      标准线组配置
                    </span>
                  )}
                </div>
                <div className="h-[1px] bg-surface-container-high my-0.5"></div>
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[9px] text-outline">水温 / 气压</span>
                      <span className="font-label-data-sm text-[12px] text-on-surface font-semibold">
                        {catchItem.temp || 18.0}℃ · {catchItem.pressure || 1014} hPa
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-tertiary">
                      <span className="material-symbols-outlined text-[16px]">grain</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[9px] text-outline">用饵策略</span>
                      <span className="font-label-data-sm text-[12px] text-on-surface font-semibold truncate">
                        {catchItem.bait || '谷麦混合饵'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作工具条 */}
              <div className="flex items-center justify-between pt-space-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(catchItem)}
                    className="btn-edit text-on-surface-variant hover:text-primary flex items-center gap-1 font-label-data-sm text-[12px] py-1 px-2 rounded-lg bg-surface-container/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    编辑
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(catchItem.id)}
                    className="btn-delete text-error hover:opacity-80 flex items-center gap-1 font-label-data-sm text-[12px] py-1 px-2 rounded-lg bg-error-container/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete_outline</span>
                    归档删除
                  </button>
                </div>
                <div className="flex items-center gap-1 text-outline font-label-caps text-[10px]">
                  <span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                  <span>高保真钓况核准</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        /* Empty State */
        <div className="px-margin py-space-xl flex flex-col items-center justify-center text-center animate-in fade-in">
          <div className="w-56 h-44 rounded-2xl overflow-hidden mb-space-md shadow-inner bg-surface-container-low flex items-center justify-center">
            <img
              alt="空渔获记录插画"
              className="w-full h-full object-cover"
              src="/src/assets/images/empty_state_lakeside_1793009822447.jpg"
            />
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface">
            未检索到匹配的渔获条目
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[260px] mt-1">
            静水微澜，折叠钓椅与竿袋正待下场。可尝试调整鱼种分类、钓法或立即记录一笔新渔获。
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-surface-container-high text-primary font-label-data-sm text-label-data-sm cursor-pointer hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            重置所有筛选
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <aside className="sticky bottom-20 self-end mr-margin mb-2 z-40">
        <button
          onClick={handleOpenNewModal}
          className="h-14 px-5 rounded-full bg-tertiary text-on-tertiary shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
          <span className="font-label-data-md text-label-data-md font-bold tracking-wide">
            记录新出钓
          </span>
        </button>
      </aside>

      {/* 3-Step Wizard Modal */}
      {isWizardOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in"
          onClick={() => setIsWizardOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-t-2xl p-space-lg flex flex-col max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  {editingCatchId ? '编辑渔获记录参数' : '记录新出钓日志'}
                </span>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-2 py-space-md">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex flex-col gap-1 border-t-2 pt-1 text-left cursor-pointer transition-colors ${
                  currentStep === 1
                    ? 'border-primary'
                    : currentStep > 1
                    ? 'border-primary-container'
                    : 'border-surface-container-highest'
                }`}
              >
                <span
                  className={`font-label-caps text-[10px] font-bold ${
                    currentStep >= 1 ? 'text-primary' : 'text-outline'
                  }`}
                >
                  STEP 01
                </span>
                <span
                  className={`font-label-data-sm text-[11px] font-medium ${
                    currentStep === 1 ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  水情与标点
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex flex-col gap-1 border-t-2 pt-1 text-left cursor-pointer transition-colors ${
                  currentStep === 2
                    ? 'border-primary'
                    : currentStep > 2
                    ? 'border-primary-container'
                    : 'border-surface-container-highest'
                }`}
              >
                <span
                  className={`font-label-caps text-[10px] font-bold ${
                    currentStep >= 2 ? 'text-primary' : 'text-outline'
                  }`}
                >
                  STEP 02
                </span>
                <span
                  className={`font-label-data-sm text-[11px] font-medium ${
                    currentStep === 2 ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  鱼种与钓组
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex flex-col gap-1 border-t-2 pt-1 text-left cursor-pointer transition-colors ${
                  currentStep === 3 ? 'border-primary' : 'border-surface-container-highest'
                }`}
              >
                <span
                  className={`font-label-caps text-[10px] font-bold ${
                    currentStep === 3 ? 'text-primary' : 'text-outline'
                  }`}
                >
                  STEP 03
                </span>
                <span
                  className={`font-label-data-sm text-[11px] font-medium ${
                    currentStep === 3 ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  饵料与定妆
                </span>
              </button>
            </div>

            {/* Stepper Form Content */}
            <form onSubmit={handleSubmitWizard} className="flex flex-col gap-space-md pt-space-xs">
              {/* Step 1: 水情与标点 */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center justify-between">
                      <span>选择关联钓点 (水域标定)</span>
                      <span className="text-primary text-[10px]">自动关联水文底质</span>
                    </label>
                    <select
                      value={formLocation}
                      onChange={e => {
                        const val = e.target.value;
                        setFormLocation(val);
                        const matchSpot = spots.find(s => s.title === val);
                        if (matchSpot) {
                          setFormDepth(String(matchSpot.depthNum || 3.5));
                          setFormTemp(String(matchSpot.defaultTemp || 18.4));
                          setFormPressure(String(matchSpot.defaultPressure || 1014));
                        }
                      }}
                      className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-body-sm focus:outline-none"
                    >
                      {spots.map(s => (
                        <option key={s.id} value={s.title}>
                          {s.letter ? `[${s.letter}] ` : ''}{s.title} ({s.depthDisplay})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-on-surface-variant">
                        水温 (℃)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formTemp}
                        onChange={e => setFormTemp(e.target.value)}
                        className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-label-data-md text-label-data-md focus:outline-none focus:bg-surface-container-low"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-on-surface-variant">
                        气压 (hPa)
                      </label>
                      <input
                        type="number"
                        value={formPressure}
                        onChange={e => setFormPressure(e.target.value)}
                        className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-label-data-md text-label-data-md focus:outline-none focus:bg-surface-container-low"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      作钓水深 (米)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustDepth(-0.5)}
                        className="w-10 h-10 rounded-lg bg-surface-container text-on-surface flex items-center justify-center font-bold text-lg active:scale-95 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={`${formDepth} M`}
                        className="flex-1 h-10 text-center font-label-data-md text-label-data-md bg-surface-container-low rounded-lg text-primary"
                      />
                      <button
                        type="button"
                        onClick={() => adjustDepth(0.5)}
                        className="w-10 h-10 rounded-lg bg-surface-container text-on-surface flex items-center justify-center font-bold text-lg active:scale-95 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: 鱼种与钓组 */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      目标鱼种与条目名称
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="如：深潭巡游纯野生草鱼"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-low"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-on-surface-variant">
                        鱼种分类
                      </label>
                      <select
                        value={formSpecies}
                        onChange={e => setFormSpecies(e.target.value)}
                        className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-body-sm focus:outline-none"
                      >
                        <option value="鲤鱼">野生鲤鱼</option>
                        <option value="鳜鱼">拟饵鳜鱼</option>
                        <option value="鲫鱼">野生大板鲫</option>
                        <option value="草鱼">草鱼/青鱼</option>
                        <option value="翘嘴">翘嘴红鲌</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-on-surface-variant">
                        作钓技法
                      </label>
                      <select
                        value={formMethod}
                        onChange={e => setFormMethod(e.target.value)}
                        className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-body-sm focus:outline-none"
                      >
                        <option value="台钓">台钓底钓</option>
                        <option value="路亚">路亚搜底</option>
                        <option value="传统钓">传统谷麦</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-on-surface-variant">
                        单尾重量 / 总重 (KG)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={formWeight}
                        onChange={e => setFormWeight(e.target.value)}
                        className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-label-data-md text-label-data-md focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-on-surface-variant">
                        入网总尾数
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={formCount}
                        onChange={e => setFormCount(e.target.value)}
                        className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-label-data-md text-label-data-md focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      钓组规格 (竿/线/钩)
                    </label>
                    <input
                      type="text"
                      placeholder="如：5.4米轻量竿 / 2.0#主线 1.2#子线 / 5号伊势尼"
                      value={formRig}
                      onChange={e => setFormRig(e.target.value)}
                      className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: 饵料与定妆照片 */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      挂饵策略 / 拟饵型号
                    </label>
                    <input
                      type="text"
                      placeholder="如：发酵嫩玉米颗粒 + 螺鲤基础窝料"
                      value={formBait}
                      onChange={e => setFormBait(e.target.value)}
                      className="h-11 px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      出钓留影图鉴
                    </label>
                    <div
                      onClick={() => showToast('已对接智能测长标尺相机', 'camera_alt')}
                      className="p-4 rounded-xl bg-surface-container-low flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container transition-colors border border-dashed border-outline-variant"
                    >
                      <span className="material-symbols-outlined text-[36px] text-primary">
                        add_a_photo
                      </span>
                      <span className="font-label-data-sm text-label-data-sm text-on-surface-variant">
                        已链接智能相机标尺识别
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-outline font-label-caps text-[10px]">
                        保留原图 GPS 与 EXIF 水情信息
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container">
                    <input
                      type="checkbox"
                      id="check-release"
                      checked={formReleased}
                      onChange={e => setFormReleased(e.target.checked)}
                      className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                    />
                    <label
                      htmlFor="check-release"
                      className="font-label-data-sm text-label-data-sm text-on-surface cursor-pointer"
                    >
                      遵循渔乐生态 · 称重拍照后已放生归水
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-space-sm border-t border-surface-container/60">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((currentStep - 1) as any)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-data-sm text-label-data-sm cursor-pointer"
                  >
                    上一步
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((currentStep + 1) as any)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-data-sm text-label-data-sm font-semibold active:scale-95 shadow-sm cursor-pointer"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-tertiary text-on-tertiary font-label-data-sm text-label-data-sm font-semibold active:scale-95 shadow-sm cursor-pointer"
                  >
                    确认归档保存
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteId && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center px-6 animate-in fade-in"
          onClick={() => setPendingDeleteId(null)}
        >
          <div
            className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">delete_forever</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                确认抹除该条渔获归档？
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                删除后本季度中鱼尾数与单场水情数据将同步冲减，不可撤销。
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-data-sm text-label-data-sm cursor-pointer"
              >
                保留记录
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCatch(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-error text-on-error font-label-data-sm text-label-data-sm font-semibold active:scale-95 cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
