import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FishingSpot } from '../types';

export const SpotsScreen: React.FC = () => {
  const {
    spots,
    addSpot,
    updateSpot,
    deleteSpot,
    toggleSpotFavorite,
    highlightedSpotId,
    setHighlightedSpotId,
    openLightbox,
    setIsBathymetryModalOpen,
    showToast
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'depth-desc' | 'depth-asc' | 'dist'>('score');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<FishingSpot | null>(null);
  const [pendingDeleteSpotId, setPendingDeleteSpotId] = useState<string | number | null>(null);

  // New spot form state
  const [newTitle, setNewTitle] = useState('');
  const [newDepth, setNewDepth] = useState('4.5m');
  const [newCategory, setNewCategory] = useState<'dropoff' | 'structure' | 'bay' | 'rapid'>('dropoff');
  const [newBottom, setNewBottom] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newNote, setNewNote] = useState('');

  // Refs for scrolling to cards
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Filtered & Sorted spots
  const filteredSpots = useMemo(() => {
    let result = spots.filter(spot => {
      const matchCat = activeCategory === 'all' || spot.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        spot.title.toLowerCase().includes(q) ||
        spot.bottomType.toLowerCase().includes(q) ||
        spot.targetFish.toLowerCase().includes(q) ||
        spot.note.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    result.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'depth-desc') return b.depthNum - a.depthNum;
      if (sortBy === 'depth-asc') return a.depthNum - b.depthNum;
      if (sortBy === 'dist') return a.distanceKm - b.distanceKm;
      return 0;
    });

    return result;
  }, [spots, activeCategory, searchQuery, sortBy]);

  const handleHighlightSpot = (id: string | number) => {
    setHighlightedSpotId(id);
    const el = cardRefs.current[String(id)];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast('已定位图例对应钓点水情', 'explore');
    setTimeout(() => {
      setHighlightedSpotId(null);
    }, 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const numericDepth = parseFloat(newDepth) || 3.0;

    addSpot({
      title: newTitle.trim(),
      category: newCategory,
      depthDisplay: newDepth.trim(),
      depthNum: numericDepth,
      distanceKm: 1.2,
      score: 75,
      bottomType: newBottom.trim() || '未明确探底',
      targetFish: newTarget.trim() || '综合淡水鱼种',
      statusBadge: '新录入标点',
      tags: ['实勘中', '待验证'],
      note: newNote.trim() || '初次记录标点，待实战测试窗口期。',
      isFavorite: false
    });

    // Reset & close
    setNewTitle('');
    setNewDepth('4.5m');
    setNewBottom('');
    setNewTarget('');
    setNewNote('');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpot) return;

    updateSpot(editingSpot.id, {
      title: editingSpot.title,
      depthDisplay: editingSpot.depthDisplay,
      depthNum: parseFloat(editingSpot.depthDisplay) || editingSpot.depthNum,
      note: editingSpot.note
    });

    setEditingSpot(null);
  };

  const confirmDelete = () => {
    if (pendingDeleteSpotId) {
      deleteSpot(pendingDeleteSpotId);
      setPendingDeleteSpotId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    showToast('筛选条件已重置', 'restart_alt');
  };

  return (
    <div className="flex flex-col w-full pb-safe">
      {/* Search Bar & Category Filter Tabs */}
      <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-sm">
        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索水库、江河标点、水深或暗礁备注..."
            className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md focus:outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-space-md flex items-center text-outline hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-space-md py-1.5 rounded-full font-label-caps text-label-caps tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            全部 ({spots.length})
          </button>
          <button
            onClick={() => setActiveCategory('rapid')}
            className={`flex-shrink-0 px-space-md py-1.5 rounded-full font-label-caps text-label-caps tracking-wider transition-all cursor-pointer ${
              activeCategory === 'rapid'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            深潭急流
          </button>
          <button
            onClick={() => setActiveCategory('bay')}
            className={`flex-shrink-0 px-space-md py-1.5 rounded-full font-label-caps text-label-caps tracking-wider transition-all cursor-pointer ${
              activeCategory === 'bay'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            回水湾草区
          </button>
          <button
            onClick={() => setActiveCategory('structure')}
            className={`flex-shrink-0 px-space-md py-1.5 rounded-full font-label-caps text-label-caps tracking-wider transition-all cursor-pointer ${
              activeCategory === 'structure'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            桥墩乱石
          </button>
          <button
            onClick={() => setActiveCategory('dropoff')}
            className={`flex-shrink-0 px-space-md py-1.5 rounded-full font-label-caps text-label-caps tracking-wider transition-all cursor-pointer ${
              activeCategory === 'dropoff'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            陡坎铧尖
          </button>
        </div>
      </div>

      {/* Bathymetric Chart Visualizer Section */}
      <div className="px-margin mb-space-md">
        <div className="relative w-full rounded-xl overflow-hidden bg-inverse-surface shadow-md aspect-[16/9] select-none">
          {/* High precision hydrographic contour illustration */}
          <img
            alt="界首水系水深水文测绘图"
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105 cursor-pointer"
            src="/src/assets/images/bathymetric_depth_map_1793009822977.jpg"
            onClick={() =>
              openLightbox(
                '/src/assets/images/bathymetric_depth_map_1793009822977.jpg',
                '千岛湖·界首主航道等高水深测绘剖面图'
              )
            }
          />

          {/* Top Overlay Gauge HUD */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
            <div className="bg-inverse-surface/85 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-inverse-on-surface tracking-wider uppercase font-semibold">
                千岛湖·界首主航道等高水深
              </span>
            </div>
            <div className="bg-inverse-surface/85 backdrop-blur-md px-2 py-1 rounded font-label-data-sm text-[10px] text-surface-variant tracking-tight">
              36°15'N · 94°45'W
            </div>
          </div>

          {/* Interactive Hydro Point A */}
          <button
            onClick={() => handleHighlightSpot(1)}
            className="group absolute top-[44%] left-[26%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-tertiary/30 animate-ping"></span>
              <span className="relative w-3.5 h-3.5 rounded-full bg-tertiary-container shadow-md flex items-center justify-center text-on-tertiary font-label-caps text-[9px] font-bold">
                A
              </span>
            </div>
            <div className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface/90 text-inverse-on-surface backdrop-blur-sm font-label-data-sm text-[10px] shadow-sm flex items-center gap-1 pointer-events-none group-hover:bg-primary-container">
              <span>铧树林铧尖</span>
              <span className="text-tertiary-fixed-dim font-bold">4.2m</span>
            </div>
          </button>

          {/* Interactive Hydro Point B */}
          <button
            onClick={() => handleHighlightSpot(2)}
            className="group absolute top-[36%] left-[64%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-primary/40 animate-pulse"></span>
              <span className="relative w-3.5 h-3.5 rounded-full bg-primary-container shadow-md flex items-center justify-center text-on-primary font-label-caps text-[9px] font-bold">
                B
              </span>
            </div>
            <div className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface/90 text-inverse-on-surface backdrop-blur-sm font-label-data-sm text-[10px] shadow-sm flex items-center gap-1 pointer-events-none group-hover:bg-primary-container">
              <span>沉船暗桩</span>
              <span className="text-primary-fixed-dim font-bold">6.8m</span>
            </div>
          </button>

          {/* Interactive Hydro Point C */}
          <button
            onClick={() => handleHighlightSpot(3)}
            className="group absolute bottom-[18%] left-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <span className="relative w-3.5 h-3.5 rounded-full bg-secondary shadow-md flex items-center justify-center text-on-secondary font-label-caps text-[9px] font-bold">
                C
              </span>
            </div>
            <div className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface/90 text-inverse-on-surface backdrop-blur-sm font-label-data-sm text-[10px] shadow-sm flex items-center gap-1 pointer-events-none group-hover:bg-primary-container">
              <span>西湾芦苇荡</span>
              <span className="text-secondary-fixed font-bold">1.8m</span>
            </div>
          </button>

          {/* Bathymetric Legend Bar */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-inverse-surface/80 backdrop-blur-sm px-2 py-1 rounded pointer-events-none font-label-caps text-[9px] text-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2 h-1 bg-surface-container"></span>浅滩草区 0-2m
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-1 bg-primary-container"></span>主斜坡 2-6m
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-1 bg-primary"></span>主河槽深潭 8m+
            </span>
          </div>
        </div>

        {/* Enter Bathymetric Sounding Station CTA */}
        <div className="mt-2">
          <button
            onClick={() => setIsBathymetryModalOpen(true)}
            className="w-full h-10 px-3 rounded-xl bg-primary text-on-primary font-label-data-sm text-[12px] font-bold flex items-center justify-between shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">radar</span>
              <span>开启水底测绘与声呐探底 · 鱼群藏身处解析</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span>测绘探底</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </div>
          </button>
        </div>
      </div>

      {/* Operational Bar: Spot Counter, Sort, Add Action */}
      <div className="px-margin flex items-center justify-between gap-space-sm mb-space-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            标点水情名录
          </span>
          <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold">
            {filteredSpots.length}处收录
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          {/* Sort Selector Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="h-8 pl-2 pr-6 bg-surface-container text-on-surface rounded-xl font-label-caps text-label-caps font-semibold appearance-none cursor-pointer focus:outline-none shadow-sm"
            >
              <option value="score">按鱼获战绩</option>
              <option value="depth-desc">按水深 (深到浅)</option>
              <option value="depth-asc">按水深 (浅到深)</option>
              <option value="dist">按水域距离</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Add Spot CTA */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 px-2.5 rounded-xl bg-tertiary-container text-on-tertiary flex items-center gap-1 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title="标记新钓点"
          >
            <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
            <span className="font-label-caps text-label-caps uppercase font-bold tracking-wider">
              标记新点
            </span>
          </button>
        </div>
      </div>

      {/* Spots Card Container */}
      {filteredSpots.length > 0 ? (
        <div className="px-margin flex flex-col gap-space-md pb-space-xl">
          {filteredSpots.map(spot => {
            const isHighlighted = highlightedSpotId === spot.id;
            return (
              <article
                key={spot.id}
                ref={el => {
                  cardRefs.current[String(spot.id)] = el;
                }}
                className={`spot-card relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                  isHighlighted ? 'ring-2 ring-primary bg-surface-container' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary font-label-caps text-[11px] font-bold flex items-center justify-center shrink-0">
                      {spot.letter || '★'}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                      {spot.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleSpotFavorite(spot.id)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-outline hover:text-tertiary transition-colors cursor-pointer"
                      title={spot.isFavorite ? '取消关注' : '星标关注'}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          spot.isFavorite ? 'text-tertiary' : 'text-outline'
                        }`}
                        style={{ fontVariationSettings: spot.isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                    <button
                      onClick={() => setEditingSpot(spot)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer"
                      title="修改参数"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </button>
                    <button
                      onClick={() => setPendingDeleteSpotId(spot.id)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-outline hover:text-error transition-colors cursor-pointer"
                      title="删除标点"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                    </button>
                  </div>
                </div>

                {/* Status Indicator Pill */}
                <div className="flex flex-wrap items-center gap-1.5 mb-space-sm">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-caps text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-primary animate-ping"></span>
                    {spot.statusBadge}
                  </span>
                  {spot.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-surface-container-low text-secondary font-label-caps text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-data-sm text-[11px] ml-auto font-medium">
                    距当前 {spot.distanceKm}km
                  </span>
                </div>

                {/* Telemetry Spec Well */}
                <div className="grid grid-cols-3 gap-space-xs bg-surface-container-low p-space-sm rounded-xl mb-space-sm">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                      适宜标靶水深
                    </span>
                    <span className="font-label-data-md text-label-data-md text-primary font-bold">
                      {spot.depthDisplay}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                      水底底质
                    </span>
                    <span className="font-label-data-sm text-label-data-sm text-on-surface font-medium truncate">
                      {spot.bottomType}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                      优势主攻鱼种
                    </span>
                    <span className="font-label-data-sm text-label-data-sm text-tertiary font-bold truncate">
                      {spot.targetFish}
                    </span>
                  </div>
                </div>

                {/* Field Observation Log Note */}
                <div className="flex items-start gap-1.5 text-on-surface-variant text-body-sm font-body-sm bg-surface-container-lowest p-1">
                  <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">
                    wb_incandescent
                  </span>
                  <p className="leading-relaxed">{spot.note}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="px-margin py-space-xl flex flex-col items-center text-center animate-in fade-in">
          <div className="w-56 h-48 rounded-2xl overflow-hidden mb-space-md shadow-inner bg-surface-container-low flex items-center justify-center">
            <img
              alt="空钓点状态插画"
              className="w-full h-full object-cover"
              src="/src/assets/images/empty_state_lakeside_1793009822447.jpg"
            />
          </div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
            未寻获匹配的水情标点
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-space-md">
            江河浩渺，此参数下暂无记录。可尝试清除搜索关键词、切换分类条件，或立即在水图上标定新勘测点。
          </p>
          <button
            onClick={resetFilters}
            className="px-space-lg py-2 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps tracking-wider uppercase font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            一键重置筛选
          </button>
        </div>
      )}

      {/* Modal: Add New Spot */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-t-2xl p-space-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_location</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  记录新标点
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  标点名称 / 地貌特称
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：南湾孤岛下切深坎"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    适宜水深 (米)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：4.5m"
                    value={newDepth}
                    onChange={e => setNewDepth(e.target.value)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-label-data-sm text-label-data-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    水文地貌分类
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                  >
                    <option value="dropoff">陡坎铧尖</option>
                    <option value="structure">桥墩乱石</option>
                    <option value="bay">回水湾草区</option>
                    <option value="rapid">深潭急流</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    底质状况
                  </label>
                  <input
                    type="text"
                    placeholder="例如：沙泥坎 / 暗礁碎石"
                    value={newBottom}
                    onChange={e => setNewBottom(e.target.value)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    目标倾向鱼种
                  </label>
                  <input
                    type="text"
                    placeholder="例如：大鲫 / 翘嘴 / 鲤鱼"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  实战走水与线组策略心得
                </label>
                <textarea
                  rows={2}
                  placeholder="记录挂底风险、走水缓急及水层建议..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="p-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  确认归档标点
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Spot */}
      {editingSpot && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in"
          onClick={() => setEditingSpot(null)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-t-2xl p-space-lg shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  调整水深与实战备注
                </h3>
              </div>
              <button
                onClick={() => setEditingSpot(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  标点名称
                </label>
                <input
                  type="text"
                  required
                  value={editingSpot.title}
                  onChange={e => setEditingSpot({ ...editingSpot, title: e.target.value })}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  标靶探测水深
                </label>
                <input
                  type="text"
                  required
                  value={editingSpot.depthDisplay}
                  onChange={e => setEditingSpot({ ...editingSpot, depthDisplay: e.target.value })}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-label-data-sm text-label-data-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  实测心得与出鱼动态
                </label>
                <textarea
                  rows={3}
                  value={editingSpot.note}
                  onChange={e => setEditingSpot({ ...editingSpot, note: e.target.value })}
                  className="p-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setEditingSpot(null)}
                  className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                >
                  放弃
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  更新水情数据
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Sheet */}
      {pendingDeleteSpotId && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in"
          onClick={() => setPendingDeleteSpotId(null)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-t-2xl p-space-lg shadow-xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-space-sm">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
              移除此水情标点？
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              移除后该钓点的水深测绘、障碍物标定以及历史出鱼统计将从本地档案中清除。
            </p>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={() => setPendingDeleteSpotId(null)}
                className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-label-caps text-label-caps uppercase font-bold shadow-sm active:scale-95 cursor-pointer"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
