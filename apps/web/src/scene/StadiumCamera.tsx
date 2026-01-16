import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

const BASE_ZOOM = 26
const BASE_HEIGHT = 11.5
const ZOOM_STEP = 1.2
const MIN_ZOOM = 18
const MAX_ZOOM = 40

export default function StadiumCamera({
  zoom,
  onZoomChange,
}: {
  zoom: number
  onZoomChange: (nextZoom: number) => void
}) {
  const { camera, gl } = useThree()
  useEffect(() => {
    const ratio = zoom / BASE_ZOOM
    camera.position.set(0, BASE_HEIGHT * ratio, -zoom)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, zoom])

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

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [gl, onZoomChange, zoom])
  return null
}
