import { useState, useCallback, useEffect, useRef } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { ProjectData } from '../types'
import { api, type Project } from '../api'

export type { Project }

const ACTIVE_KEY = 'obsidian-canvas-active-project'

function generateId() {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeId, setActiveId] = useState<string>(
    () => localStorage.getItem(ACTIVE_KEY) || ''
  )
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  // Load projects from API on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    api.listProjects().then(async (list) => {
      if (list.length === 0) {
        const p = await api.createProject(generateId(), 'My Canvas')
        list = [p]
      }
      setProjects(list)
      const stored = localStorage.getItem(ACTIVE_KEY)
      const valid = list.find((p) => p.id === stored)
      const id = valid ? valid.id : list[0].id
      setActiveId(id)
      localStorage.setItem(ACTIVE_KEY, id)
      setLoading(false)
    }).catch((err) => {
      console.error('Failed to load projects:', err)
      setLoading(false)
    })
  }, [])

  const activeProject = projects.find((p) => p.id === activeId) || projects[0]

  const switchProject = useCallback((id: string) => {
    setActiveId(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }, [])

  const createProject = useCallback(async (name: string) => {
    const id = generateId()
    const p = await api.createProject(id, name)
    setProjects((prev) => [...prev, p])
    switchProject(p.id)
    return p
  }, [switchProject])

  const renameProject = useCallback(async (id: string, name: string) => {
    await api.renameProject(id, name)
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    if (projects.length <= 1) return
    await api.deleteProject(id)
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id)
      if (activeId === id) switchProject(next[0].id)
      return next
    })
  }, [projects.length, activeId, switchProject])

  return {
    projects,
    activeProject,
    activeId,
    loading,
    switchProject,
    createProject,
    renameProject,
    deleteProject,
  }
}

// Persistence helpers used by App
export async function loadProjectData(projectId: string): Promise<ProjectData> {
  return api.loadProjectData(projectId)
}

export async function saveProjectNodes(projectId: string, nodes: Node[]) {
  // Normalize dimensions: ReactFlow stores resized width in node.width/measured.width
  const normalized = nodes.map((n) => ({
    ...n,
    style: {
      ...n.style,
      width: n.width ?? n.measured?.width ?? n.style?.width,
      height: n.height ?? n.measured?.height ?? n.style?.height,
    },
  }))
  await api.saveNodes(projectId, normalized)
}

export async function saveProjectEdges(projectId: string, edges: Edge[]) {
  await api.saveEdges(projectId, edges)
}
