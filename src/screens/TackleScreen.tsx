import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TackleItem } from '../types';

export const TackleScreen: React.FC = () => {
  const { tackles, addTackle, openLightbox, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'rod' | 'float' | 'line' | 'lure'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Float simulator state
  const [tuneEyes, setTuneEyes] = useState<number>(7); // 调目 (如调7目)
  const [fishEyes, setFishEyes] = useState<number>(3); // 钓目 (如钓3目)
  const [waterDepthSim, setWaterDepthSim] = useState<number>(3.5);

  // New gear form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'rod' | 'line' | 'float' | 'hook' | 'lure'>('rod');
  const [brandModel, setBrandModel] = useState('');
  const [specs, setSpecs] = useState('');
  const [status, setStatus] = useState<'主力配备' | '备用试探' | '极端工况'>('主力配备');
  const [notes, setNotes] = useState('');

  const filteredTackles = tackles.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const handleCreateTackle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTackle({
      name: name.trim(),
      category,
      brandModel: brandModel.trim() || '精密工规装配',
      specs: specs.trim() || '实战自定义参数',
      usageCount: 1,
      successRate: 85,
      status,
      notes: notes.trim() || '新装备已列装，待下场测试调校。'
    });

    setName('');
    setBrandModel('');
    setSpecs('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full pb-safe px-margin pt-space-md gap-space-lg select-none">
      {/* 装备库实时概览 */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">实战装备图鉴与仕挂库</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 px-2.5 rounded-xl bg-tertiary-container text-on-tertiary font-label-caps text-label-caps uppercase font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            录入装备
          </button>
        </div>

        <div className="grid grid-cols-4 gap-gutter text-center">
          <div className="p-2 bg-surface-container rounded-lg">
            <div className="font-label-caps text-label-caps text-on-surface-variant">主力竿组</div>
            <div className="font-label-data-lg text-label-data-lg text-primary font-bold">
              04<span className="text-[12px] font-normal font-sans ml-0.5">支</span>
            </div>
          </div>
          <div className="p-2 bg-surface-container rounded-lg">
            <div className="font-label-caps text-label-caps text-on-surface-variant">线组仕挂</div>
            <div className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
              12<span className="text-[12px] font-normal font-sans ml-0.5">组</span>
            </div>
          </div>
          <div className="p-2 bg-surface-container rounded-lg">
            <div className="font-label-caps text-label-caps text-on-surface-variant">高精浮标</div>
            <div className="font-label-data-lg text-label-data-lg text-tertiary font-bold">
              16<span className="text-[12px] font-normal font-sans ml-0.5">支</span>
            </div>
          </div>
          <div className="p-2 bg-surface-container rounded-lg">
            <div className="font-label-caps text-label-caps text-on-surface-variant">命中效能</div>
            <div className="font-label-data-lg text-label-data-lg text-primary-container font-bold">
              86<span className="text-[12px] font-normal font-sans ml-0.5">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 浮标调钓测算仪 (Interactive Float Tuning Simulator) */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary-container text-[20px]">
              tune
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              “调几钓几” 水位浮力仿真器
            </h3>
          </div>
          <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
            千岛湖水阻模型
          </span>
        </div>

        {/* 交互测算滑块 */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
          <div className="flex justify-between items-center text-on-surface font-body-sm">
            <span>
              半水调目 (无饵空钩状态):{' '}
              <strong className="text-primary font-bold">{tuneEyes} 目</strong>
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant">
              {tuneEyes >= 7 ? '高浮力抗暗流' : tuneEyes <= 4 ? '轻口灵敏' : '中规平衡'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={13}
            value={tuneEyes}
            onChange={e => setTuneEyes(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer"
          />

          <div className="flex justify-between items-center text-on-surface font-body-sm pt-2">
            <span>
              双饵压底钓目 (实战露出水面):{' '}
              <strong className="text-tertiary-container font-bold">{fishEyes} 目</strong>
            </span>
            <span className="font-label-caps text-[10px] text-tertiary">
              {fishEyes > tuneEyes
                ? '极钝状态 (铅坠触底)'
                : fishEyes === tuneEyes
                ? '临界平衡'
                : '一饵到底一饵悬浮'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={13}
            value={fishEyes}
            onChange={e => setFishEyes(parseInt(e.target.value, 10))}
            className="w-full accent-tertiary-container cursor-pointer"
          />

          {/* 仿真结论解释卡 */}
          <div className="mt-2 p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/30 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
              water_lux
            </span>
            <div className="flex flex-col text-xs leading-relaxed text-on-surface">
              <div>
                当前模式:{' '}
                <strong className="text-primary">
                  调 {tuneEyes} 目钓 {fishEyes} 目
                </strong>{' '}
                ·{' '}
                <span className="text-secondary font-mono">
                  目差 Δ = {tuneEyes - fishEyes} 目
                </span>
              </div>
              <p className="text-on-surface-variant mt-0.5">
                {fishEyes < tuneEyes
                  ? '下钩轻微触底，上钩悬空或触底，吸入阻力低，对轻口滑口鲫鱼极灵敏。'
                  : fishEyes === tuneEyes
                  ? '双钩完全触底，子线轻弯，大水面避开小杂鱼闹漂的最佳状态。'
                  : '重铅到底抗走水，适合深水大鲤鱼或夜钓守大物。'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 装备分类筛选胶囊 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: '全部装备' },
          { id: 'rod', label: '主力竿组' },
          { id: 'float', label: '高精浮标' },
          { id: 'line', label: '核心仕挂' },
          { id: 'lure', label: '拟饵系统' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1 rounded-full font-label-data-sm text-label-data-sm whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 装备图鉴卡列表 */}
      <section className="flex flex-col gap-space-md">
        {filteredTackles.map(item => (
          <article
            key={item.id}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md"
          >
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded font-label-caps text-[10px] font-bold ${
                      item.status === '主力配备'
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="font-label-caps text-[10px] text-outline font-mono">
                    出战 {item.usageCount} 次
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 truncate">
                  {item.name}
                </h3>
                <span className="font-label-data-sm text-[11px] text-primary mt-0.5">
                  {item.brandModel}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-baseline gap-0.5 text-tertiary">
                  <span className="font-label-data-lg text-label-data-lg leading-none font-bold">
                    {item.successRate}
                  </span>
                  <span className="font-label-caps text-label-caps">%</span>
                </div>
                <span className="font-label-caps text-[10px] text-outline mt-0.5">命中胜率</span>
              </div>
            </div>

            {/* Photo preview if present */}
            {item.photoUrl && (
              <div
                onClick={() => openLightbox(item.photoUrl!, `${item.name} - 精工定妆照`)}
                className="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer group select-none"
              >
                <img
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={item.photoUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/75 via-transparent to-transparent flex items-end p-space-md justify-between">
                  <span className="font-label-data-sm text-[11px] text-inverse-on-surface">
                    规格配件与实测配重
                  </span>
                  <span className="h-6 px-2 rounded-full bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-label-caps text-[10px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">fullscreen</span>
                    查看高清原图
                  </span>
                </div>
              </div>
            )}

            {/* Spec well */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-on-surface-variant font-label-caps text-[10px] uppercase">
                <span>工规参数详情</span>
                <span className="text-secondary font-mono">CALIBRATED</span>
              </div>
              <p className="font-label-data-sm text-[12px] text-on-surface font-semibold">
                {item.specs}
              </p>
              <div className="h-[1px] bg-surface-container-high my-0.5"></div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {item.notes}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* 录入装备 Modal */}
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
                <span className="material-symbols-outlined text-primary text-[22px]">build</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  录入实战钓具装备
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTackle} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  装备名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：5.4m 超轻量野钓综合竿"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    类别
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                  >
                    <option value="rod">鱼竿 (Rod)</option>
                    <option value="float">浮标 (Float)</option>
                    <option value="line">线组仕挂 (Line)</option>
                    <option value="hook">钩型 (Hook)</option>
                    <option value="lure">拟饵 (Lure)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    状态部署
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                  >
                    <option value="主力配备">主力配备</option>
                    <option value="备用试探">备用试探</option>
                    <option value="极端工况">极端工况</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  材质与型号工艺
                </label>
                <input
                  type="text"
                  placeholder="如：日本东丽40T碳布 / 富士SIC导环"
                  value={brandModel}
                  onChange={e => setBrandModel(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  具体规格 (克重/线径/目数)
                </label>
                <input
                  type="text"
                  placeholder="如：自重120g / 28调 / 吃铅2.4g"
                  value={specs}
                  onChange={e => setSpecs(e.target.value)}
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                  实战心得笔记
                </label>
                <textarea
                  rows={2}
                  placeholder="记录手感、腰力抗性与水深建议..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  确认入库图鉴
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
