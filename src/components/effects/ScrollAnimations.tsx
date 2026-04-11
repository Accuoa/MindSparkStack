'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── HERO LOAD SEQUENCE ──
      gsap.to('.initial-fade', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2,
        clearProps: 'all',
      })

      gsap.to('.hero-line', {
        y: '0%',
        duration: 1.4,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.1,
      })

      // ── NAV THEME SWITCHING ──
      ScrollTrigger.create({
        trigger: '#light-zone',
        start: 'top 80px',
        onEnter: () => {
          const pill = document.getElementById('nav-pill')
          pill?.classList.remove('theme-dark')
          pill?.classList.add('theme-light')
        },
        onLeaveBack: () => {
          const pill = document.getElementById('nav-pill')
          pill?.classList.remove('theme-light')
          pill?.classList.add('theme-dark')
        },
      })

      ScrollTrigger.create({
        trigger: '#final-dark',
        start: 'top 80px',
        onEnter: () => {
          const pill = document.getElementById('nav-pill')
          pill?.classList.remove('theme-light')
          pill?.classList.add('theme-dark')
        },
        onLeaveBack: () => {
          const pill = document.getElementById('nav-pill')
          pill?.classList.remove('theme-dark')
          pill?.classList.add('theme-light')
        },
      })

      // ── SCROLL REVEALS ──
      gsap.utils.toArray<HTMLElement>('.reveal-fold').forEach((panel) => {
        gsap.from(panel, {
          scrollTrigger: { trigger: panel, start: 'top 90%' },
          y: 50,
          opacity: 0,
          scale: 0.98,
          rotationX: 2,
          transformPerspective: 1000,
          duration: 1.2,
          ease: 'power3.out',
        })
      })

      // ── MOUSE PARALLAX ──
      let targetX = window.innerWidth / 2
      let targetY = window.innerHeight / 2
      let currentX = targetX
      let currentY = targetY

      const onMouseMove = (e: MouseEvent) => {
        targetX = e.clientX
        targetY = e.clientY
      }
      document.addEventListener('mousemove', onMouseMove)

      function animateParallax() {
        currentX += (targetX - currentX) * 0.1
        currentY += (targetY - currentY) * 0.1
        const cx = currentX - window.innerWidth / 2
        const cy = currentY - window.innerHeight / 2
        gsap.set('.parallax-layer', { x: cx * 0.02, y: cy * 0.02 })
        requestAnimationFrame(animateParallax)
      }
      animateParallax()

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
      }
    })

    return () => ctx.revert()
  }, [])

  return null
}
