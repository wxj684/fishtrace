import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MediaItem } from '../types';

export const MediaScreen: React.FC = () => {
  const {
    mediaItems,
    addMediaItem,
    openLightbox,
    catches,
    setInspectedCatch,
    setActiveTab,
    spots,
    showToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'trophy' | 'spot_map' | 'tackle' | 'nature'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New photo form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'trophy' | 'spot_map' | 'tackle' | 'nature'>('trophy');
  const [newSpotName, setNewSpotName] = useState('千岛湖·界首湾桦树林回水湾');
  const [newSpecs, setNewSpecs] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const filteredMedia = useMemo(() => {
    return mediaItems.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.spotName.toLowerCase().includes(q) ||
        (item.specs && item.specs.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [mediaItems, activeCategory, searchQuery]);

  const handleInspectLinkedCatch = (catchId?: string) => {
    if (!catchId) {
      showToast('该素材为独立水情地貌测绘，未关联单一中鱼记录', 'info');
      return;
    }
    const target = catches.find(c => c.id === catchId);
    if (target) {
      setInspectedCatch(target);
    } else {
      showToast('未找到对应渔获记录', 'warning');
    }
  };

  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMediaItem({
      url:
        newPhotoUrl.trim() ||
        '/src/assets/images/scenic_water_surface_1793009818752.jpg',
      title: newTitle.trim(),
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      spotName: newSpotName,
      specs: newSpecs.trim() || '现场实景光学采集',
      notes: newNotes.trim() || '自验无误入库'
    });

    setNewTitle('');
    setNewSpecs('');
    setNewNotes('');
    setNewPhotoUrl('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full pb-safe px-margin pt-space-md gap-space-md select-none">
      {/* 顶部素材库概览与检索 */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">photo_library</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">实战场景相册与素材大图</h2>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="h-8 px-2.5 rounded-xl bg-tertiary-container text-on-tertiary font-label-caps text-label-caps uppercase font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
            收录照片
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索素材标题、标点、实测规格..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: '全部相册' },
            { id: 'trophy', label: '巨物标尺留影' },
            { id: 'spot_map', label: '水图测绘' },
            { id: 'tackle', label: '精工钓具定妆' },
            { id: 'nature', label: '水面与生态' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full font-label-data-sm text-label-data-sm whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 素材大图栅格 (Photo Media Grid) */}
      <section className="grid grid-cols-1 gap-space-md">
        {filteredMedia.map(item => (
          <article
            key={item.id}
            className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col group border border-surface-container/60"
          >
            {/* Image viewport with zoom trigger */}
            <div
              onClick={() => openLightbox(item.url, item.title, item)}
              className="relative w-full h-52 bg-surface-dim overflow-hidden cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-space-md justify-between">
                <span className="font-label-caps text-[10px] text-tertiary-fixed font-bold tracking-wider uppercase">
                  {item.category === 'trophy'
                    ? 'TROPHY ARCHIVE'
                    : item.category === 'tackle'
                    ? 'TACKLE SPEC'
                    : item.category === 'spot_map'
                    ? 'HYDROGRAPHIC CHART'
                    : 'NATURE ECOLOGY'}
                </span>
                <span className="h-6 px-2 rounded-full bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-label-caps text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">fullscreen</span>
                  查看大图
                </span>
              </div>
            </div>

            {/* Linked Data Information Card */}
            <div className="p-space-md flex flex-col gap-space-xs bg-surface-container-lowest">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  {item.title}
                </h3>
                <span className="font-mono text-[10px] text-on-surface-variant shrink-0">
                  {item.date}
                </span>
              </div>

              <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-xs truncate">
                <span className="material-symbols-outlined text-[14px] text-primary">place</span>
                <span>{item.spotName}</span>
                {item.specs && (
                  <>
                    <span className="text-outline">·</span>
                    <span className="font-mono text-secondary">{item.specs}</span>
                  </>
                )}
              </div>

              {item.notes && (
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-0.5 line-clamp-2">
                  {item.notes}
                </p>
              )}

              {/* Action: Jump to associated catch log */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container/60 mt-1">
                {item.catchId ? (
                  <button
                    onClick={() => handleInspectLinkedCatch(item.catchId)}
                    className="text-xs font-label-caps text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    查看对应渔获记录与水情
                  </button>
                ) : (
                  <span className="text-[11px] font-label-caps text-outline">独立水文测绘图件</span>
                )}

                <span className="font-label-caps text-[10px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-primary">verified</span>
                  高保真光学归档
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 录入新照片素材 Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-t-2xl p-space-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_a_photo</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  收录实战影像与图谱
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMedia} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  图片标题 / 说明
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：晨曦水表翘嘴暴口留影"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    分类图集
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                  >
                    <option value="trophy">巨物标尺留影</option>
                    <option value="spot_map">水图测绘</option>
                    <option value="tackle">精工钓具定妆</option>
                    <option value="nature">水面与生态</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    拍摄水区
                  </label>
                  <select
                    value={newSpotName}
                    onChange={e => setNewSpotName(e.target.value)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-sm focus:outline-none"
                  >
                    {spots.map(s => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  实测规格 (尺寸/重量/水深)
                </label>
                <input
                  type="text"
                  placeholder="如：52cm / 2.1kg / 水深 4.0m"
                  value={newSpecs}
                  onChange={e => setNewSpecs(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  图片网络链接 (选填，默认使用高清水库样图)
                </label>
                <input
                  type="url"
                  placeholder="可粘贴外部合规图片URL"
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  实况手记备注
                </label>
                <textarea
                  rows={2}
                  placeholder="记录水体反光、中鱼前后的咬钩背景..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="p-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  确认收录入册
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
