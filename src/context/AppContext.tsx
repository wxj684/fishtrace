import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CatchRecord, FishingSpot, AnglingTask, TackleItem, MediaItem, SoundingPoint } from '../types';

interface ToastState {
  id: number;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export type TabType = 'home' | 'logs' | 'plan' | 'insights' | 'media';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Spots state
  spots: FishingSpot[];
  addSpot: (spot: Omit<FishingSpot, 'id'>) => void;
  updateSpot: (id: string | number, spot: Partial<FishingSpot>) => void;
  deleteSpot: (id: string | number) => void;
  toggleSpotFavorite: (id: string | number) => void;
  activeSpot: FishingSpot;
  setActiveSpotId: (id: string | number) => void;

  // Catches state
  catches: CatchRecord[];
  addCatch: (record: Omit<CatchRecord, 'id'>) => void;
  updateCatch: (id: string, record: Partial<CatchRecord>) => void;
  deleteCatch: (id: string) => void;
  totalLogsCount: number;
  totalFishCount: number;
  recordWeight: number;

  // Tasks state
  tasks: AnglingTask[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<AnglingTask, 'id' | 'completed'>) => void;
  deleteTask: (id: string) => void;

  // Tackle state
  tackles: TackleItem[];
  addTackle: (item: Omit<TackleItem, 'id'>) => void;

  // Media state
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id'>) => void;

  // Live session & timers
  sessionSeconds: number;
  isSessionActive: boolean;
  toggleSessionTimer: () => void;
  chumMinutesElapsed: number;
  resetChumTimer: () => void;
  windowCountdownSeconds: number;
  quickStrikeCount: number;
  recordQuickStrike: (species: string, signal: string) => void;

  // Toast
  toast: ToastState | null;
  showToast: (msg: string, icon?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Lightbox modal state
  lightboxImage: { url: string; title: string; metadata?: any } | null;
  openLightbox: (url: string, title?: string, metadata?: any) => void;
  closeLightbox: () => void;

  // Sync state
  isSyncing: boolean;
  triggerSync: () => void;

  // Detail record modal for inspection
  inspectedCatch: CatchRecord | null;
  setInspectedCatch: (record: CatchRecord | null) => void;

  // Selected date for plan view
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Spot picker or viewer modal
  isSpotMapModalOpen: boolean;
  setIsSpotMapModalOpen: (open: boolean) => void;

  // Bathymetric mapping modal & sounding records
  soundingPoints: SoundingPoint[];
  addSoundingPoint: (point: Omit<SoundingPoint, 'id'>) => void;
  deleteSoundingPoint: (id: string) => void;
  isBathymetryModalOpen: boolean;
  setIsBathymetryModalOpen: (open: boolean) => void;
  activeSoundingPointId: string | null;
  setActiveSoundingPointId: (id: string | null) => void;

  // Highlighted spot
  highlightedSpotId: string | number | null;
  setHighlightedSpotId: (id: string | number | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialSpots: FishingSpot[] = [
  {
    id: 1,
    letter: 'A',
    title: '千岛湖·界首湾桦树林回水湾',
    category: 'dropoff',
    depthDisplay: '3.5 ~ 5.0m',
    depthNum: 4.2,
    distanceKm: 0.8,
    score: 98,
    bottomType: '沙泥平坎',
    targetFish: '大鲤 / 鳊鱼',
    statusBadge: '活跃高产期',
    tags: ['迎风背浪', '走水微缓'],
    note: '铧尖两侧回水湾天然聚鱼，晨光与傍晚窗口期沿深浅交界 4.2m 等深线走底拖逗极易接口。',
    isFavorite: true,
    coordinates: "北纬29°36' / 东经118°58'",
    defaultTemp: 18.4,
    defaultPressure: 1014
  },
  {
    id: 2,
    letter: 'B',
    title: '红石岩沉树水底盲区',
    category: 'structure',
    depthDisplay: '6.2m',
    depthNum: 6.2,
    distanceKm: 2.1,
    score: 86,
    bottomType: '乱石枯枝堆',
    targetFish: '军鱼 / 鳜鱼',
    statusBadge: '需轻铅试探 · 易挂底',
    tags: ['倒伏枯木', '水流湍急'],
    note: '水下6米有老河堤沉树倒伏，藏大个体掠食鱼，建议德州钓组配防挂曲柄钩或重铅贴底轻跳。',
    isFavorite: false,
    coordinates: "北纬29°35' / 东经118°59'",
    defaultTemp: 18.2,
    defaultPressure: 1018
  },
  {
    id: 3,
    letter: 'C',
    title: '排坊西湾芦苇草滩',
    category: 'bay',
    depthDisplay: '1.2 ~ 1.8m',
    depthNum: 1.6,
    distanceKm: 3.4,
    score: 92,
    bottomType: '腐殖淤泥底',
    targetFish: '野生大板鲫',
    statusBadge: '草洞需打隔夜窝',
    tags: ['水流静止', '浅草掩护'],
    note: '春季与深秋水温回暖时草缝必有大鲫巡游就饵，七星漂轻坠配长竿短线点钓效果奇佳。',
    isFavorite: true,
    coordinates: "北纬29°37' / 东经118°57'",
    defaultTemp: 18.8,
    defaultPressure: 1014
  },
  {
    id: 4,
    letter: 'D',
    title: '老水闸下泄流深潭回水核',
    category: 'rapid',
    depthDisplay: '7.5 ~ 9.0m',
    depthNum: 8.5,
    distanceKm: 4.7,
    score: 81,
    bottomType: '卵石冲刷槽',
    targetFish: '翘嘴 / 鲈鱼',
    statusBadge: '溶氧量丰沛 · 咬钩凶猛',
    tags: ['水流湍急', '深潭翻水'],
    note: '开闸放水后回水湾边缘集结大量小餐条，黄昏时分用米诺或沉水铅笔平收常遇大体型翘嘴截口。',
    isFavorite: false,
    coordinates: "北纬29°34' / 东经119°01'",
    defaultTemp: 17.5,
    defaultPressure: 1012
  }
];

const initialCatches: CatchRecord[] = [
  {
    id: 'log-001',
    title: '界首湾 6.4kg 纯野生金鳞野鲤',
    date: '2024-04-18',
    time: '2024-04-18 16:40',
    spotId: 1,
    spotName: '千岛湖·界首水库西北湾回水区',
    species: '鲤鱼',
    method: '台钓',
    weight: 6.4,
    length: 74.5,
    count: 1,
    depth: '3.8 M',
    rig: '竿长: 6.3米大物综合竿 / 3.0#主线 / 2.0#碳线子线 / 8号新关东 (双钩) / 枣核纳米浮标 (调7目钓3目)',
    bait: '老坛谷麦 + 嫩甜玉米',
    temp: 17.8,
    pressure: 1015,
    photoUrl: '/src/assets/images/catch_trophy_carp_1793009820315.jpg',
    photoTitle: '界首湾 6.4kg 纯野生金鳞野鲤 (标尺实测 74.5cm)',
    notes: '深秋水温骤降前的暴食窗口，中鱼瞬间向深槽外窜拉力凶猛，遛鱼8分钟抄网入护。',
    isReleased: true,
    tags: ['纪录级 #01', '台钓重铅', '放生归水']
  },
  {
    id: 'log-002',
    title: '岩石落差暗礁探获 42cm 鳜鱼',
    date: '2024-04-15',
    time: '2024-04-15 19:15',
    spotId: 2,
    spotName: '富春江支流·老桥墩下乱石堆',
    species: '鳜鱼',
    method: '路亚',
    weight: 1.35,
    length: 42.0,
    count: 1,
    depth: '2.4 M',
    rig: "竿: 6'4\" UL快调微物竿 / 0.6# 8编PE线 + 6lb 氟碳前导 / 3.5g 德州钨钢铅 + 1#曲头钩 / 2.5寸深绿金粉卷尾蛆",
    bait: '2.5寸深绿金粉卷尾蛆',
    temp: 18.2,
    pressure: 1018,
    flowAndClarity: '微流 · 透明度 85cm',
    pressureTrend: '1018 hPa (上升期)',
    photoUrl: '/src/assets/images/weather_hydro_lake_1793009821222.jpg',
    photoTitle: '老桥墩乱石堆暗礁水流暮色探钓',
    notes: '湖面晨雾刚散时在桦树林向外延伸铧尖处水表炸水，平收配合轻抽瞬即截口。',
    isReleased: true,
    tags: ['路亚搜底', '窗口期暴口']
  },
  {
    id: 'log-003',
    title: '芦苇丛草洞 野生大板鲫 8尾',
    date: '2024-04-10',
    time: '2024-04-10 11:30',
    spotId: 3,
    spotName: '青山湖东滩·芦苇草障浅滩',
    species: '鲫鱼',
    method: '传统钓',
    weight: 2.80,
    length: 24.5,
    count: 8,
    depth: '1.1 M',
    rig: '8米高碳定位长竿 (短线操作) / 1.5# 进口斑马尼龙通线 / 特选孔雀羽七星漂 (4号沉水) / 4号铜头朝天钩 + 活体红虫',
    bait: '自制酒米 + 药酒麸皮打点',
    temp: 18.8,
    pressure: 1014,
    flowAndClarity: '晴暖微风 · 东南风2级',
    photoUrl: '/src/assets/images/tackle_gear_flatlay_1793009820442.jpg',
    photoTitle: '草洞传统钓精密装备组 (8m碳素炮竿 / 七星漂 / 活体皮肉红虫)',
    notes: '西侧草窝边避风回流区，发酵酒米打底后使用鲜活红虫做钓，送漂2目动作极为利索。',
    isReleased: true,
    tags: ['谷麦短线', '草洞寻踪', '中鱼 8 尾']
  }
];

const initialMedia: MediaItem[] = [
  {
    id: 'm-1',
    url: '/src/assets/images/catch_trophy_carp_1793009820315.jpg',
    title: '界首湾 6.4kg 纯野生金鳞野鲤 (标尺实测 74.5cm)',
    category: 'trophy',
    date: '2024-04-18',
    spotName: '千岛湖·界首水库西北湾回水区',
    catchId: 'log-001',
    specs: '74.5cm / 6.40kg / 水深 3.8m / 甜玉米',
    notes: '日落前黄金窗口捕获，鱼体无伤完成标定后安全放生归湖。'
  },
  {
    id: 'm-2',
    url: '/src/assets/images/tackle_gear_flatlay_1793009820442.jpg',
    title: '精密钓具配件与仕挂线组定妆全貌',
    category: 'tackle',
    date: '2024-04-10',
    spotName: '青山湖东滩·芦苇草障浅滩',
    catchId: 'log-003',
    specs: '8m高碳炮竿 / 1.5#斑马通线 / 孔雀羽七星漂 / 钨钢铅',
    notes: '野钓精密配件收纳盒、电子拉力秤与微物仕挂组合全平铺。'
  },
  {
    id: 'm-3',
    url: '/src/assets/images/bathymetric_depth_map_1793009822977.jpg',
    title: '千岛湖·界首主航道等高水深测绘剖面图',
    category: 'spot_map',
    date: '2024-04-15',
    spotName: '界首主水系',
    specs: '等深落差 0.5m ~ 18.2m / 36°15\'N 94°45\'W',
    notes: '包含3处标定核心渔点（铧尖、沉船、西湾芦苇荡）。'
  },
  {
    id: 'm-4',
    url: '/src/assets/images/scenic_water_surface_1793009818752.jpg',
    title: '千岛湖桦树林晨雾水面与小舟巡检',
    category: 'nature',
    date: '2024-04-18',
    spotName: '千岛湖·界首湾桦树林回水湾',
    specs: '水温 18.4℃ / 气压 1014hPa / 东南风2级',
    notes: '晨光微露时分，山峦薄雾轻拂，3号老钓位静水微澜。'
  },
  {
    id: 'm-5',
    url: '/src/assets/images/weather_hydro_lake_1793009821222.jpg',
    title: '深秋湖泊暴口窗口期云隙透光气象',
    category: 'nature',
    date: '2024-04-16',
    spotName: '富春江主水域',
    specs: '气压梯度 +7 hPa / 阳光穿透水表',
    notes: '气压跃变爬升期，水表溶氧量骤升，形成进食黄金窗口。'
  },
  {
    id: 'm-6',
    url: '/src/assets/images/fish_species_plate_1793009822638.jpg',
    title: '原生拟饵与台钓共栖图谱：鳜鱼 & 鲫鱼',
    category: 'nature',
    date: '2024-03-28',
    spotName: '生态水文手记 Plate 04',
    specs: 'Siniperca chuatsi & Carassius carassius',
    notes: '底栖与掠食鱼群生态水层活动规律与苦草附着带标定。'
  },
  {
    id: 'm-7',
    url: '/src/assets/images/empty_state_lakeside_1793009822447.jpg',
    title: '钓场静息等待抛竿空景插画',
    category: 'nature',
    date: '2024-04-01',
    spotName: '临水钓台空景',
    specs: '等待新实战记录',
    notes: '静水微澜，折叠钓椅与钓竿安放于水岸，守候每一次有效口。'
  }
];

const initialTasks: AnglingTask[] = [
  {
    id: 't-1',
    title: '测试新绑 0.8# 溪流子线配伊势尼4号',
    tag: '细线应对滑口',
    desc: '针对深秋回水湾轻口野生鲫鱼，测试吸入阻力与提竿正口率',
    completed: false,
    dueDate: '2024-04-19'
  },
  {
    id: 't-2',
    title: '复测南湾水底深槽落差 (探底沉子比对)',
    tag: '地形复勘',
    tagColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    desc: '排查距岸 11m 处台阶边缘是否淤积水草，校验等深水线吻合度',
    completed: false,
    dueDate: '2024-04-19'
  }
];

const initialTackles: TackleItem[] = [
  {
    id: 'tk-1',
    name: '6.3米大物综合轻量竿',
    category: 'rod',
    brandModel: '日本东丽 60T 高碳素复合',
    specs: '先径 1.3mm / 元径 23.5mm / 净重 178g / 28调性',
    usageCount: 24,
    successRate: 88,
    status: '主力配备',
    notes: '强力腰身抗大弯，应对水库4-10kg大鲤草鱼不泄力',
    photoUrl: '/src/assets/images/tackle_gear_flatlay_1793009820442.jpg'
  },
  {
    id: 'tk-2',
    name: "6'4\" UL 快调微物路亚竿",
    category: 'rod',
    brandModel: 'FUJI 钛合金SIC导环',
    specs: '饵重 1.5-7g / 适合0.4#-0.8# PE / 快调F调',
    usageCount: 19,
    successRate: 79,
    status: '主力配备',
    notes: '高传导手感，微物德州触底与岩石撞击感极为清晰',
    photoUrl: '/src/assets/images/tackle_gear_flatlay_1793009820442.jpg'
  },
  {
    id: 'tk-3',
    name: '8.0米高碳定位传统炮竿',
    category: 'rod',
    brandModel: '硬调定位草洞专用',
    specs: '可自由定位5.4/6.3/7.2/8.0m / 极硬调',
    usageCount: 15,
    successRate: 93,
    status: '备用试探',
    notes: '芦苇丛与深水水草缝隙定点长竿短线利器'
  },
  {
    id: 'tk-4',
    name: '特选孔雀羽七星漂仕挂 (4号沉水)',
    category: 'float',
    brandModel: '天然脱脂孔雀羽梗',
    specs: '7粒装 / 阶梯阻尼 / 灵敏防缠豆',
    usageCount: 31,
    successRate: 91,
    status: '主力配备',
    notes: '草洞顶漂动作灵敏绝伦，送半目即抬竿正口'
  },
  {
    id: 'tk-5',
    name: '纳米枣核型高浮力夜光标',
    category: 'float',
    brandModel: '高精巴尔杉复合纳米涂层',
    specs: '吃铅 3.2g / 13目加粗扁尾 / 调7目钓3目',
    usageCount: 28,
    successRate: 85,
    status: '主力配备',
    notes: '千岛湖深水区抗暗流抗横风底钓首选'
  }
];

const initialSoundingPoints: SoundingPoint[] = [
  {
    id: 'sp-1',
    name: '铧树林铧尖下切坎',
    xPercent: 26,
    yPercent: 44,
    depth: 4.2,
    depthZone: 'dropoff',
    bottomType: '沙泥底',
    fishHidingScore: 96,
    predictedSpecies: ['野生鲤鱼', '草鱼'],
    structureTag: '水下等深下切坡脚 · 铧尖回流窝',
    sonarFrequency: 'CHIRP 200kHz 窄波束',
    source: 'sonar_sim',
    timeRecorded: '今日 09:25',
    notes: '水下4.2m处出现明显回水变缓台阶，声呐探测到底质紧实且有鱼群弱回波信号。'
  },
  {
    id: 'sp-2',
    name: '红石岩沉船倒木深槽',
    xPercent: 64,
    yPercent: 36,
    depth: 6.8,
    depthZone: 'deep',
    bottomType: '倒木沉树',
    fishHidingScore: 92,
    predictedSpecies: ['拟饵鳜鱼', '军鱼', '大青鱼'],
    structureTag: '沉木乱石堆 · 避温避难深槽',
    sonarFrequency: 'CHIRP 83kHz 宽波束',
    source: 'manual',
    timeRecorded: '昨日 17:10',
    notes: '6.8米深水盲区有倒伏大树，硬质树冠凸起1.5m，是掠食性鳜鱼伏击小鱼天然隐蔽所。'
  },
  {
    id: 'sp-3',
    name: '西湾芦苇滩外沿草缝',
    xPercent: 78,
    yPercent: 78,
    depth: 1.8,
    depthZone: 'shallow',
    bottomType: '腐殖淤泥',
    fishHidingScore: 88,
    predictedSpecies: ['野生大板鲫', '鳑鲏'],
    structureTag: '浅滩草丛边缘 · 溶氧充足觅食区',
    sonarFrequency: 'CHIRP 200kHz 窄波束',
    source: 'sonar_sim',
    timeRecorded: '昨日 11:30',
    notes: '1.8m苦草带向外延伸3米处，水温随光照上升最快，鲫鱼群集群就饵巡游通道。'
  },
  {
    id: 'sp-4',
    name: '主航道冲刷急流槽底',
    xPercent: 48,
    yPercent: 58,
    depth: 8.5,
    depthZone: 'deep',
    bottomType: '碎石乱礁',
    fishHidingScore: 78,
    predictedSpecies: ['翘嘴红鲌', '大体型鲈鱼'],
    structureTag: '主航道深槽 · 走水湍急大温差层',
    sonarFrequency: 'CHIRP 200kHz 窄波束',
    source: 'manual',
    timeRecorded: '3天前 14:00',
    notes: '水下8.5米深槽底质被水流冲刷成卵石带，底层水温偏低16.8℃，夜间有大体型翘嘴下潜。'
  },
  {
    id: 'sp-5',
    name: '南坡缓斜坡浅沙台地',
    xPercent: 35,
    yPercent: 25,
    depth: 2.6,
    depthZone: 'dropoff',
    bottomType: '沙泥底',
    fishHidingScore: 85,
    predictedSpecies: ['鳊鱼', '野生草鱼'],
    structureTag: '浅到深过渡斜坡 · 软泥向沙石转变带',
    sonarFrequency: 'CHIRP 200kHz 窄波束',
    source: 'sonar_sim',
    timeRecorded: '今日 08:15',
    notes: '2.6米平缓沙台，水草根系丰富，清晨表层水温回升时草鱼常在此啃食嫩草嫩叶。'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [catches, setCatches] = useState<CatchRecord[]>(initialCatches);
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);
  const [activeSpotId, setActiveSpotId] = useState<string | number>(1);
  const [tasks, setTasks] = useState<AnglingTask[]>(initialTasks);
  const [tackles, setTackles] = useState<TackleItem[]>(initialTackles);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [soundingPoints, setSoundingPoints] = useState<SoundingPoint[]>(initialSoundingPoints);
  const [isBathymetryModalOpen, setIsBathymetryModalOpen] = useState(false);
  const [activeSoundingPointId, setActiveSoundingPointId] = useState<string | null>(null);

  // Selected date for calendar view
  const [selectedDate, setSelectedDate] = useState<string>('2024-04-18');

  // Spot picker modal
  const [isSpotMapModalOpen, setIsSpotMapModalOpen] = useState(false);

  // Inspected catch modal
  const [inspectedCatch, setInspectedCatch] = useState<CatchRecord | null>(null);

  // Timers
  const [sessionSeconds, setSessionSeconds] = useState(2 * 3600 + 45 * 60 + 12);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [chumMinutesElapsed, setChumMinutesElapsed] = useState(25);
  const [windowCountdownSeconds, setWindowCountdownSeconds] = useState(1 * 3600 + 42 * 60 + 14);
  const [quickStrikeCount, setQuickStrikeCount] = useState(14);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; metadata?: any } | null>(null);

  // Highlighted spot
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | number | null>(null);

  const activeSpot = useMemo(() => {
    return spots.find(s => s.id === activeSpotId) || spots[0];
  }, [spots, activeSpotId]);

  // Timers effect
  useEffect(() => {
    let timer: any;
    if (isSessionActive) {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);

  useEffect(() => {
    const cdTimer = setInterval(() => {
      setWindowCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cdTimer);
  }, []);

  const showToast = (message: string, icon = 'check_circle', type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, icon, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 2400);
  };

  const toggleSessionTimer = () => {
    setIsSessionActive(prev => {
      const next = !prev;
      showToast(next ? '出钓计时已恢复' : '出钓计时已暂停', 'timer');
      return next;
    });
  };

  const resetChumTimer = () => {
    setChumMinutesElapsed(0);
    showToast('打窝计时已重置：建议 40min 后观察漂相进窝', 'timer');
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('云端水文、标点与战报数据已同步至最新版本', 'cloud_done');
    }, 800);
  };

  const recordQuickStrike = (species: string, signal: string) => {
    setQuickStrikeCount(prev => prev + 1);
    // Also create a quick catch record associated with active spot
    const newCatch: CatchRecord = {
      id: `log-${Date.now()}`,
      title: `${species} 清脆提竿记录`,
      date: new Date().toISOString().split('T')[0],
      time: '刚刚 (实战有效抛竿)',
      spotId: activeSpot.id,
      spotName: activeSpot.title,
      species,
      method: '台钓',
      weight: 1.2,
      count: 1,
      depth: activeSpot.depthDisplay,
      rig: '6.3米大物竿 / 2.0#主线 / 1.2#子线',
      bait: '发酵嫩甜玉米',
      temp: activeSpot.defaultTemp || 18.4,
      pressure: activeSpot.defaultPressure || 1014,
      isReleased: true,
      notes: `漂相特征: ${signal}，完成正口中鱼刺鱼动作并归入当日有效口模型。`,
      tags: ['实战抛竿', species, signal]
    };

    setCatches(prev => [newCatch, ...prev]);
    showToast(`抛竿记录已入库 [${species} · ${signal}]！已同步至各视图`, 'phishing');
  };

  // Spot CRUD
  const addSpot = (spotData: Omit<FishingSpot, 'id'>) => {
    const nextLetter = String.fromCharCode(65 + (spots.length % 26));
    const newSpot: FishingSpot = {
      ...spotData,
      id: Date.now(),
      letter: nextLetter,
      score: spotData.score || 80,
      isFavorite: false
    };
    setSpots(prev => [newSpot, ...prev]);
    setActiveSpotId(newSpot.id);
    showToast('新标点水情已入库并自动设为当前活跃水区！', 'add_location');
  };

  const updateSpot = (id: string | number, updated: Partial<FishingSpot>) => {
    setSpots(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
    // Also sync spotName in linked catches
    if (updated.title) {
      setCatches(prev =>
        prev.map(c => (c.spotId === id ? { ...c, spotName: updated.title! } : c))
      );
    }
    showToast('标点参数与水情实勘已同步至所有视图', 'edit_note');
  };

  const deleteSpot = (id: string | number) => {
    setSpots(prev => prev.filter(s => s.id !== id));
    showToast('标点档案已永久移除', 'delete_outline');
  };

  const toggleSpotFavorite = (id: string | number) => {
    setSpots(prev =>
      prev.map(s => {
        if (s.id === id) {
          const nextFav = !s.isFavorite;
          showToast(nextFav ? '已加入重点星标档案' : '已取消星标关注', 'star');
          return { ...s, isFavorite: nextFav };
        }
        return s;
      })
    );
  };

  // Catch CRUD with automatic multi-module linkage
  const addCatch = (catchData: Omit<CatchRecord, 'id'>) => {
    const newId = `log-${Date.now()}`;
    const newCatch: CatchRecord = {
      ...catchData,
      id: newId
    };
    setCatches(prev => [newCatch, ...prev]);

    // KEY LINKAGE: If a photo is attached, automatically add to media gallery linked to this catch!
    if (newCatch.photoUrl) {
      const newMedia: MediaItem = {
        id: `m-${Date.now()}`,
        url: newCatch.photoUrl,
        title: newCatch.photoTitle || newCatch.title,
        category: 'trophy',
        date: newCatch.date,
        spotName: newCatch.spotName,
        catchId: newId,
        specs: `${newCatch.weight}kg · ${newCatch.species} · 水深 ${newCatch.depth}`,
        notes: newCatch.notes || '现场实测拍照归档'
      };
      setMediaItems(prev => [newMedia, ...prev]);
    }

    showToast('出钓战报已归档！已自动同步至首页、计划视图与洞察分析', 'task_alt');
  };

  const updateCatch = (id: string, updated: Partial<CatchRecord>) => {
    setCatches(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
    // Sync media item title/notes if linked
    setMediaItems(prev =>
      prev.map(m =>
        m.catchId === id
          ? {
              ...m,
              title: updated.title || m.title,
              date: updated.date || m.date,
              spotName: updated.spotName || m.spotName,
              specs: `${updated.weight || ''}kg · 水深 ${updated.depth || ''}`
            }
          : m
      )
    );
    showToast('渔获记录已更新，全局统计与时间轴已同步', 'edit_note');
  };

  const deleteCatch = (id: string) => {
    setCatches(prev => prev.filter(c => c.id !== id));
    // Remove linked media items
    setMediaItems(prev => prev.filter(m => m.catchId !== id));
    showToast('该条渔获归档及关联素材已同步抹除', 'delete_outline');
  };

  // Computed summary
  const totalLogsCount = catches.length + 34; // baseline 37
  const totalFishCount = catches.reduce((acc, c) => acc + (c.count || 1), 0) + 79;
  const recordWeight = Math.max(...catches.map(c => c.weight || 0), 6.4);

  // Tasks
  const toggleTask = (id: string) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
      const allDone = next.every(t => t.completed);
      if (allDone) {
        showToast('太棒了！今日出钓优先级任务已全部执行落实！', 'celebration');
      } else {
        showToast('待办任务状态已更新并沉淀至决策模型', 'checklist');
      }
      return next;
    });
  };

  const addTask = (taskData: Omit<AnglingTask, 'id' | 'completed'>) => {
    const newTask: AnglingTask = {
      ...taskData,
      id: `t-${Date.now()}`,
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    showToast('已添加今日出钓优先级待办', 'add_task');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('已删除待办事项', 'delete_outline');
  };

  // Tackle
  const addTackle = (tackleData: Omit<TackleItem, 'id'>) => {
    const newItem: TackleItem = {
      ...tackleData,
      id: `tk-${Date.now()}`
    };
    setTackles(prev => [newItem, ...prev]);
    showToast('新装备已入库装备图鉴', 'inventory_2');
  };

  // Media
  const addMediaItem = (itemData: Omit<MediaItem, 'id'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: `m-${Date.now()}`
    };
    setMediaItems(prev => [newItem, ...prev]);
    showToast('新相片已入库素材相册', 'photo_library');
  };

  // Lightbox
  const openLightbox = (url: string, title = '标尺实测原图', metadata?: any) => {
    setLightboxImage({ url, title, metadata });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // Bathymetric Sounding Points CRUD
  const addSoundingPoint = (pointData: Omit<SoundingPoint, 'id'>) => {
    const newPoint: SoundingPoint = {
      ...pointData,
      id: `sp-${Date.now()}`
    };
    setSoundingPoints(prev => [newPoint, ...prev]);
    showToast(`已录入测深点【${newPoint.name}】(${newPoint.depth}m)`, 'radar', 'success');
  };

  const deleteSoundingPoint = (id: string) => {
    setSoundingPoints(prev => prev.filter(p => p.id !== id));
    showToast('已移除该水下测深标定记录', 'delete_outline');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        spots,
        addSpot,
        updateSpot,
        deleteSpot,
        toggleSpotFavorite,
        activeSpot,
        setActiveSpotId,
        catches,
        addCatch,
        updateCatch,
        deleteCatch,
        totalLogsCount,
        totalFishCount,
        recordWeight,
        tasks,
        toggleTask,
        addTask,
        deleteTask,
        tackles,
        addTackle,
        mediaItems,
        addMediaItem,
        sessionSeconds,
        isSessionActive,
        toggleSessionTimer,
        chumMinutesElapsed,
        resetChumTimer,
        windowCountdownSeconds,
        quickStrikeCount,
        recordQuickStrike,
        toast,
        showToast,
        lightboxImage,
        openLightbox,
        closeLightbox,
        isSyncing,
        triggerSync,
        inspectedCatch,
        setInspectedCatch,
        selectedDate,
        setSelectedDate,
        isSpotMapModalOpen,
        setIsSpotMapModalOpen,
        soundingPoints,
        addSoundingPoint,
        deleteSoundingPoint,
        isBathymetryModalOpen,
        setIsBathymetryModalOpen,
        activeSoundingPointId,
        setActiveSoundingPointId,
        highlightedSpotId,
        setHighlightedSpotId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
