export const PROFILE = {
  name: '少辰',
  weight: 64,
  height: 175,
  targetLow: 68,
  targetHigh: 70,
  phase: '恢复增肌',
  bmi: 20.9,
  week: '5 练 2 休',
  kcalTrain: 2600,
  kcalRest: 2470,
  protein: '140–150g',
}

export const MACROS = [
  { name: '蛋白质', value: '145g', note: '2.2 g/kg', pct: 100, color: '#C6FF3D' },
  { name: '碳水', value: '320g', note: '4.9 g/kg', pct: 82, color: '#7CD4FF' },
  { name: '脂肪', value: '70g', note: '1.1 g/kg', pct: 58, color: '#FFB547' },
  { name: '蔬菜', value: '500g+', note: '膳食纤维', pct: 70, color: '#B78CFF' },
]

export const MEALS = [
  { time: '10:00', title: '早餐', kcal: '≈ 620', desc: '2 个鸡蛋饼 + 250ml 牛奶 + 1 份燕麦（40g）+ 复合维生素' },
  { time: '13:00', title: '午餐', kcal: '≈ 700', desc: '150g 鸡胸 / 牛肉 + 150g 米饭 + 200g 蔬菜 + 少许油' },
  { time: '14:30', title: '练前', kcal: '≈ 320', desc: '1 根香蕉 + 1 片全麦面包 + 黑咖啡（12:00 前）' },
  { time: '17:15', title: '练后', kcal: '≈ 560', desc: 'FoYes 乳清 1 勺（22.5g 蛋白）+ 150g 米饭 + 150g 鸡胸 + 蔬菜' },
  { time: '20:30', title: '睡前', kcal: '≈ 400', desc: '200g 无糖酸奶 + 30g 坚果 + 南瓜子（睡前 2.5 小时吃完）' },
]

export const HEALTH = [
  {
    id: 'knee',
    cls: 'knee',
    tag: 'SAFETY',
    title: '膝盖：不痛优先',
    body: '2025 年底练腿后下蹲刺痛，休息约 3 个月恢复。现在能蹲，但大重量与深蹲类仍不适。',
    items: [
      '疼痛 0–2/10 可练，刺痛即停',
      '腿举下到 90°，腿屈伸不锁死',
      '每次只加 2.5–5kg，疼不加重才继续',
      '刺痛持续 / 肿 / 卡住 / 夜间痛 → 骨科',
    ],
    icon: 'knee',
  },
  {
    id: 'hair',
    cls: 'hair',
    tag: 'AGA',
    title: '头皮：已确诊 AGA',
    body: '脂溢性脱发 = 雄激素性脱发。每晚复方司亚旦生发酊 1ml，每天洗头。',
    items: [
      '司亚旦是辅助，不能替代米诺地尔',
      '复诊确认是否加 5% 米诺地尔 + 非那雄胺',
      '酮康唑 2% 洗剂每周 2–3 次',
      '至少坚持 6 个月再判断疗效',
    ],
    icon: 'hair',
  },
  {
    id: 'sleep',
    cls: 'sleep',
    tag: 'RECOVERY',
    title: '睡眠：先固定起床',
    body: '目标 23:00 上床、10:00 前起。实际入睡要 1–2 小时，夜醒 2–3 次。',
    items: [
      '固定 10:00 起床，不赖床',
      '上床 20 分钟睡不着就起来',
      '12:00 后不碰咖啡因',
      '20:30 后限水，睡前排空膀胱',
    ],
    icon: 'sleep',
  },
]

export const KNOWLEDGE = [
  { n: '01', t: '训练体系 · 容量、强度、渐进超负荷', d: 'ACSM 2026' },
  { n: '02', t: '营养与减脂 · 热量、蛋白、餐次', d: 'TDEE' },
  { n: '03', t: '体态矫正 · 圆肩、O 型腿、膝盖', d: '循证' },
  { n: '04', t: '补剂指南 · 肌酸、鱼油、乳清', d: 'ISSN' },
  { n: '05', t: '男性健康 · 前列腺、脱发、睡眠', d: '临床' },
  { n: '06', t: '谭成义方法论 · 可借鉴与需甄别', d: '来源标注' },
  { n: '07', t: 'Skill 设计规范 · 让 AI 按规则调计划', d: '模板' },
  { n: '08', t: '最新研究更新 · 旧说法 vs 新证据', d: '2025–26' },
]

export const CYCLE = [
  { w: '第 1 周', sets: '每动作 2 组', rir: 'RIR 3–4', note: '校准周：找动作感觉，别冲重量' },
  { w: '第 2 周', sets: '每动作 2–3 组', rir: 'RIR 2–3', note: '逐步加一组，重量不变或微加' },
  { w: '第 3–4 周', sets: '每动作 3 组', rir: 'RIR 1–3', note: '进入正常训练量，开始记录' },
  { w: '第 5 周起', sets: '按部位组数', rir: 'RIR 1–3', note: '连续 2 次做满上限再加 2.5 / 5kg' },
]

export const WARMUP = [
  { t: '杠铃 / 大重量复合动作', d: '空杆×10 → 40%×8 → 60%×5 → 75%×3 → 85%×2' },
  { t: '器械 / 中等重量动作', d: '50%×10 → 75–80%×5' },
  { t: '同肌群第二个多关节', d: '60%×5、80%×2 两个短组' },
  { t: '孤立动作', d: '1 组轻重量 ×12–15 找感觉' },
]