import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createFigure, lerpPose, easeInOut } from './rig'

/* ---------- 器械 ---------- */

function makeBarbell(len = 1.35) {
  const g = new THREE.Group()
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.32, metalness: 0.9 })
  const plate = new THREE.MeshStandardMaterial({ color: 0x2b2f34, roughness: 0.6, metalness: 0.35 })
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, len, 12), steel)
  bar.rotation.z = Math.PI / 2
  g.add(bar)
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x8d939a, roughness: 0.9 })
  ;[-0.28, 0, 0.28].forEach((x) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.06, 10), gripMat)
    grip.rotation.z = Math.PI / 2
    grip.position.x = x
    g.add(grip)
  })
  ;[-1, 1].forEach((s) => {
    ;[0, 0.085].forEach((off, i) => {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(i === 0 ? 0.145 : 0.105, i === 0 ? 0.145 : 0.105, 0.038, 24),
        plate
      )
      p.rotation.z = Math.PI / 2
      p.position.x = s * (len / 2 - 0.06 - off)
      g.add(p)
    })
  })
  return g
}

function makeDumbbell() {
  const g = new THREE.Group()
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.35, metalness: 0.9 })
  const headMat = new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.55, metalness: 0.4 })
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.13, 12), steel)
  handle.rotation.z = Math.PI / 2
  g.add(handle)
  ;[-1, 1].forEach((s) => {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.055, 18), headMat)
    h.rotation.z = Math.PI / 2
    h.position.x = s * 0.088
    g.add(h)
  })
  return g
}

function makeBench(incline = false) {
  const g = new THREE.Group()
  const padMat = new THREE.MeshStandardMaterial({ color: 0x1b1e22, roughness: 0.85 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.4, metalness: 0.7 })
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 1.15), padMat)
  pad.position.set(0, 0.45, 0)
  if (incline === 'incline') pad.rotation.x = -0.5
  if (incline === 'seat') {
    pad.position.set(0, 0.45, 0)
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.62), padMat)
    back.position.set(0, 0.72, -0.36)
    back.rotation.x = -0.35
    g.add(back)
  }
  if (incline === 'incline') {
    pad.position.y = 0.62
    pad.position.z = -0.08
  }
  g.add(pad)
  const legMat = frameMat
  ;[-1, 1].forEach((s) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), legMat)
    leg.position.set(s * 0.14, 0.225, 0.44)
    g.add(leg)
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), legMat)
    leg2.position.set(s * 0.14, 0.225, -0.44)
    g.add(leg2)
  })
  return g
}

function makePullupBar(height = 2.1) {
  const g = new THREE.Group()
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.34, metalness: 0.86 })
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 1.5, 14), steel)
  bar.rotation.z = Math.PI / 2
  bar.castShadow = true
  g.add(bar)
  ;[-1, 1].forEach((s) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, height, 12), steel)
    post.position.set(s * 0.62, -height / 2, 0)
    post.castShadow = true
    g.add(post)
  })
  return g
}

function makeParallelBars(height = 1.0) {
  const g = new THREE.Group()
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.34, metalness: 0.86 })
  ;[-1, 1].forEach((s) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 1.2, 12), steel)
    rail.rotation.x = Math.PI / 2
    rail.position.set(s * 0.3, 0, 0)
    rail.castShadow = true
    g.add(rail)
    ;[-1, 1].forEach((f) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, height, 12), steel)
      post.position.set(s * 0.3, -height / 2, f * 0.48)
      post.castShadow = true
      g.add(post)
    })
  })
  return g
}

/* ---------- viewer ---------- */

export function createViewer(container, opts = {}) {
  const scene = new THREE.Scene()
  const W = () => container.clientWidth || 1
  const H = () => container.clientHeight || 1

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W(), H())
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.06
  container.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(34, W() / H(), 0.1, 100)

  /* 环境反射：让金属器械和皮肤都有真实的高光过渡 */
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.06).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.42

  /* lights */
  const hemi = new THREE.HemisphereLight(0xdfe7ff, 0x14161a, 0.85)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xffffff, 2.9)
  key.position.set(2.6, 4.2, 3.4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 12
  key.shadow.camera.left = -3
  key.shadow.camera.right = 3
  key.shadow.camera.top = 4
  key.shadow.camera.bottom = -1
  key.shadow.bias = -0.0012
  scene.add(key)

  const rim = new THREE.DirectionalLight(0xc6ff3d, 1.9)
  rim.position.set(-3.2, 1.6, -2.8)
  scene.add(rim)

  const fill = new THREE.DirectionalLight(0x7cd4ff, 0.62)
  fill.position.set(-1.5, 2.2, 3.0)
  scene.add(fill)

  // 底部补光：托起暗部,让肌肉轮廓不发黑
  const bounce = new THREE.DirectionalLight(0xffe9d0, 0.35)
  bounce.position.set(0.8, -1.6, 1.6)
  scene.add(bounce)

  /* floor: radial shadow catcher */
  const shadowTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 126)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.45, 'rgba(0,0,0,0.22)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })()
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  )
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.y = 0.004
  scene.add(shadowPlane)

  /* figure */
  const figure = createFigure()
  scene.add(figure.root)

  const propGroup = new THREE.Group()
  scene.add(propGroup)

  let barbell = null
  let dumbbellL = null
  let dumbbellR = null
  let benchObj = null
  let frameObj = null

  function clearProps() {
    while (propGroup.children.length) {
      const c = propGroup.children.pop()
      c.traverse?.((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose())
          else o.material.dispose()
        }
      })
    }
  }

  let ex = null
  let playing = true
  let speed = 1
  let phase = 0 // 0..1 cycle
  let camYaw = 0
  let camPitch = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  let autoSpin = true
  let raf = 0
  let disposed = false
  let groundY = [0, 0] // 每个关键帧的地面偏移
  let fitR = 1.0 // 动作包围球半径（自动取景用）
  let fitY = 1.0 // 包围球中心高度

  // 计算某姿态的落地偏移（target = 支撑面高度）
  const measureGround = (pose, target = 0.015, by = 'lowest') => {
    figure.root.position.y = 0
    figure.setPose(pose)
    figure.groundTo(target, by)
    return figure.root.position.y
  }

  // 站立动作按脚落地；躺/趴/悬垂按身体最低点落地
  const isStanding = (exercise) =>
    (exercise.poses || []).every((p) => !p.pelvis || Math.abs(p.pelvis[0]) < 30)

  function setExercise(exercise) {
    ex = exercise
    clearProps()
    barbell = dumbbellL = dumbbellR = benchObj = frameObj = null
    phase = 0
    playing = true

    figure.setMuscles(exercise.muscles || [])

    // 统一自动落地：可被动作自带的 ground 覆盖
    const onBench = exercise.bench === true || exercise.bench === 'incline'
    const conf = exercise.ground || {
      y: onBench ? 0.50 : 0.015,
      by: onBench ? 'lowest' : isStanding(exercise) ? 'feet' : 'lowest',
    }
    groundY = exercise.poses.map((p) => measureGround(p, conf.y, conf.by))
    if (groundY.length === 1) groundY.push(groundY[0])
    figure.root.position.y = groundY[0]
    figure.setPose(exercise.poses[0])
    figure.root.updateMatrixWorld(true)

    // 量出所有关键帧的整体包围盒，用于自动取景（手机竖屏也能装下）
    {
      const box = new THREE.Box3()
      const tmpBox = new THREE.Box3()
      exercise.poses.forEach((p, i) => {
        figure.root.position.y = groundY[i]
        figure.setPose(p)
        figure.root.updateMatrixWorld(true)
        tmpBox.setFromObject(figure.root)
        box.union(tmpBox)
      })
      const sphere = new THREE.Sphere()
      box.getBoundingSphere(sphere)
      fitR = Math.max(sphere.radius, 0.5)
      fitY = sphere.center.y
    }
    figure.root.position.y = groundY[0]
    figure.setPose(exercise.poses[0])
    figure.root.updateMatrixWorld(true)

    if (exercise.bench === true || exercise.bench === 'incline' || exercise.bench === 'seat') {
      benchObj = makeBench(exercise.bench)
      if (exercise.bench === 'seat') benchObj.position.set(0, 0, 0.18)
      propGroup.add(benchObj)
    }

    if (exercise.prop === 'barbell') {
      barbell = makeBarbell(exercise.id === 'rdl' ? 1.5 : 1.35)
      propGroup.add(barbell)
    }
    if (exercise.prop === 'dumbbell' || exercise.prop === 'dumbbellR') {
      dumbbellL = makeDumbbell()
      dumbbellR = makeDumbbell()
      propGroup.add(dumbbellL, dumbbellR)
      dumbbellL.visible = false
      dumbbellR.visible = false
      if (exercise.prop === 'dumbbellR') dumbbellR.userData.solo = true
    }
    if (exercise.prop === 'bar' || exercise.prop === 'bars') {
      // 器械高度对齐第一个姿态的手
      figure.joints.handL.getWorldPosition(tmpV)
      const hy = tmpV.y
      frameObj = exercise.prop === 'bar' ? makePullupBar(hy) : makeParallelBars(hy)
      frameObj.position.set(0, hy, exercise.prop === 'bars' ? 0.04 : 0)
      propGroup.add(frameObj)
    }
  }

  /* hand anchor: attach prop to hand world transform */
  const tmpV = new THREE.Vector3()
  const tmpQ = new THREE.Quaternion()
  const tmpS = new THREE.Vector3()

  function syncProps() {
    figure.root.updateMatrixWorld(true)
    if (barbell) {
      figure.joints.handL.getWorldPosition(tmpV)
      barbell.position.copy(tmpV)
      figure.joints.handL.getWorldQuaternion(tmpQ)
      barbell.quaternion.copy(tmpQ)
      // 杠铃横着穿过双手
      barbell.rotateY(Math.PI / 2)
    }
    if (dumbbellL && dumbbellR) {
      const solo = dumbbellR.userData.solo
      figure.joints.handL.getWorldPosition(tmpV)
      dumbbellL.position.copy(tmpV)
      figure.joints.handL.getWorldQuaternion(tmpQ)
      dumbbellL.quaternion.copy(tmpQ)
      dumbbellL.rotateZ(Math.PI / 2)
      dumbbellL.visible = !solo

      figure.joints.handR.getWorldPosition(tmpV)
      dumbbellR.position.copy(tmpV)
      figure.joints.handR.getWorldQuaternion(tmpQ)
      dumbbellR.quaternion.copy(tmpQ)
      dumbbellR.rotateZ(-Math.PI / 2)
      dumbbellR.visible = true
    }
  }

  function applyPhase() {
    if (!ex) return
    const poses = ex.poses
    if (poses.length === 1) {
      figure.setPose(poses[0])
      figure.root.position.y = groundY[0]
      return
    }
    // ping-pong: 0..1..0 over the cycle
    const t = phase < 0.5 ? phase * 2 : (1 - phase) * 2
    const e = easeInOut(t)
    figure.setPose(lerpPose(poses[0], poses[1], e))
    figure.root.position.y = groundY[0] + (groundY[1] - groundY[0]) * e
  }

  /* drag to orbit */
  const el = renderer.domElement
  function onDown(e) {
    dragging = true
    autoSpin = false
    const p = e.touches ? e.touches[0] : e
    lastX = p.clientX
    lastY = p.clientY
  }
  function onMove(e) {
    if (!dragging) return
    const p = e.touches ? e.touches[0] : e
    camYaw += (p.clientX - lastX) * 0.008
    camPitch += (p.clientY - lastY) * 0.004
    camPitch = Math.max(-0.45, Math.min(0.5, camPitch))
    lastX = p.clientX
    lastY = p.clientY
    if (e.cancelable) e.preventDefault()
  }
  function onUp() { dragging = false }

  el.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  el.addEventListener('touchstart', onDown, { passive: true })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onUp)

  const clock = { last: performance.now(), elapsed: 0 }
  const camTargetVec = new THREE.Vector3()
  const offset = new THREE.Vector3()

  function loop() {
    if (disposed) return
    raf = requestAnimationFrame(loop)
    const now = performance.now()
    const dt = Math.min((now - clock.last) / 1000, 0.05)
    clock.last = now
    clock.elapsed += dt

    if (playing) phase = (phase + dt * 0.30 * speed) % 1
    applyPhase()
    syncProps()

    // camera base
    if (ex) {
      const [tx, , tz] = ex.target || [0, 0.95, 0]
      const [cx, cy, cz] = ex.cam || [2.2, 1.4, 2.0]
      // 对准整个动作的包围球中心
      camTargetVec.set(tx, fitY, tz)
      // 方向沿用动作自带的机位，但距离按画布比例自动算，保证不裁切
      offset.set(cx - (ex.target?.[0] ?? 0), cy - (ex.target?.[1] ?? 0.95), cz - (ex.target?.[2] ?? 0))
      if (offset.lengthSq() < 1e-6) offset.set(1.6, 0.45, 1.6)
      offset.normalize()
      const vHalf = (camera.fov * Math.PI) / 360
      const hHalf = Math.atan(Math.tan(vHalf) * (W() / H()))
      const half = Math.max(0.12, Math.min(vHalf, hHalf))
      const dist = (fitR / Math.sin(half)) * 1.08
      offset.multiplyScalar(dist)
      // yaw rotation
      const yaw = camYaw + (autoSpin ? Math.sin(clock.elapsed * 0.18) * 0.16 : 0)
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      const off = offset.clone().applyQuaternion(q)
      off.y += camPitch * dist * 0.9
      camera.position.copy(camTargetVec).add(off)
      camera.lookAt(camTargetVec)
    }

    renderer.render(scene, camera)
  }

  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H())
    camera.aspect = W() / H()
    camera.updateProjectionMatrix()
  })
  ro.observe(container)

  loop()

  return {
    setExercise,
    play() { playing = true },
    pause() { playing = false },
    toggle() { playing = !playing; return playing },
    isPlaying() { return playing },
    setSpeed(v) { speed = v },
    resetView() { camYaw = 0; camPitch = 0; autoSpin = true },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onUp)
      clearProps()
      figure.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      if (el.parentElement) el.parentElement.removeChild(el)
    },
  }
}