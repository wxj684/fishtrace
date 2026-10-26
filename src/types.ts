export interface CatchRecord {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 16:40 or 2024-04-18 16:40
  spotId: number | string;
  spotName: string;
  location?: string;
  species: '鲤鱼' | '鳜鱼' | '鲫鱼' | '草鱼' | '翘嘴' | string;
  method: '台钓' | '路亚' | '传统钓' | string;
  weight: number; // in kg
  length?: number; // in cm
  count: number;
  depth: string;
  rig: string;
  bait: string;
  temp: number; // 水温 ℃
  pressure: number; // 气压 hPa
  flowAndClarity?: string;
  pressureTrend?: string;
  photoUrl?: string;
  photoTitle?: string;
  notes?: string;
  isReleased?: boolean;
  tags?: string[];
}

export interface FishingSpot {
  id: number | string;
  letter?: string;
  title: string;
  category: 'dropoff' | 'structure' | 'bay' | 'rapid';
  depthDisplay: string;
  depthNum: number;
  distanceKm: number;
  score: number;
  bottomType: string;
  targetFish: string;
  statusBadge: string;
  tags: string[];
  note: string;
  isFavorite: boolean;
  coordinates?: string;
  defaultTemp?: number;
  defaultPressure?: number;
}

export interface AnglingTask {
  id: string;
  title: string;
  tag: string;
  tagColor?: string;
  desc: string;
  completed: boolean;
  dueDate?: string;
}

export interface TackleItem {
  id: string;
  name: string;
  category: 'rod' | 'line' | 'float' | 'hook' | 'lure';
  brandModel: string;
  specs: string;
  usageCount: number;
  successRate: number;
  status: '主力配备' | '备用试探' | '极端工况';
  notes: string;
  photoUrl?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  category: 'trophy' | 'spot_map' | 'tackle' | 'nature';
  date: string;
  spotName: string;
  catchId?: string;
  specs?: string;
  notes?: string;
}

export type DepthZoneType = 'shallow' | 'dropoff' | 'deep';

export interface SoundingPoint {
  id: string;
  name: string;
  xPercent: number; // 0 - 100% on the map
  yPercent: number; // 0 - 100% on the map
  depth: number; // in meters, e.g. 4.2
  depthZone: DepthZoneType;
  bottomType: '沙泥底' | '碎石乱礁' | '腐殖淤泥' | '倒木沉树' | '硬质粘土';
  fishHidingScore: number; // 0 - 100
  predictedSpecies: string[]; // e.g. ['野生鲤鱼', '大板鲫']
  structureTag: string; // e.g. '深浅交汇斜坡', '乱石暗桩倒木'
  sonarFrequency?: string; // e.g. 'CHIRP 200kHz'
  source: 'manual' | 'sonar_sim';
  timeRecorded: string;
  notes: string;
}
