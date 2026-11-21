import { useEffect, useRef } from 'react'
import { createViewer } from '../three/viewer'

/**
 * 3D 舞台：挂载即创建 viewer，切换 exercise 时重建场景道具
 */
export function Stage({ exercise, className = 'viewer', onReady, controls = true, speed = 1 }) {
  const hostRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const v = createViewer(host)
    viewerRef.current = v
    onReady?.(v)
    return () => { v.dispose(); viewerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    viewerRef.current?.setSpeed(speed)
  }, [speed])

  return <div ref={hostRef} className={className} />
}