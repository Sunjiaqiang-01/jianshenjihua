import { useEffect, useMemo, useRef, useState } from 'react'
import { DAYS, EXERCISES, byDay } from './data/exercises'
import { PROFILE, MACROS, MEALS, HEALTH, KNOWLEDGE, CYCLE, WARMUP } from './data/plan'
import { ExerciseDemo, MuscleMap } from './components/ExerciseDemo'
import { Icon } from './components/icons'
import { MUSCLE_LABEL } from './data/muscles'

const NAV = [
  { id: 'top', label: '概览' },
  { id: 'training', label: '训练' },
  { id: 'diet', label: '饮食' },
  { id: 'health', label: '身体' },
  { id: 'knowledge', label: '知识库' },
]

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('top')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16)
      const ids = ['training', 'diet', 'health', 'knowledge']
      let cur = 'top'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 160) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'open' : ''}`}>
      <div className="nav-in">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden><span /></span>
          训练档案
        </a>
        <div className="nav-links">
          {NAV.map((n) => (
            <a key={n.id} className={`nav-link ${active === n.id ? 'active' : ''}`} href={`#${n.id}`}>{n.label}</a>
          ))}
        </div>
        <a className="nav-cta" href="#training">开始训练</a>
        <button
          className="nav-burger"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span />
        </button>
      </div>
      {open && (
        <div className="nav-sheet" id="nav-sheet">
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''} onClick={() => setOpen(false)}>
              <span className="i">{String(i + 1).padStart(2, '0')}</span>
              {n.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="dot-live" />
          2026.11 · 方案生效中
        </div>
        <h1 className="hero-title">
          <span className="ht">恢复</span>
          <span className="ht">增肌</span>
          <span className="ht-en">RECLAIM <b>6KG</b></span>
        </h1>
        <p className="hero-sub">
          从 <b>64kg</b> 回到 <b>68–70kg</b>，用 3–4 个月。一天一个部位，
          每个动作都有 3D 解剖演示，发力肌群当场亮起来 —— 照视频练动作，按表练容量。
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
        <div className="hero-actions">
          <a className="btn btn-acid" href="#training">开始训练<Icon.arrow /></a>
          <a className="btn btn-ghost" href="#diet">饮食方案</a>
        </div>
      </div>
      <div className="hero-canvas-wrap">
        <div className="hero-shot">
          <video
            className="demo-video"
            src="/media/sw/bench-press.mp4"
            poster="/media/sw/bench-press.jpg"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label="杠铃卧推 3D 动作演示"
          />
        </div>
        <span className="hero-frame" aria-hidden />
        <div className="hero-side" aria-hidden>BODY / 3D DEMO</div>
        <div className="hero-badge"><i />3D 解剖 · 目标肌群高亮</div>
      </div>
      <div className="hero-scroll" aria-hidden>
        SCROLL
        <span />
      </div>
    </header>
  )
}

function WeekStrip({ activeDay, onPick }) {
  return (
    <section className="section section-week">
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
            const active = activeDay === d.id
            return (
              <button
                key={d.id}
                className={`week-cell ${rest ? 'rest' : ''} ${active ? 'active' : ''}`}
                onClick={() => !rest && onPick(d.id)}
                disabled={rest}
                aria-pressed={active}
                style={{ '--accent': d.accent }}
              >
                <span className="days">{d.day}</span>
                <span className="state">{active ? '当前' : rest ? '恢复' : '训练'}</span>
                <span className="name">{d.name}</span>
                <span className="en">{d.en}</span>
                <span className="sets">{d.sets}</span>
                <span className="bar" />
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
  const panelRef = useRef(null)

  const list = useMemo(() => byDay(day), [day])
  const ex = useMemo(() => EXERCISES.find((e) => e.id === exId) || list[0], [exId, list])

  // 外部（周计划）切天时，自动切到该天第一个动作
  useEffect(() => {
    const first = byDay(day)[0]
    if (first && !byDay(day).some((e) => e.id === exId)) setExId(first.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  const pickDay = (id) => setDay(id)

  // 换动作时重新开始播放
  useEffect(() => {
    setPlaying(true)
  }, [ex])

  const toggle = () => setPlaying((p) => !p)

  // 手机端：3D 面板在上、动作列表在下，点选后把演示滚回视野
  const pickExercise = (id) => {
    setExId(id)
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 900px)').matches) return
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect && rect.top < 60) panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
              <small>保留谭成义跟练的动作风格，补上固定的组数、次数、余力与加重规则。点动作看 3D 解剖示范，发力肌群当场高亮，旁边人体图同步标出。</small>
            </h2>
          </div>
          <div className="section-aside">{list.length} MOVES · {dayMeta?.sets}</div>
        </div>

        <div className="day-tabs reveal" role="tablist" aria-label="训练部位">
          {DAYS.map((d) => {
            const rest = d.id.startsWith('rest')
            return (
              <button
                key={d.id}
                className={`day-tab ${rest ? 'disabled' : ''} ${day === d.id ? 'active' : ''}`}
                onClick={() => !rest && pickDay(d.id)}
                disabled={rest}
                role="tab"
                aria-selected={day === d.id}
                style={{ '--accent': d.accent }}
              >
                <span className="pip" />
                {d.name}
                <span className="en">{d.en}</span>
              </button>
            )
          })}
        </div>

        <div className="training-grid">
          <div className="viewer-panel reveal" ref={panelRef}>
            <div className="viewer-head">
              <div>
                <div className="t" aria-live="polite">{ex.name}</div>
                <div className="s">{ex.en}</div>
              </div>
              <div className="viewer-live"><span className="dot-live" />3D DEMO</div>
            </div>

            <div className="viewer-stage">
              <ExerciseDemo exercise={ex} playing={playing} speed={speed} />
            </div>

            <div className="viewer-foot">
              <div className="viewer-controls">
                <button className="vbtn primary" onClick={toggle} aria-label={playing ? '暂停' : '播放'}>
                  {playing ? <Icon.pause /> : <Icon.play />}
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

          <div className="ex-col">
            <div className="ex-list reveal">
              <div className="ex-list-head">
                <span className="mono">{dayMeta?.en} · {list.length} MOVES</span>
                <span className="mono">SETS</span>
              </div>
              {list.map((e, i) => (
                <button
                  key={e.id}
                  className={`ex-row ${e.id === exId ? 'active' : ''}`}
                  onClick={() => pickExercise(e.id)}
                  aria-pressed={e.id === exId}
                >
                  <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tx">
                    <span className="nm">{e.name}</span>
                    <span className="mu">{e.en}</span>
                  </span>
                  <span className="sr">{e.sets}</span>
                </button>
              ))}
            </div>

            {/* 进阶节奏 */}
            <div className="cycle-block reveal">
              <div className="subhead">
                <span className="section-num">03 / 进阶节奏</span>
                <span className="mono">DOUBLE PROGRESSION</span>
              </div>
              <div className="cycle-grid">
                {CYCLE.map((c, i) => (
                  <div key={c.w} className={`cycle-card ${i === CYCLE.length - 1 ? 'peak' : ''}`}>
                    <span className="w">{c.w}</span>
                    <span className="sets">{c.sets}</span>
                    <span className="rir">{c.rir}</span>
                    <p>{c.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 递增热身 */}
            <div className="cycle-block reveal">
              <div className="subhead">
                <span className="section-num">04 / 正式组前</span>
                <span className="mono">WARM-UP SETS</span>
              </div>
              <p className="warmup-note">
                热身组不算正式组、不计入每周组数。百分比按<strong>今天的正式组重量</strong>算；
                轻组之间休 30–60 秒，最后两组前 1–2 分钟，第一组正式组前 2–3 分钟。
              </p>
              <div className="warmup-list">
                {WARMUP.map((w) => (
                  <div className="warmup-row" key={w.t}>
                    <span className="t">{w.t}</span>
                    <span className="d">{w.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Diet() {
  return (
    <section className="section section-alt" id="diet">
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
            <div className="macro-head">
              <span className="macro-label">Training day / 训练日</span>
              <span className="macro-rest">休息日 {PROFILE.kcalRest} kcal</span>
            </div>
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
            <div className="macro-foot">
              <span className="muscle-chip"><span className="d" />FoYes 乳清 1 勺 = 22.5g 蛋白</span>
              <span className="muscle-chip assist"><span className="d" />不喝米糊</span>
            </div>
          </div>

          <div className="meal-card reveal">
            <div className="meal-head">
              <span className="t">每日时间表</span>
              <span className="mono">MEAL TIMELINE</span>
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
    <section className="section section-alt section-tight" id="knowledge">
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
      <div className="wrap">
        <div className="footer-top">
          <div className="big">练下去，<em>别停</em>。</div>
          <div className="footer-meta">
            更新 2026.11.21<br />
            {PROFILE.phase} · {PROFILE.week}<br />
            js.shaochen.one
          </div>
        </div>
        <div className="footer-credits">
          <span>动作演示：SmartWorkout 健身练习库</span>
          <span>人体肌肉图：MuscleMap © Melih Colpan（MIT）</span>
        </div>
        <div className="footer-bottom">
          <span className="mono">能坚持的计划才是好计划</span>
          <span className="mono">每次记录重量 × 次数 × RIR</span>
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
      <a className="skip" href="#main">跳到主要内容</a>
      <Nav />
      <main id="main">
        <Hero />
        <WeekStrip activeDay={day} onPick={pickFromWeek} />
        <Training day={day} setDay={setDay} />
        <Diet />
        <Health />
        <Knowledge />
      </main>
      <Footer />
    </>
  )
}
