import { useEffect, useMemo, useRef, useState } from 'react'
import { DAYS, EXERCISES, byDay } from './data/exercises'
import { PROFILE, MACROS, MEALS, HEALTH, KNOWLEDGE, CYCLE } from './data/plan'
import { Stage } from './components/Stage'
import { Icon } from './components/icons'
import { MUSCLE_LABEL } from './three/rig'

const HERO_EX = {
  id: 'hero',
  muscles: [],
  poses: [
    { upperArmL: [-6, 0, -13], forearmL: [-16, 0, 0], torso: [1, 0, 0], thighL: [0, 0, -3], shinL: [3, 0, 0] },
    { upperArmL: [-9, 0, -15], forearmL: [-13, 0, 0], torso: [-1, 0, 0], thighL: [0, 0, -3], shinL: [2, 0, 0] },
  ],
  cam: [2.2, 1.35, 2.5],
  target: [0, 1.0, 0],
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('top')
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const ids = ['training', 'diet', 'health', 'knowledge']
      let cur = 'top'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 140) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-in">
        <a href="#top" className="brand">
          <span className="brand-mark"><span /></span>
          训练档案
        </a>
        <div className="nav-links">
          <a className={`nav-link ${active === 'top' ? 'active' : ''}`} href="#top">概览</a>
          <a className={`nav-link ${active === 'training' ? 'active' : ''}`} href="#training">训练</a>
          <a className={`nav-link ${active === 'diet' ? 'active' : ''}`} href="#diet">饮食</a>
          <a className={`nav-link ${active === 'health' ? 'active' : ''}`} href="#health">身体</a>
          <a className={`nav-link ${active === 'knowledge' ? 'active' : ''}`} href="#knowledge">知识库</a>
        </div>
        <a className="nav-cta" href="#training">开始训练</a>
      </div>
    </nav>
  )
}

function Hero() {
  const [viewer, setViewer] = useState(null)
  useEffect(() => {
    if (!viewer) return
    viewer.setExercise(HERO_EX)
    viewer.play()
  }, [viewer])
  return (
    <header className="hero" id="top">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="dot-live" />
          2026.11 · 方案生效中
        </div>
        <h1>
          恢复<br />增肌<em>RECLAIM 6KG</em>
        </h1>
        <p className="hero-sub">
          从 <b>64kg</b> 回到 <b>68–70kg</b>，用 3–4 个月。一天一个部位，
          每个动作都有 3D 演示 —— 照视频练动作，按表练容量。
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="v">{PROFILE.weight}<small>kg</small></div>
            <div className="k">当前体重</div>
          </div>
          <div className="hero-stat">
            <div className="v">{PROFILE.targetLow}<small>–</small>{PROFILE.targetHigh}<small>kg</small></div>
            <div className="k">目标区间</div>
          </div>
          <div className="hero-stat">
            <div className="v">{PROFILE.kcalTrain}<small>kcal</small></div>
            <div className="k">训练日热量</div>
          </div>
          <div className="hero-stat">
            <div className="v">{PROFILE.protein}</div>
            <div className="k">每日蛋白</div>
          </div>
        </div>
      </div>
      <div className="hero-canvas-wrap">
        <Stage exercise={HERO_EX} className="hero-canvas" onReady={setViewer} />
        <div className="hero-badge"><i />拖动旋转 · 3D 模型</div>
      </div>
      <div className="hero-scroll">
        SCROLL
        <span />
      </div>
    </header>
  )
}

function WeekStrip({ activeDay, onPick }) {
  return (
    <section className="section" style={{ padding: '88px 0 0' }}>
    <div className="wrap">
      <div className="section-head reveal">
        <div className="section-head-left">
          <span className="section-num">01 / 周计划</span>
          <h2 className="section-title">
            一周七天
            <small>5 练 2 休。不必严格按星期几，按「练 2 休 1、练 3 休 1」循环即可，关键是每个部位练到、组数达标。</small>
          </h2>
        </div>
        <div className="section-aside">5 SESSIONS / WEEK<br />15:00–17:00</div>
      </div>
      <div className="week reveal">
        {DAYS.map((d) => {
          const rest = d.id.startsWith('rest')
          return (
            <button
              key={d.id}
              className={`week-cell ${rest ? 'rest' : ''} ${activeDay === d.id ? 'active' : ''}`}
              onClick={() => !rest && onPick(d.id)}
              style={activeDay === d.id ? { '--acid': d.accent } : undefined}
            >
              <span className="days">{d.day}</span>
              <span className="name" style={{ color: rest ? 'var(--fg-3)' : undefined }}>{d.name}</span>
              <span className="sets">{d.en} · {d.sets}</span>
              <span className="bar" style={{ background: d.accent }} />
            </button>
          )
        })}
      </div>
    </div>
    </section>
  )
}

function Training({ day, setDay }) {
  const [exId, setExId] = useState(EXERCISES.find((e) => e.day === 'chest').id)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(true)
  const [viewer, setViewer] = useState(null)

  const list = useMemo(() => byDay(day), [day])
  const ex = useMemo(() => EXERCISES.find((e) => e.id === exId) || list[0], [exId, list])

  // 外部（周计划）切天时，自动切到该天第一个动作
  useEffect(() => {
    const first = byDay(day)[0]
    if (first && !byDay(day).some((e) => e.id === exId)) setExId(first.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  const pickDay = (id) => setDay(id)

  useEffect(() => {
    if (!viewer) return
    viewer.setExercise(ex)
    viewer.setSpeed(speed)
    setPlaying(true)
    viewer.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, ex])

  useEffect(() => { viewer?.setSpeed(speed) }, [speed, viewer])

  const toggle = () => {
    if (!viewer) return
    const p = viewer.toggle()
    setPlaying(p)
  }

  const dayMeta = DAYS.find((d) => d.id === day)

  return (
    <section className="section" id="training">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="section-num">02 / 训练动作</span>
            <h2 className="section-title">
              一天一个部位
              <small>保留谭成义跟练的动作风格，补上固定的组数、次数、余力与加重规则。点动作看 3D 演示。</small>
            </h2>
          </div>
          <div className="section-aside">{list.length} MOVES · {dayMeta?.sets}</div>
        </div>

        <div className="day-tabs reveal">
          {DAYS.map((d) => {
            const rest = d.id.startsWith('rest')
            return (
              <button
                key={d.id}
                className={`day-tab ${rest ? 'disabled' : ''} ${day === d.id ? 'active' : ''}`}
                onClick={() => !rest && pickDay(d.id)}
              >
                <span className="pip" style={{ background: rest ? 'var(--fg-3)' : d.accent }} />
                {d.name}
                <span className="en">{d.en}</span>
              </button>
            )
          })}
        </div>

        <div className="training-grid">
          <div className="ex-list reveal">
            {list.map((e, i) => (
              <button key={e.id} className={`ex-row ${e.id === exId ? 'active' : ''}`} onClick={() => setExId(e.id)}>
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="nm">{e.name}</span>
                  <span className="mu">{e.en}</span>
                </span>
                <span className="sr">{e.sets}</span>
              </button>
            ))}
          </div>

          <div className="viewer-panel reveal">
            <div className="viewer-head">
              <div>
                <div className="t">{ex.name}</div>
                <div className="s">{ex.en}</div>
              </div>
              <div className="viewer-live"><span className="dot-live" />3D DEMO</div>
            </div>

            <div style={{ position: 'relative' }}>
              <div className="viewer-tag">拖动旋转 · <b>俯仰/环绕</b></div>
              <Stage exercise={ex} className="viewer" onReady={setViewer} />
            </div>

            <div className="viewer-foot">
              <div className="viewer-controls">
                <button className="vbtn primary" onClick={toggle} aria-label={playing ? '暂停' : '播放'}>
                  {playing ? <Icon.pause /> : <Icon.play />}
                </button>
                <button className="vbtn" onClick={() => viewer?.resetView()} aria-label="重置视角">
                  <Icon.reset />
                </button>
                <div className="speed-pills">
                  {[0.5, 1, 1.5].map((s) => (
                    <button key={s} className={`speed-pill ${speed === s ? 'on' : ''}`} onClick={() => setSpeed(s)}>
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              <div className="muscle-chips">
                {ex.muscles.map((m) => (
                  <span key={m} className="muscle-chip"><span className="d" />{MUSCLE_LABEL[m] || m}</span>
                ))}
                {ex.assist && ex.assist !== '—' && (
                  <span className="muscle-chip assist"><span className="d" />辅助：{ex.assist}</span>
                )}
              </div>

              <div className="meta-row">
                <div className="meta-cell"><div className="k">组 × 次</div><div className="v">{ex.sets}</div></div>
                <div className="meta-cell"><div className="k">余力</div><div className="v">{ex.rir}</div></div>
                <div className="meta-cell"><div className="k">组间休息</div><div className="v">{ex.rest}</div></div>
              </div>

              <div className="cue-list">
                {ex.cues.map((c, i) => (
                  <div className="cue-item" key={i}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 进阶节奏 */}
        <div className="reveal" style={{ marginTop: 56 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span className="section-num">03 / 进阶节奏</span>
            <span className="mono" style={{ color: 'var(--fg-3)' }}>DOUBLE PROGRESSION</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }} className="cycle-grid">
            {CYCLE.map((c, i) => (
              <div key={c.w} style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: '22px 20px' }}>
                <div className="mono" style={{ color: i === 3 ? 'var(--acid)' : 'var(--fg-3)' }}>{c.w}</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', marginTop: 10 }}>{c.sets}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>{c.rir}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 12, lineHeight: 1.55 }}>{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Diet() {
  return (
    <section className="section" id="diet">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="section-num">04 / 饮食</span>
            <h2 className="section-title">
              固定五餐，不做选择
              <small>训练日约 2600 kcal，休息日约 2450–2500 kcal。空腹称重看 7 天平均，涨太快就减 100–150 kcal。</small>
            </h2>
          </div>
          <div className="section-aside">2600 KCAL · 145G PROTEIN</div>
        </div>

        <div className="diet-grid">
          <div className="macro-card reveal">
            <div className="macro-label">Training day / 训练日</div>
            <div className="macro-big">{PROFILE.kcalTrain}<small>kcal</small></div>
            <div className="macro-bars">
              {MACROS.map((m) => (
                <div className="macro-bar" key={m.name}>
                  <div className="top">
                    <span className="nm">{m.name}</span>
                    <span className="vl">{m.value} · {m.note}</span>
                  </div>
                  <div className="track">
                    <div className="fill" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="muscle-chip"><span className="d" />FoYes 乳清 1 勺 = 22.5g 蛋白</span>
              <span className="muscle-chip assist"><span className="d" />不喝米糊</span>
            </div>
          </div>

          <div className="meal-card reveal">
            <div className="meal-head">
              <span className="t">每日时间表</span>
              <span className="mono" style={{ color: 'var(--fg-3)' }}>MEAL TIMELINE</span>
            </div>
            <div className="meal-list">
              {MEALS.map((m) => (
                <div className="meal-row" key={m.time}>
                  <span className="tm">{m.time}</span>
                  <span className="what"><b>{m.title}</b> · {m.desc}</span>
                  <span className="kcal">{m.kcal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Health() {
  return (
    <section className="section" id="health">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="section-num">05 / 身体与恢复</span>
            <h2 className="section-title">
              三件不能马虎的事
              <small>膝盖决定你还能练多久，头皮决定你要不要复诊，睡眠决定你练得动不动。</small>
            </h2>
          </div>
          <div className="section-aside">RECOVERY FIRST</div>
        </div>
        <div className="health-grid">
          {HEALTH.map((h) => {
            const I = Icon[h.icon]
            return (
              <div className={`health-card ${h.cls} reveal`} key={h.id}>
                <span className="tag">{h.tag}</span>
                <div className="ico"><I /></div>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
                <ul>{h.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Knowledge() {
  return (
    <section className="section" id="knowledge" style={{ paddingBottom: 40 }}>
      <div className="wrap">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="section-num">06 / 知识库</span>
            <h2 className="section-title">
              调整方案前，先查这里
              <small>8 份主题文件，证据分级 A/B/C/D。新证据优先于旧文档，你的实际情况优先于通用建议。</small>
            </h2>
          </div>
          <div className="section-aside">LOCAL / MARKDOWN</div>
        </div>
        <div className="kb-list reveal">
          {KNOWLEDGE.map((k) => (
            <div className="kb-item" key={k.n}>
              <span className="n">{k.n}</span>
              <span className="t">{k.t}</span>
              <span className="d">{k.d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div>
          <div className="big">练下去，<em>别停</em>。</div>
          <div className="mono" style={{ marginTop: 18, color: 'var(--fg-3)' }}>
            能坚持的计划才是好计划 · 每次记录重量 × 次数 × RIR
          </div>
        </div>
        <div className="footer-meta">
          更新 2026.11.21<br />
          {PROFILE.phase} · {PROFILE.week}<br />
          js.shaochen.one
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()
  const [day, setDay] = useState('chest')
  const pickFromWeek = (id) => {
    setDay(id)
    document.getElementById('training')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Nav />
      <Hero />
      <WeekStrip activeDay={day} onPick={pickFromWeek} />
      <Training day={day} setDay={setDay} />
      <Diet />
      <Health />
      <Knowledge />
      <Footer />
    </>
  )
}