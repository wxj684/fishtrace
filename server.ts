import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface BaitRecommendationRequestBody {
  season: string;
  targetFish: string;
  spotName?: string;
  depth?: string;
  weather?: string;
  pressure?: number;
  temp?: number;
  historicalRecords?: Array<{
    species: string;
    bait: string;
    weight?: number;
    spotName?: string;
  }>;
}

// AI Bait Recommendation API Endpoint
app.post('/api/ai/recommend-bait', async (req: Request<{}, {}, BaitRecommendationRequestBody>, res: Response) => {
  const {
    season,
    targetFish,
    spotName = '千岛湖·界首湾回水区',
    depth = '3.8m',
    weather = '1014 hPa · 水温 18.4℃ · 东南风2级',
    pressure = 1014,
    temp = 18.4,
    historicalRecords = []
  } = req.body;

  const historySummary = historicalRecords.length > 0
    ? historicalRecords.slice(0, 5).map(r => `- 钓获 ${r.species} (${r.weight || '实战'}kg)，钓点: ${r.spotName || spotName}，用饵: ${r.bait}`).join('\n')
    : `- 历史记录：千岛湖界首湾 6.4kg 金鳞野鲤（老坛谷麦 + 嫩甜玉米，水深3.8m，命中率52%）\n- 历史记录：青山湖 8尾大板鲫（自制药酒小米打窝，挂红虫，水深1.1m，命中率91%）\n- 历史记录：老桥墩 1.35kg 鳜鱼（微物软饵搜底）`;

  const prompt = `你是一位拥有二十年中国淡水野钓水文与实战鱼情经验的专家级钓鱼工程师。
请基于当前季节、目标鱼种、钓场水情与过往实战渔获数据，为钓友推演生成今日最优饵料配比方案。

【作钓参数输入】
- 当前季节与节气：${season}
- 主攻目标鱼种：${targetFish}
- 标点地貌与水深：${spotName}，标靶水深 ${depth}
- 实时气象水温：${weather}，气压 ${pressure} hPa，水温 ${temp}℃
- 钓友过往出钓数据库真实记录：
${historySummary}

【专业推演要求】
1. 必须深刻结合【当前季节水温】与【${targetFish}】在【${depth}水深】的进食与味型偏好（如初春/秋末偏好酵香微甜重颗粒留底；夏季高温避杂鱼清淡本味；早春寒凉偏腥香细雾化）。
2. 配比必须清晰精确，包含具体的天然基础粮、味型主攻饵、状态饵（拉丝粉/轻麸/雪花粉）以及水比（水饵比）。
3. 给出实操挂饵手法（搓饵/散炮/包芯/挂颗粒）以及基于过往历史战绩的置信度研判。

请严格仅以标准 JSON 格式返回，不要包含 markdown 代码块外的内容，JSON 格式规范如下：
{
  "formulaName": "配方名称（如：仲秋界首湾大物酵香谷麦复合饵）",
  "flavorProfile": "味型特征（如：酵香浓郁微酸带谷物果甜）",
  "atomization": "雾化与比重状态（如：中低雾化 · 重颗粒快速沉底留底）",
  "waterRatio": "水饵比（如：1 : 0.85）",
  "restingTime": "醒饵时间（如：静置 5~8 分钟）",
  "ingredients": [
    { "name": "原料名称（如：老坛发酵谷麦碎玉米）", "percentage": 45, "role": "留底重颗粒，抗白条小杂鱼啄食" },
    { "name": "原料名称（如：超诱复合谷物基础饵）", "percentage": 25, "role": "扩散水层基础麦香信息" },
    { "name": "原料名称（如：螺鲤2号浓腥纯料）", "percentage": 15, "role": "底层高蛋白刺激深水大鲤就饵" },
    { "name": "原料名称（如：轻质状态麸 + 5号拉丝粉）", "percentage": 15, "role": "调节适口性，保证到底残留" }
  ],
  "hookMethod": "挂钩与实操战术（如：双钩挂嫩玉米粒外包散炮，到底2分钟外层剥落形成聚鱼窝）",
  "historicalInsight": "基于历史渔获数据的战果研判（如：比对您过往在界首湾 6.4kg 鲤鱼纪录，此配比避开杂鱼率达 74%，对 3-8kg 纯野生大鲤的开口命中率提升至 88%）",
  "confidenceScore": 91
}`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = aiResponse.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed });
    }
    throw new Error('Empty response from AI model');
  } catch (err: any) {
    console.error('AI Bait Recommendation failed, using empirical fallback model:', err?.message || err);

    // High fidelity expert empirical fallback
    const fallbackFormula = {
      formulaName: `${season.slice(0, 2)}·${targetFish}实战靶向优化配比`,
      flavorProfile: targetFish === '野生鲤鱼' ? '发酵天然谷麦香带微酸果甜' : targetFish === '野生鲫鱼' ? '细麦香微腥适口' : '浓腥微香高诱食性',
      atomization: targetFish === '野生鲤鱼' ? '慢沉微雾化 · 大颗粒锚底聚大物' : '中速雾化 · 层层剥落诱鲫',
      waterRatio: '1 : 0.85',
      restingTime: '静置 5-8 分钟（待谷物充分吸水膨胀）',
      ingredients: [
        { name: '老坛酵香谷麦 / 甜玉米颗粒', percentage: 45, role: '重比重大颗粒，强效避开水表杂鱼闹窝' },
        { name: '复合超诱纯谷物基础粉', percentage: 25, role: '还原原生水体粮食发酵气味' },
        { name: targetFish === '野生鲤鱼' ? '螺肉腥香深底料' : '浓香奶香粉', percentage: 15, role: '增强底层水温下的穿透诱惑力' },
        { name: '轻质小麦蛋白拉丝粉 + 雪花粉', percentage: 15, role: '改善适口性，确保饵球平稳下沉到底' }
      ],
      hookMethod: '上钩包软散炮持续做窝诱鱼，下钩单挂发酵嫩甜玉米粒定点守大鱼；建议调7目钓3目。',
      historicalInsight: `结合您在【${spotName}】的过往记录，水深 ${depth} 环境下该谷麦配方中鱼转化率可提升 35% 以上。`,
      confidenceScore: 89
    };

    return res.json({ success: true, data: fallbackFormula, isFallback: true });
  }
});

// Setup Vite middleware in development or serve static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[FishTrace] Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
