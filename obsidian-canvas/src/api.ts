import type { Node, Edge } from '@xyflow/react'
import type { ProjectData } from './types'

export type Project = {
  id: string
  name: string
  createdAt: number
}

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

// Projects
export const api = {
  listProjects: () => request<Project[]>('/projects'),

  createProject: (id: string, name: string) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ id, name }),
    }),

  renameProject: (id: string, name: string) =>
    request<{ ok: boolean }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  deleteProject: (id: string) =>
    request<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

  // Nodes
  getNodes: (projectId: string) =>
    request<Node[]>(`/projects/${projectId}/nodes`),

  saveNodes: (projectId: string, nodes: Node[]) =>
    request<{ ok: boolean }>(`/projects/${projectId}/nodes`, {
      method: 'PUT',
      body: JSON.stringify(nodes),
    }),

  // Edges
  getEdges: (projectId: string) =>
    request<Edge[]>(`/projects/${projectId}/edges`),

  saveEdges: (projectId: string, edges: Edge[]) =>
    request<{ ok: boolean }>(`/projects/${projectId}/edges`, {
      method: 'PUT',
      body: JSON.stringify(edges),
    }),

  // Combined load
  loadProjectData: async (projectId: string): Promise<ProjectData> => {
    const [nodes, edges] = await Promise.all([
      api.getNodes(projectId),
      api.getEdges(projectId),
    ])
    return { nodes, edges }
  },
}
