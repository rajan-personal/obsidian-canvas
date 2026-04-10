import { useCallback, useRef } from 'react'

const DOUBLE_CLICK_MS = 400
const DOUBLE_CLICK_PX = 10

export function usePaneDoubleClick(
  onDoubleClick: (event: React.MouseEvent) => void
) {
  const last = useRef({ time: 0, x: 0, y: 0 })

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      const now = Date.now()
      const prev = last.current
      const isDouble =
        now - prev.time < DOUBLE_CLICK_MS &&
        Math.abs(event.clientX - prev.x) < DOUBLE_CLICK_PX &&
        Math.abs(event.clientY - prev.y) < DOUBLE_CLICK_PX
      last.current = { time: now, x: event.clientX, y: event.clientY }
      if (isDouble) onDoubleClick(event)
    },
    [onDoubleClick]
  )

  return onPaneClick
}
