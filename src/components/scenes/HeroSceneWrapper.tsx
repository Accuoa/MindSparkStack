'use client'

import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-obsidian" />,
})

export default function HeroSceneWrapper() {
  return <HeroScene />
}
