import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export const BASE_ZOOM = 26
export const BASE_HEIGHT = 11.5
export const ZOOM_STEP = 1.2
export const MIN_ZOOM = 18
export const MAX_ZOOM = 40
export const BASE_PITCH = Math.asin(BASE_HEIGHT / BASE_ZOOM)
export const MIN_PITCH = 0
export const MAX_PITCH = Math.PI / 2

export default function StadiumCamera({
  zoom,
  onZoomChange,
  yaw,
  pitch,
  onPitchChange,
}: {
  zoom: number
  onZoomChange: (nextZoom: number) => void
  yaw: number
  pitch: number
  onPitchChange: (nextPitch: number) => void
}) {
  const { camera, gl } = useThree()
  const currentYaw = useRef(yaw)
  const dragRef = useRef<{ y: number; active: boolean }>({
    y: 0,
    active: false,
  })

  useFrame(() => {
    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, yaw, 0.12)
    const cosPitch = Math.cos(pitch)
    const sinPitch = Math.sin(pitch)
    const sinYaw = Math.sin(currentYaw.current)
    const cosYaw = Math.cos(currentYaw.current)

    const x = zoom * sinYaw * cosPitch
    const y = zoom * sinPitch
    const z = -zoom * cosYaw * cosPitch

    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  })

  useEffect(() => {
    const element = gl.domElement
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? ZOOM_STEP : -ZOOM_STEP
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta))
      if (nextZoom !== zoom) {
        onZoomChange(nextZoom)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      dragRef.current = { y: event.clientY, active: true }
      element.setPointerCapture(event.pointerId)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return
      const deltaY = event.clientY - dragRef.current.y
      dragRef.current.y = event.clientY

      const nextPitch = pitch - deltaY * 0.003
      onPitchChange(Math.min(MAX_PITCH, Math.max(MIN_PITCH, nextPitch)))
    }

    const handlePointerUp = (event: PointerEvent) => {
      dragRef.current.active = false
      element.releasePointerCapture(event.pointerId)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointerleave', handlePointerUp)
    element.addEventListener('pointercancel', handlePointerUp)
    return () => {
      element.removeEventListener('wheel', handleWheel)
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('pointerleave', handlePointerUp)
      element.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [gl, onPitchChange, onZoomChange, pitch, zoom])
  return null
}
