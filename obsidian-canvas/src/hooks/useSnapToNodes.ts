import { useCallback, useState } from 'react'
import type { Node, OnNodeDrag } from '@xyflow/react'
import type { GuideLine } from '../types'

const SNAP_THRESHOLD = 15
const GAP = 20

type Bounds = {
  left: number
  right: number
  top: number
  bottom: number
  cx: number
  cy: number
  w: number
  h: number
}

type SnapCandidate = {
  snapPos: number
  distance: number
  guides: GuideLine[]
}

function getNodeBounds(node: Node): Bounds {
  const w = node.measured?.width ?? node.width ?? 200
  const h = node.measured?.height ?? node.height ?? 44
  return {
    left: node.position.x,
    right: node.position.x + w,
    top: node.position.y,
    bottom: node.position.y + h,
    cx: node.position.x + w / 2,
    cy: node.position.y + h / 2,
    w,
    h,
  }
}

function addCandidate(
  candidates: SnapCandidate[],
  dragEdge: number,
  targetEdge: number,
  snapPos: number,
  guides: GuideLine[]
) {
  const distance = Math.abs(dragEdge - targetEdge)
  if (distance < SNAP_THRESHOLD) {
    candidates.push({ snapPos, distance, guides })
  }
}

function pickClosest(candidates: SnapCandidate[]): SnapCandidate | null {
  if (candidates.length === 0) return null
  return candidates.reduce((best, c) => (c.distance < best.distance ? c : best))
}

/** Find gaps between sorted node edges for equal-spacing snaps */
function findDistributionSnaps(
  drag: Bounds,
  others: Bounds[],
  axis: 'x' | 'y'
): SnapCandidate[] {
  const candidates: SnapCandidate[] = []
  if (others.length < 2) return candidates

  const isX = axis === 'x'
  const start = isX ? 'left' : 'top'
  const end = isX ? 'right' : 'bottom'
  const size = isX ? 'w' : 'h'

  // Sort others by position
  const sorted = [...others].sort((a, b) => a[start] - b[start])

  // Check gaps between consecutive pairs
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1][start] - sorted[i][end]
    if (gap < 4) continue // overlapping or touching nodes, skip

    // Snap dragged node after the last of the pair, with same gap
    const snapAfter = sorted[i + 1][end] + gap
    const distAfter = Math.abs(drag[start] - snapAfter)
    if (distAfter < SNAP_THRESHOLD) {
      const guidePos = sorted[i + 1][end] + gap / 2
      candidates.push({
        snapPos: snapAfter,
        distance: distAfter,
        guides: [{ axis, pos: guidePos }],
      })
    }

    // Snap dragged node before the first of the pair, with same gap
    const snapBefore = sorted[i][start] - gap - drag[size]
    const distBefore = Math.abs(drag[start] - snapBefore)
    if (distBefore < SNAP_THRESHOLD) {
      const guidePos = sorted[i][start] - gap / 2
      candidates.push({
        snapPos: snapBefore,
        distance: distBefore,
        guides: [{ axis, pos: guidePos }],
      })
    }

    // Snap dragged node between the pair, with equal gaps
    const totalSpace = sorted[i + 1][start] - sorted[i][end]
    const snapBetween = sorted[i][end] + (totalSpace - drag[size]) / 2
    const distBetween = Math.abs(drag[start] - snapBetween)
    if (distBetween < SNAP_THRESHOLD && totalSpace > drag[size] + 8) {
      const guideA = sorted[i][end] + (snapBetween - sorted[i][end]) / 2
      const guideB = snapBetween + drag[size] + (sorted[i + 1][start] - snapBetween - drag[size]) / 2
      candidates.push({
        snapPos: snapBetween,
        distance: distBetween,
        guides: [
          { axis, pos: guideA },
          { axis, pos: guideB },
        ],
      })
    }
  }

  return candidates
}

export function useSnapToNodes(getNodes: () => Node[]) {
  const [guides, setGuides] = useState<GuideLine[]>([])

  const onNodeDrag: OnNodeDrag = useCallback(
    (_event, dragNode) => {
      const nodes = getNodes()
      const others = nodes.filter((n) => n.id !== dragNode.id)
      if (others.length === 0) {
        setGuides([])
        return
      }

      const drag = getNodeBounds(dragNode)
      const otherBounds = others.map(getNodeBounds)
      const xCandidates: SnapCandidate[] = []
      const yCandidates: SnapCandidate[] = []

      for (const o of otherBounds) {
        // --- X-axis snaps ---

        // Left edges aligned
        addCandidate(xCandidates, drag.left, o.left, o.left, [
          { axis: 'x', pos: o.left },
        ])
        // Right edges aligned
        addCandidate(xCandidates, drag.right, o.right, o.right - drag.w, [
          { axis: 'x', pos: o.right },
        ])
        // Centers aligned
        addCandidate(xCandidates, drag.cx, o.cx, o.cx - drag.w / 2, [
          { axis: 'x', pos: o.cx },
        ])
        // Left edge to right edge (flush)
        addCandidate(xCandidates, drag.left, o.right, o.right, [
          { axis: 'x', pos: o.right },
        ])
        // Right edge to left edge (flush)
        addCandidate(xCandidates, drag.right, o.left, o.left - drag.w, [
          { axis: 'x', pos: o.left },
        ])
        // Right edge to left edge (with gap)
        addCandidate(xCandidates, drag.right, o.left - GAP, o.left - GAP - drag.w, [
          { axis: 'x', pos: o.left - GAP / 2 },
        ])
        // Left edge to right edge (with gap)
        addCandidate(xCandidates, drag.left, o.right + GAP, o.right + GAP, [
          { axis: 'x', pos: o.right + GAP / 2 },
        ])

        // --- Y-axis snaps ---

        // Top edges aligned
        addCandidate(yCandidates, drag.top, o.top, o.top, [
          { axis: 'y', pos: o.top },
        ])
        // Bottom edges aligned
        addCandidate(yCandidates, drag.bottom, o.bottom, o.bottom - drag.h, [
          { axis: 'y', pos: o.bottom },
        ])
        // Centers aligned
        addCandidate(yCandidates, drag.cy, o.cy, o.cy - drag.h / 2, [
          { axis: 'y', pos: o.cy },
        ])
        // Top edge to bottom edge (flush)
        addCandidate(yCandidates, drag.top, o.bottom, o.bottom, [
          { axis: 'y', pos: o.bottom },
        ])
        // Bottom edge to top edge (flush)
        addCandidate(yCandidates, drag.bottom, o.top, o.top - drag.h, [
          { axis: 'y', pos: o.top },
        ])
        // Bottom edge to top edge (with gap)
        addCandidate(yCandidates, drag.bottom, o.top - GAP, o.top - GAP - drag.h, [
          { axis: 'y', pos: o.top - GAP / 2 },
        ])
        // Top edge to bottom edge (with gap)
        addCandidate(yCandidates, drag.top, o.bottom + GAP, o.bottom + GAP, [
          { axis: 'y', pos: o.bottom + GAP / 2 },
        ])
      }

      // Equal-spacing distribution snaps
      xCandidates.push(...findDistributionSnaps(drag, otherBounds, 'x'))
      yCandidates.push(...findDistributionSnaps(drag, otherBounds, 'y'))

      // Pick closest snap per axis
      const bestX = pickClosest(xCandidates)
      const bestY = pickClosest(yCandidates)

      const newGuides: GuideLine[] = []
      if (bestX) newGuides.push(...bestX.guides)
      if (bestY) newGuides.push(...bestY.guides)

      if (bestX || bestY) {
        dragNode.position = {
          x: bestX ? bestX.snapPos : dragNode.position.x,
          y: bestY ? bestY.snapPos : dragNode.position.y,
        }
      }

      setGuides(newGuides)
    },
    [getNodes]
  )

  const onNodeDragStop: OnNodeDrag = useCallback(() => {
    setGuides([])
  }, [])

  return { guides, onNodeDrag, onNodeDragStop }
}
