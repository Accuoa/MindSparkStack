'use client'

import { useEffect, useRef, useCallback } from 'react'

export function useMousePosition(smoothing = 0.1) {
  const position = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)

  const onMove = useCallback((e: MouseEvent) => {
    target.current.x = e.clientX - window.innerWidth / 2
    target.current.y = e.clientY - window.innerHeight / 2
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMove)

    function loop() {
      position.current.x += (target.current.x - position.current.x) * smoothing
      position.current.y += (target.current.y - position.current.y) * smoothing
      rafId.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [onMove, smoothing])

  return position
}
