export const PROFILE = {
  name: '少辰',
  weight: 64,
  height: 175,
  targetLow: 68,
  targetHigh: 70,
  phase: '恢复增肌',
  bmi: 20.9,
  week: '5 练 2 休',
  kcalWeek: 2646,
  kcalTrain: '2719–2759',
  kcalRest: 2440,
  protein: '136g',
}

export const MACROS = [
  { name: '蛋白质', value: '136g', note: '2.13 g/kg', pct: 100, color: '#C6FF3D' },
  { name: '碳水', value: '394g', note: '6.16 g/kg', pct: 100, color: '#7CD4FF' },
  { name: '脂肪', value: '66g', note: '1.03 g/kg', pct: 52, color: '#FFB547' },
  { name: '纤维', value: '29.6g', note: '目标 25–30g', pct: 96, color: '#B78CFF' },
]

export const MEALS = [
  { time: '11:00', title: '早餐', kcal: '固定', desc: '燕麦 30g + 水煮蛋 3 个 + 低脂牛奶 200ml + 黑芝麻 8g + 奇亚籽 15g，肌酸 / 鱼油 / Swisse 随餐' },
  { time: '13:30', title: '午餐', kcal: '一锅两顿', desc: '米饭 340g（黑米 60g）+ 番茄 100g + 西兰花 250g + 胡萝卜 80g + 干木耳 8g + 去皮鸡腿 220g，吃一半，另一半立刻进冰箱' },
  { time: '14:30', title: '练前', kcal: '训练日', desc: '香蕉 1 根（去皮约 130g），休息日不吃' },
  { time: '17:15', title: '练后', kcal: '热透', desc: '中午那一半热透。周二鲈鱼一条，周五牛肉 240g，其余鸡腿' },
  { time: '21:30', title: '睡前', kcal: '休息日 22:30', desc: '酸奶 200g + 坚果 15g（休息日 12g）+ 南瓜子 10g' },
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
    body: '脂溢性脱发 = 雄激素性脱发。每晚复方司亚旦生发酊 1ml，每天用蜂花生姜洗发露洗头。',
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
    title: '睡眠：整体晚了 3 小时',
    body: '手表实测 02:02 上床、11:12 起床，夜醒 3.9 次，效率 92%。不是入睡难，是整体晚了约 3 小时。',
    items: [
      '先把 11:00 的早饭稳住一周',
      '再每 4 天把起床提前 15–30 分钟',
      '中午以后不喝咖啡',
      '睡前那顿之后只小口喝水',
    ],
    icon: 'sleep',
  },
]

export const KNOWLEDGE = [
  { n: '01', t: '训练体系 · 容量、强度、渐进超负荷', d: 'ACSM 2026' },
  { n: '02', t: '营养与减脂 · 热量、蛋白、餐次', d: 'TDEE' },
  { n: '03', t: '体态矫正 · 圆肩、O 型腿、膝盖', d: '循证' },
  { n: '04', t: '补剂指南 · 肌酸、鱼油、Swisse，蛋白粉已停', d: 'ISSN' },
  { n: '05', t: '男性健康 · 前列腺、脱发、睡眠', d: '临床' },
  { n: '06', t: '谭成义方法论 · 可借鉴与需甄别', d: '来源标注' },
  { n: '07', t: 'Skill 设计规范 · 让 AI 按规则调计划', d: '模板' },
  { n: '08', t: '最新研究更新 · 旧说法 vs 新证据', d: '2025–26' },
]

export const CYCLE = [
  { w: '第 1 周', sets: '每动作 2 组', rir: 'RIR 3–4', note: '校准周：找动作感觉，别冲重量' },
  { w: '第 2 周', sets: '每动作 2–3 组', rir: 'RIR 2–3', note: '逐步加一组，重量不变或微加' },
  { w: '第 3–4 周', sets: '每动作 3 组', rir: 'RIR 1–3', note: '进入正常训练量，开始记录' },
  { w: '第 5 周起', sets: '按部位组数', rir: 'RIR 1–3', note: '双渐进：次数做满再加 2.5 / 5kg' },
]