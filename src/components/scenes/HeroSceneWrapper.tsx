'use client'

import dynamic from 'next/dynamic'
import { Component, type ReactNode } from 'react'

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-obsidian" />,
})

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 bg-obsidian" />
    }
    return this.props.children
  }
}

export default function HeroSceneWrapper() {
  return (
    <SceneErrorBoundary>
      <HeroScene />
    </SceneErrorBoundary>
  )
}
