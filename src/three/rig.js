import * as THREE from 'three'

const DEG = Math.PI / 180

export const MUSCLE_LABEL = {
  pec: '胸大肌',
  lat: '背阔肌',
  delt: '三角肌',
  rearDelt: '三角肌后束',
  bicep: '肱二头肌',
  tricep: '肱三头肌',
  forearm: '前臂',
  trap: '斜方肌',
  quad: '股四头肌',
  ham: '腘绳肌',
  glute: '臀大肌',
  calf: '小腿三头肌',
  abs: '腹直肌',
  core: '核心',
}

/* ---------- 造型辅助 ---------- */

/**
 * 连续曲面扫掠：一圈圈椭圆环（可前后/左右不等宽）沿 Y 轴叠起来，
 * 再叠加「局部隆起」(mods) 做出胸肌、腹肌、背阔、臀、小腿这些体积。
 * 好处是整个人是一张连续的皮，不会出现一块块贴上去的球。
 *
 * rings: [{ y, rx, rz }]，rx = 左右半宽，rz = 前后半厚
 * mods : [{ phi, depth, spread, y, ySpread }]
 *        phi = 0 表示正前方(+Z)，π 表示正后方(-Z)，向左为负
 */
function sweep(rings, mods = [], seg = 36) {
  const pos = []
  const idx = []
  const wrap = (a) => {
    while (a > Math.PI) a -= Math.PI * 2
    while (a < -Math.PI) a += Math.PI * 2
    return a
  }

  const N = rings.length
  for (let i = 0; i < N; i++) {
    const r = rings[i]
    for (let j = 0; j < seg; j++) {
      const phi = (j / seg) * Math.PI * 2 - Math.PI // -π..π
      let x = Math.sin(phi) * r.rx
      let z = Math.cos(phi) * r.rz
      // 隆起
      for (const m of mods) {
        const d = wrap(phi - m.phi)
        const wPhi = Math.exp(-(d * d) / (m.spread * m.spread))
        const dy = r.y - m.y
        const wY = Math.exp(-(dy * dy) / (m.ySpread * m.ySpread))
        const w = wPhi * wY
        if (w > 0.002) {
          x += Math.sin(phi) * m.depth * w
          z += Math.cos(phi) * m.depth * w
        }
      }
      pos.push(x, r.y, z)
    }
  }

  for (let i = 0; i < N - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j
      const b = i * seg + ((j + 1) % seg)
      const c = (i + 1) * seg + j
      const d = (i + 1) * seg + ((j + 1) % seg)
      idx.push(a, c, b, b, c, d)
    }
  }

  // 不封口：两端都会被相邻体块（骨盆/手/脚）盖住，省掉翻边和接缝

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function ellipsoid(rx, ry, rz, mat, pos, rot, seg = 24) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(12, seg - 4)), mat)
  m.scale.set(rx, ry, rz)
  if (pos) m.position.set(pos[0], pos[1], pos[2])
  if (rot) m.rotation.set(rot[0], rot[1], rot[2])
  m.castShadow = true
  return m
}

/* ---------- 人体 ---------- */

export function createFigure(opts = {}) {
  // 暖调哑光瓷白：有体积、不发塑料光
  const skinColor = opts.skinColor ?? 0xded7c8
  const hairColor = opts.hairColor ?? 0x1b1c20

  const matSkin = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.62,
    metalness: 0.03,
    envMapIntensity: 0.5,
    flatShading: false,
  })
  const matHair = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9, metalness: 0.02 })
  // 深色短裤：既是设计，也正好盖住骨盆与躯干、大腿的接缝
  const matKit = new THREE.MeshStandardMaterial({ color: 0x22252b, roughness: 0.78, metalness: 0.06 })
  const matFace = new THREE.MeshStandardMaterial({ color: 0x43464d, roughness: 0.45, metalness: 0.1 })
  // 目标肌群：酸柠绿 + 自发光
  const matHot = new THREE.MeshStandardMaterial({
    color: 0xeaffc9,
    emissive: 0xc6ff3d,
    emissiveIntensity: 0.8,
    roughness: 0.42,
    metalness: 0.04,
  })

  const root = new THREE.Group()
  root.scale.setScalar(1.18) // 骨架按 1.47m 建模，放大到约 175cm
  const pelvis = new THREE.Group()
  pelvis.position.set(0, 0.95, 0)
  root.add(pelvis)

  const joints = {}
  const muscles = {}
  const meshes = []

  function addMesh(m, parent) {
    m.castShadow = true
    parent.add(m)
    meshes.push(m)
    return m
  }
  function addSweep(parent, rings, mods, seg, mat = matSkin) {
    const m = new THREE.Mesh(sweep(rings, mods, seg), mat)
    m.castShadow = true
    parent.add(m)
    meshes.push(m)
    return m
  }

  /** 把网格登记到若干肌群名下；激活时换成高亮材质 */
  function tag(keys, ...ms) {
    ms.flat().forEach((m) => {
      if (!m) return
      m.userData.baseMat = m.material
      keys.forEach((k) => {
        if (!muscles[k]) muscles[k] = []
        muscles[k].push(m)
      })
    })
  }

  /* ---- 骨盆 / 臀 ---- */
  const pelvisMesh = addSweep(
    pelvis,
    [
      { y: -0.105, rx: 0.080, rz: 0.066 },
      { y: -0.085, rx: 0.120, rz: 0.096 },
      { y: -0.055, rx: 0.142, rz: 0.110 },
      { y: -0.020, rx: 0.148, rz: 0.112 },
      { y: 0.020, rx: 0.132, rz: 0.100 },
      { y: 0.060, rx: 0.112, rz: 0.086 },
    ],
    [
      { phi: Math.PI, depth: 0.026, spread: 0.85, y: -0.048, ySpread: 0.045 },
      { phi: -Math.PI * 0.62, depth: 0.012, spread: 0.5, y: -0.05, ySpread: 0.04 },
      { phi: Math.PI * 0.62, depth: 0.012, spread: 0.5, y: -0.05, ySpread: 0.04 },
    ]
  )
  tag(['glute'], pelvisMesh)

  // 短裤（盖住骨盆/躯干的接缝，同时更像运动模特）
  const shortsMesh = addSweep(
    pelvis,
    [
      { y: -0.140, rx: 0.086, rz: 0.072 },
      { y: -0.110, rx: 0.130, rz: 0.104 },
      { y: -0.070, rx: 0.154, rz: 0.120 },
      { y: -0.025, rx: 0.159, rz: 0.122 },
      { y: 0.015, rx: 0.141, rz: 0.108 },
      { y: 0.048, rx: 0.118, rz: 0.092 },
    ],
    [{ phi: Math.PI, depth: 0.022, spread: 0.85, y: -0.052, ySpread: 0.046 }],
    36,
    matKit
  )
  tag(['glute'], shortsMesh)

  /* ---- 躯干 ---- */
  const torso = new THREE.Group()
  joints.torso = torso
  pelvis.add(torso)

  const torsoMesh = addSweep(
    torso,
    [
      { y: -0.050, rx: 0.136, rz: 0.104 },
      { y: 0.000, rx: 0.138, rz: 0.104 },
      { y: 0.040, rx: 0.132, rz: 0.102 },
      { y: 0.090, rx: 0.126, rz: 0.099 },
      { y: 0.140, rx: 0.128, rz: 0.099 },
      { y: 0.190, rx: 0.136, rz: 0.102 },
      { y: 0.240, rx: 0.144, rz: 0.104 },
      { y: 0.285, rx: 0.150, rz: 0.105 },
      { y: 0.325, rx: 0.152, rz: 0.103 },
      { y: 0.365, rx: 0.148, rz: 0.098 },
      { y: 0.400, rx: 0.135, rz: 0.089 },
      { y: 0.428, rx: 0.108, rz: 0.076 },
      { y: 0.445, rx: 0.076, rz: 0.058 },
    ],
    [
      // 胸肌：左右各一片
      { phi: -0.50, depth: 0.016, spread: 0.55, y: 0.292, ySpread: 0.050 },
      { phi: 0.50, depth: 0.016, spread: 0.55, y: 0.292, ySpread: 0.050 },
      // 腹直肌
      { phi: 0.0, depth: 0.005, spread: 0.45, y: 0.150, ySpread: 0.080 },
      // 背阔：两侧外扩
      { phi: -2.10, depth: 0.016, spread: 0.50, y: 0.225, ySpread: 0.090 },
      { phi: 2.10, depth: 0.016, spread: 0.50, y: 0.225, ySpread: 0.090 },
      // 斜方：颈根后侧
      { phi: Math.PI, depth: 0.012, spread: 0.80, y: 0.398, ySpread: 0.045 },
    ]
  )
  // 躯干是一个整体：胸/背/腹/斜方 任一被选中，整块躯干高亮
  tag(['pec', 'lat', 'trap', 'abs', 'core'], torsoMesh)

  /* ---- 颈 + 头 ---- */
  const neck = new THREE.Group()
  neck.position.set(0, 0.432, 0)
  joints.neck = neck
  torso.add(neck)
  // 脖子往上长
  addSweep(
    neck,
    [
      { y: -0.030, rx: 0.062, rz: 0.058 },
      { y: 0.010, rx: 0.052, rz: 0.050 },
      { y: 0.050, rx: 0.047, rz: 0.046 },
      { y: 0.075, rx: 0.046, rz: 0.045 },
    ],
    [],
    24
  )

  const head = new THREE.Group()
  head.position.set(0, 0.075, 0)
  joints.head = head
  neck.add(head)
  // 颅
  addMesh(ellipsoid(0.098, 0.116, 0.105, matSkin, [0, 0.090, 0.009], null, 30), head)
  // 下颌 / 咬肌
  addMesh(ellipsoid(0.071, 0.055, 0.062, matSkin, [0, 0.020, 0.020]), head)
  // 鼻
  addMesh(ellipsoid(0.013, 0.029, 0.022, matSkin, [0, 0.082, 0.104]), head)
  // 眼（做小一点，只留朝向感，不做五官）
  addMesh(ellipsoid(0.010, 0.007, 0.006, matFace, [-0.036, 0.107, 0.099]), head)
  addMesh(ellipsoid(0.010, 0.007, 0.006, matFace, [0.036, 0.107, 0.099]), head)
  // 耳
  addMesh(ellipsoid(0.012, 0.028, 0.019, matSkin, [-0.097, 0.093, 0.002]), head)
  addMesh(ellipsoid(0.012, 0.028, 0.019, matSkin, [0.097, 0.093, 0.002]), head)
  // 头发
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(1, 30, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
    matHair
  )
  hair.scale.set(0.1035, 0.1215, 0.110)
  hair.position.set(0, 0.100, -0.003)
  hair.rotation.x = 0.14
  hair.castShadow = true
  head.add(hair)

  /* ---- 手臂 ---- */
  function buildArm(side, sx) {
    const shoulder = new THREE.Group()
    shoulder.position.set(sx * 0.166, 0.338, 0)
    joints['shoulder' + side] = shoulder
    torso.add(shoulder)

    // 三角肌：一个圆润肩头
    const deltMesh = addMesh(
      ellipsoid(0.061, 0.069, 0.067, matSkin, [sx * 0.004, -0.004, 0]),
      shoulder
    )
    tag(['delt', 'rearDelt'], deltMesh)

    const upperArm = new THREE.Group()
    joints['upperArm' + side] = upperArm
    shoulder.add(upperArm)
    const ua = addSweep(
      upperArm,
      [
        { y: 0.055, rx: 0.058, rz: 0.058 },
        { y: 0.010, rx: 0.056, rz: 0.056 },
        { y: -0.030, rx: 0.054, rz: 0.054 },
        { y: -0.090, rx: 0.052, rz: 0.051 },
        { y: -0.160, rx: 0.048, rz: 0.046 },
        { y: -0.230, rx: 0.043, rz: 0.041 },
        { y: -0.285, rx: 0.040, rz: 0.038 },
      ],
      [
        { phi: 0.0, depth: 0.015, spread: 1.05, y: -0.105, ySpread: 0.065 },
        { phi: Math.PI, depth: 0.010, spread: 1.15, y: -0.120, ySpread: 0.075 },
      ],
      24
    )
    tag(['bicep', 'tricep'], ua)

    const forearm = new THREE.Group()
    forearm.position.set(0, -0.285, 0)
    joints['forearm' + side] = forearm
    upperArm.add(forearm)
    // 肘：补一个球，弯曲时不会露出硬切口
    addMesh(ellipsoid(0.044, 0.044, 0.044, matSkin, [0, 0, 0], null, 20), forearm)
    const fa = addSweep(
      forearm,
      [
        { y: 0.015, rx: 0.046, rz: 0.046 },
        { y: -0.030, rx: 0.047, rz: 0.045 },
        { y: -0.085, rx: 0.044, rz: 0.041 },
        { y: -0.145, rx: 0.038, rz: 0.035 },
        { y: -0.205, rx: 0.032, rz: 0.030 },
        { y: -0.255, rx: 0.028, rz: 0.026 },
      ],
      [{ phi: 0.05, depth: 0.008, spread: 1.0, y: -0.07, ySpread: 0.06 }],
      22
    )
    tag(['forearm'], fa)

    const hand = new THREE.Group()
    hand.position.set(0, -0.255, 0)
    joints['hand' + side] = hand
    forearm.add(hand)
    addMesh(ellipsoid(0.029, 0.048, 0.019, matSkin, [0, -0.038, 0.003]), hand)
    addMesh(ellipsoid(0.020, 0.027, 0.014, matSkin, [sx * 0.024, -0.028, 0.012], [0, 0, sx * 0.5]), hand)
  }
  buildArm('L', -1)
  buildArm('R', 1)

  /* ---- 腿 ---- */
  function buildLeg(side, sx) {
    const hip = new THREE.Group()
    hip.position.set(sx * 0.098, -0.055, 0)
    joints['hip' + side] = hip
    pelvis.add(hip)

    const thigh = new THREE.Group()
    joints['thigh' + side] = thigh
    hip.add(thigh)
    const th = addSweep(
      thigh,
      [
        { y: 0.025, rx: 0.095, rz: 0.096 },
        { y: -0.020, rx: 0.098, rz: 0.099 },
        { y: -0.080, rx: 0.096, rz: 0.097 },
        { y: -0.150, rx: 0.090, rz: 0.091 },
        { y: -0.220, rx: 0.082, rz: 0.085 },
        { y: -0.300, rx: 0.071, rz: 0.075 },
        { y: -0.375, rx: 0.061, rz: 0.064 },
        { y: -0.435, rx: 0.055, rz: 0.056 },
      ],
      [
        { phi: 0.0, depth: 0.016, spread: 1.0, y: -0.15, ySpread: 0.13 },
        { phi: Math.PI, depth: 0.011, spread: 0.9, y: -0.15, ySpread: 0.12 },
      ],
      28
    )
    tag(['quad', 'ham'], th)

    // 裤腿
    const band = addSweep(
      thigh,
      [
        { y: 0.020, rx: 0.107, rz: 0.108 },
        { y: -0.040, rx: 0.108, rz: 0.109 },
        { y: -0.100, rx: 0.105, rz: 0.106 },
        { y: -0.155, rx: 0.100, rz: 0.101 },
      ],
      [],
      28,
      matKit
    )
    tag(['quad', 'ham'], band)

    const shin = new THREE.Group()
    shin.position.set(0, -0.435, 0)
    joints['shin' + side] = shin
    thigh.add(shin)
    // 膝
    addMesh(ellipsoid(0.058, 0.058, 0.058, matSkin, [0, 0, 0], null, 20), shin)
    const sh = addSweep(
      shin,
      [
        { y: 0.020, rx: 0.060, rz: 0.062 },
        { y: -0.030, rx: 0.060, rz: 0.063 },
        { y: -0.090, rx: 0.056, rz: 0.060 },
        { y: -0.160, rx: 0.048, rz: 0.052 },
        { y: -0.240, rx: 0.041, rz: 0.044 },
        { y: -0.330, rx: 0.035, rz: 0.037 },
        { y: -0.415, rx: 0.031, rz: 0.033 },
      ],
      [{ phi: Math.PI, depth: 0.019, spread: 0.85, y: -0.085, ySpread: 0.075 }],
      26
    )
    tag(['calf'], sh)

    const foot = new THREE.Group()
    foot.position.set(0, -0.415, 0)
    joints['foot' + side] = foot
    shin.add(foot)
    addMesh(ellipsoid(0.052, 0.042, 0.105, matSkin, [0, -0.016, 0.040]), foot)
    addMesh(ellipsoid(0.046, 0.040, 0.048, matSkin, [0, -0.008, -0.032]), foot)
    addMesh(ellipsoid(0.048, 0.030, 0.058, matSkin, [0, -0.028, 0.120]), foot)
  }
  buildLeg('L', -1)
  buildLeg('R', 1)

  /* ---------- pose ---------- */

  const pelvisBase = pelvis.position.clone()
  const JOINT_KEYS = Object.keys(joints)

  function resetPose() {
    JOINT_KEYS.forEach((k) => { joints[k].rotation.set(0, 0, 0) })
    pelvis.position.copy(pelvisBase)
    pelvis.rotation.set(0, 0, 0)
  }

  function setPose(pose = {}) {
    resetPose()
    const p = { ...pose }
    // 只给了左侧 → 右侧自动镜像
    for (const k of JOINT_KEYS) {
      if (k.endsWith('R')) {
        const left = k.slice(0, -1) + 'L'
        if (p[k] === undefined && p[left] !== undefined) {
          const v = p[left]
          p[k] = [v[0], -v[1], -v[2]]
        }
      }
    }
    if (p.pelvis) pelvis.rotation.set(p.pelvis[0] * DEG, p.pelvis[1] * DEG, p.pelvis[2] * DEG)
    if (p.pelvisPos) {
      pelvis.position.set(pelvisBase.x + p.pelvisPos[0], pelvisBase.y + p.pelvisPos[1], pelvisBase.z + p.pelvisPos[2])
    }
    for (const k of JOINT_KEYS) {
      const v = p[k]
      if (v) joints[k].rotation.set(v[0] * DEG, v[1] * DEG, v[2] * DEG)
    }
  }

  /** 把人偶「落」到指定高度。
   *  by='lowest'：整个身体最低点对齐 y（躺/趴/撑地动作）
   *  by='feet'  ：只让脚底对齐 y（站立动作，弯腰时不会把整个人顶起来）
   *  by='hands' ：只让双手对齐 y（悬垂、双杠）
   *  by='pelvis'：把髋部固定在 y（坐姿/器械动作，躯干不跟着腿晃）
   */
  const _box = new THREE.Box3()
  const _pv = new THREE.Vector3()
  function groundTo(y = 0.015, by = 'lowest') {
    root.updateMatrixWorld(true)
    if (by === 'pelvis') {
      pelvis.getWorldPosition(_pv)
      root.position.y += y - _pv.y
      return
    }
    _box.makeEmpty()
    if (by === 'feet' || by === 'hands') {
      const list = by === 'feet' ? [joints.footL, joints.footR] : [joints.handL, joints.handR]
      list.forEach((f) => {
        f.traverse((o) => { if (o.isMesh) _box.expandByObject(o) })
      })
    } else {
      root.traverse((o) => {
        if (!o.isMesh || !o.visible) return
        _box.expandByObject(o)
      })
    }
    if (_box.isEmpty()) return
    root.position.y += y - _box.min.y
  }

  const taggedAll = () => {
    const all = new Set()
    Object.values(muscles).forEach((arr) => arr.forEach((m) => all.add(m)))
    return all
  }

  function setMuscles(keys = []) {
    const on = new Set(keys)
    // 先全部复位
    taggedAll().forEach((m) => { m.material = m.userData.baseMat || matSkin })
    // 再点亮目标
    const lit = new Set()
    on.forEach((k) => (muscles[k] || []).forEach((m) => lit.add(m)))
    lit.forEach((m) => { m.material = matHot })
  }

  function dispose() {
    root.traverse((o) => { if (o.geometry) o.geometry.dispose() })
    ;[matSkin, matHair, matFace, matKit, matHot].forEach((m) => m.dispose())
  }

  return { root, joints, muscles, setPose, resetPose, setMuscles, groundTo, dispose, meshes }
}

/** 两个姿态之间线性插值 */
export function lerpPose(a, b, t) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const out = {}
  for (const k of keys) {
    const va = a[k] || [0, 0, 0]
    const vb = b[k] || [0, 0, 0]
    out[k] = [
      va[0] + (vb[0] - va[0]) * t,
      va[1] + (vb[1] - va[1]) * t,
      va[2] + (vb[2] - va[2]) * t,
    ]
  }
  return out
}

export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
