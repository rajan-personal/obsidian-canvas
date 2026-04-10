import { createContext, useContext } from 'react'

type CanvasContextValue = {
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void
  autoEditId: string | null
  clearAutoEdit: () => void
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export const CanvasProvider = CanvasContext.Provider

export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext)
  if (!ctx) throw new Error('useCanvas must be used within a CanvasProvider')
  return ctx
}
