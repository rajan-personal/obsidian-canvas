import type { Node, Edge } from '@xyflow/react'

export type NoteData = {
  title: string
  text: string
  color: string
}

export type NoteNode = Node<NoteData, 'note'>

export type ProjectData = {
  nodes: Node[]
  edges: Edge[]
}

export type GuideLine = {
  axis: 'x' | 'y'
  pos: number
}
