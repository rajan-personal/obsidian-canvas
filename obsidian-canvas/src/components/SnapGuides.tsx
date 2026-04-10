import { useReactFlow } from '@xyflow/react'
import type { GuideLine } from '../types'

export function SnapGuides({ guides }: { guides: GuideLine[] }) {
  const { getViewport } = useReactFlow()

  if (guides.length === 0) return null

  const { x: vx, y: vy, zoom } = getViewport()

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {guides.map((g, i) => {
        if (g.axis === 'x') {
          const screenX = g.pos * zoom + vx
          return (
            <line
              key={i}
              x1={screenX}
              y1={0}
              x2={screenX}
              y2="100%"
              stroke="#7c8aed"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.6}
            />
          )
        } else {
          const screenY = g.pos * zoom + vy
          return (
            <line
              key={i}
              x1={0}
              y1={screenY}
              x2="100%"
              y2={screenY}
              stroke="#7c8aed"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.6}
            />
          )
        }
      })}
    </svg>
  )
}
