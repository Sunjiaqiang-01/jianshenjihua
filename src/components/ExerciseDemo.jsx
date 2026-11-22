import { useEffect, useRef } from 'react'
import frontSvg from '../assets/muscle-front.svg?raw'
import backSvg from '../assets/muscle-back.svg?raw'
import { demoFor } from '../data/media'
import { MUSCLE_LABEL } from '../data/muscles'

/** 正 / 背两面人体肌肉图，命中的肌群高亮 */
export function MuscleMap({ muscles = [], className = '' }) {
  const cls = muscles.map((m) => `hl-${m}`).join(' ')
  return (
    <div className={`mm ${cls} ${className}`} aria-hidden>
      <div className="mm-part" dangerouslySetInnerHTML={{ __html: frontSvg }} />
      <div className="mm-part" dangerouslySetInnerHTML={{ __html: backSvg }} />
    </div>
  )
}

/**
 * 3D 解剖动作示范：6 秒循环视频，目标肌群在动作里自身高亮。
 * 播放 / 暂停 / 倍速 全部落到 video 元素上。
 */
export function ExerciseDemo({ exercise, playing = true, speed = 1 }) {
  const videoRef = useRef(null)
  const demo = demoFor(exercise)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = speed
    if (playing) {
      const p = v.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } else {
      v.pause()
    }
  }, [playing, speed, exercise.id])

  return (
    <div className="demo">
      <div className="demo-media">
        <video
          key={exercise.id}
          ref={videoRef}
          className="demo-video"
          src={demo.video}
          poster={demo.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={`${exercise.name} 3D 动作演示`}
        />
        <span className="demo-badge">
          <i />3D 解剖 · 发力肌群高亮
        </span>
      </div>

      <div className="demo-side">
        <MuscleMap muscles={exercise.muscles} />
        <div className="demo-side-info">
          <div className="demo-side-label">目标肌群</div>
          <div className="demo-side-list">
            {exercise.muscles.map((m) => (
              <span key={m}>{MUSCLE_LABEL[m] || m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
