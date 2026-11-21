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

/* ---------- geometry helpers ---------- */

function segMesh(len, rTop, rBot, mat, radial = 16) {
  const g = new THREE.Group()
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, radial, 1), mat)
  cyl.position.y = -len / 2
  cyl.castShadow = true
  g.add(cyl)
  const sTop = new THREE.Mesh(new THREE.SphereGeometry(rTop, radial, 10), mat)
  sTop.castShadow = true
  g.add(sTop)
  const sBot = new THREE.Mesh(new THREE.SphereGeometry(rBot, radial, 10), mat)
  sBot.position.y = -len
  sBot.castShadow = true
  g.add(sBot)
  return g
}

function ellipsoid(rx, ry, rz, mat, pos, rot, seg = 20) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg), mat)
  m.scale.set(rx, ry, rz)
  if (pos) m.position.set(pos[0], pos[1], pos[2])
  if (rot) m.rotation.set(rot[0], rot[1], rot[2])
  m.castShadow = true
  return m
}

/* ---------- figure ---------- */

export function createFigure(opts = {}) {
  const boneColor = opts.boneColor ?? 0xe9e5dc
  const jointColor = opts.jointColor ?? 0x878d94

  const matBone = new THREE.MeshStandardMaterial({ color: boneColor, roughness: 0.82, metalness: 0.06 })
  const matJoint = new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.5, metalness: 0.4 })
  const matHair = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.92, metalness: 0.02 })
  // 高亮材质：目标肌群变酸柠绿并微微自发光
  const matHot = new THREE.MeshStandardMaterial({
    color: 0xf2ffd6,
    emissive: 0xc6ff3d,
    emissiveIntensity: 0.62,
    roughness: 0.5,
    metalness: 0.05,
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

  /* ---- pelvis / glutes ---- */
  const pelvisMesh = addMesh(ellipsoid(0.152, 0.125, 0.112, matBone, [0, -0.015, 0]), pelvis)
  tag(['glute'], pelvisMesh)
  const gluteL = addMesh(ellipsoid(0.078, 0.082, 0.07, matBone, [-0.062, -0.03, -0.06]), pelvis)
  const gluteR = addMesh(ellipsoid(0.078, 0.082, 0.07, matBone, [0.062, -0.03, -0.06]), pelvis)
  tag(['glute'], gluteL, gluteR)

  /* ---- torso ---- */
  const torso = new THREE.Group()
  joints.torso = torso
  pelvis.add(torso)

  const profile = [
    [0.128, 0.0], [0.138, 0.06], [0.152, 0.14], [0.168, 0.23],
    [0.176, 0.31], [0.172, 0.37], [0.155, 0.415], [0.10, 0.445],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const torsoMesh = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), matBone)
  torsoMesh.scale.z = 0.74
  torsoMesh.castShadow = true
  torso.add(torsoMesh)
  meshes.push(torsoMesh)
  // 躯干是一个整体：胸/背/腹/斜方 任一被选中，整块躯干高亮
  tag(['pec', 'lat', 'trap', 'abs', 'core'], torsoMesh)

  /* ---- neck + head ---- */
  const neck = new THREE.Group()
  neck.position.set(0, 0.425, 0)
  joints.neck = neck
  torso.add(neck)
  addMesh(segMesh(0.075, 0.045, 0.052, matBone), neck)

  const head = new THREE.Group()
  head.position.set(0, -0.075, 0)
  joints.head = head
  neck.add(head)
  addMesh(ellipsoid(0.092, 0.108, 0.098, matBone, [0, -0.075, 0.008]), head)
  addMesh(ellipsoid(0.062, 0.048, 0.055, matBone, [0, -0.128, 0.022]), head) // 下颌
  // 朝向提示：鼻梁 + 眉骨
  addMesh(ellipsoid(0.014, 0.030, 0.022, matJoint, [0, -0.082, 0.094]), head)
  addMesh(ellipsoid(0.060, 0.010, 0.016, matJoint, [0, -0.046, 0.090]), head)
  // 头发
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    matHair
  )
  hair.scale.set(0.0975, 0.111, 0.103)
  hair.position.set(0, -0.068, -0.004)
  hair.rotation.x = -0.14
  hair.castShadow = true
  head.add(hair)

  /* ---- arms ---- */
  function buildArm(side, sx) {
    const shoulder = new THREE.Group()
    shoulder.position.set(sx * 0.178, 0.335, 0)
    joints['shoulder' + side] = shoulder
    torso.add(shoulder)

    const deltMesh = addMesh(ellipsoid(0.064, 0.072, 0.070, matBone, [sx * 0.008, 0.006, 0]), shoulder)
    tag(['delt', 'rearDelt'], deltMesh)

    const upperArm = new THREE.Group()
    joints['upperArm' + side] = upperArm
    shoulder.add(upperArm)
    const ua = segMesh(0.285, 0.055, 0.045, matBone)
    ua.children.forEach((c) => { c.castShadow = true })
    upperArm.add(ua)
    tag(['bicep', 'tricep'], ua.children)

    const forearm = new THREE.Group()
    forearm.position.set(0, -0.285, 0)
    joints['forearm' + side] = forearm
    upperArm.add(forearm)
    addMesh(ellipsoid(0.048, 0.05, 0.048, matJoint, [0, 0, 0]), forearm)
    const fa = segMesh(0.255, 0.046, 0.034, matBone)
    fa.children.forEach((c) => { c.castShadow = true })
    forearm.add(fa)
    tag(['forearm'], fa.children)

    const hand = new THREE.Group()
    hand.position.set(0, -0.255, 0)
    joints['hand' + side] = hand
    forearm.add(hand)
    addMesh(ellipsoid(0.038, 0.060, 0.022, matBone, [0, -0.045, 0]), hand)
  }
  buildArm('L', -1)
  buildArm('R', 1)

  /* ---- legs ---- */
  function buildLeg(side, sx) {
    const hip = new THREE.Group()
    hip.position.set(sx * 0.098, -0.055, 0)
    joints['hip' + side] = hip
    pelvis.add(hip)
    addMesh(ellipsoid(0.070, 0.070, 0.070, matJoint, [0, 0, 0]), hip)

    const thigh = new THREE.Group()
    joints['thigh' + side] = thigh
    hip.add(thigh)
    const th = segMesh(0.435, 0.088, 0.058, matBone)
    th.children.forEach((c) => { c.castShadow = true })
    thigh.add(th)
    tag(['quad', 'ham'], th.children)

    const shin = new THREE.Group()
    shin.position.set(0, -0.435, 0)
    joints['shin' + side] = shin
    thigh.add(shin)
    addMesh(ellipsoid(0.058, 0.060, 0.058, matJoint, [0, 0, 0]), shin)
    const sh = segMesh(0.415, 0.058, 0.036, matBone)
    sh.children.forEach((c) => { c.castShadow = true })
    shin.add(sh)
    tag(['calf'], sh.children)

    const foot = new THREE.Group()
    foot.position.set(0, -0.415, 0)
    joints['foot' + side] = foot
    shin.add(foot)
    addMesh(ellipsoid(0.052, 0.038, 0.115, matBone, [0, -0.012, 0.048]), foot)
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
    taggedAll().forEach((m) => { m.material = m.userData.baseMat || matBone })
    // 再点亮目标
    const lit = new Set()
    on.forEach((k) => (muscles[k] || []).forEach((m) => lit.add(m)))
    lit.forEach((m) => { m.material = matHot })
  }

  function dispose() {
    root.traverse((o) => { if (o.geometry) o.geometry.dispose() })
    ;[matBone, matJoint, matHair, matHot].forEach((m) => m.dispose())
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