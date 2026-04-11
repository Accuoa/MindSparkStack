'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'

function Icosahedron() {
  const meshRef = useRef<THREE.Mesh>(null)
  const mouse = useMousePosition(0.1)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    // Slow auto-rotation
    meshRef.current.rotation.y += 0.001
    meshRef.current.rotation.x += 0.0005

    // Breathing Z oscillation
    meshRef.current.position.z = Math.sin(t) * 0.4

    // Subtle mouse-tracking rotation
    meshRef.current.rotation.y += mouse.current.x * 0.00001
    meshRef.current.rotation.x += mouse.current.y * 0.00001
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[3, 1]} />
      <meshBasicMaterial
        color="#00D0FF"
        wireframe
        transparent
        opacity={0.03}
      />
    </mesh>
  )
}

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = 200

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.001
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.001
    }
    return { positions: pos, velocities: vel }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      positions[i * 3] += velocities[i * 3]
      positions[i * 3 + 1] += velocities[i * 3 + 1]
      positions[i * 3 + 2] += velocities[i * 3 + 2]

      // Wrap around
      if (positions[i * 3 + 1] > 15) positions[i * 3 + 1] = -15

      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      )
      const scale = 0.02 + Math.random() * 0.01
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#D4FF00" transparent opacity={0.3} />
    </instancedMesh>
  )
}

function GridPlane() {
  const ref = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: { value: new THREE.Color('#00D0FF') },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDist;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vDist = -mvPos.z;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec2 vUv;
        varying float vDist;
        void main() {
          vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5);
          float line = min(grid.x, grid.y);
          float mask = 1.0 - smoothstep(0.0, 0.05, line);
          float fade = smoothstep(0.0, 15.0, vDist);
          float alpha = mask * 0.08 * (1.0 - fade);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    })
  }, [])

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} material={material}>
      <planeGeometry args={[60, 60, 1, 1]} />
    </mesh>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 1.5]}
      camera={{ position: [4, 0, 7], fov: 75, near: 0.1, far: 1000 }}
      style={{ width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={['#04070D', 0, 30]} />
      <Icosahedron />
      <ParticleField />
      <GridPlane />
    </Canvas>
  )
}
