import { useState, useRef, useEffect, useCallback } from 'react'
import type { Project } from '../hooks/useProjects'

interface WorkspaceSwitcherProps {
  projects: Project[]
  activeProject: Project
  onSwitch: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function WorkspaceSwitcher({
  projects,
  activeProject,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(activeProject.name)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  // Sync name when switching projects
  useEffect(() => {
    setNameValue(activeProject.name)
  }, [activeProject.name])

  // Focus inputs
  useEffect(() => {
    if (editingName) nameInputRef.current?.select()
  }, [editingName])

  useEffect(() => {
    if (creating) newInputRef.current?.focus()
  }, [creating])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener('mousedown', handler, true)
    document.addEventListener('pointerdown', handler, true)
    return () => {
      document.removeEventListener('mousedown', handler, true)
      document.removeEventListener('pointerdown', handler, true)
    }
  }, [open])

  const saveName = useCallback(() => {
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== activeProject.name) {
      onRename(activeProject.id, trimmed)
    } else {
      setNameValue(activeProject.name)
    }
    setEditingName(false)
  }, [nameValue, activeProject, onRename])

  const handleCreate = useCallback(() => {
    const trimmed = newName.trim()
    if (trimmed) {
      onCreate(trimmed)
      setNewName('')
      setCreating(false)
      setOpen(false)
    }
  }, [newName, onCreate])

  return (
    <div className="workspace-switcher" ref={dropdownRef}>
      <div className="workspace-header" onClick={() => !editingName && setOpen(!open)}>
        {editingName ? (
          <input
            ref={nameInputRef}
            className="workspace-name-input"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveName()
              if (e.key === 'Escape') {
                setNameValue(activeProject.name)
                setEditingName(false)
              }
            }}
            onBlur={saveName}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="workspace-name"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditingName(true)
            }}
          >
            {activeProject.name}
          </span>
        )}
        <svg
          className={`workspace-chevron ${open ? 'open' : ''}`}
          width="8"
          height="8"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open && (
        <div className="workspace-dropdown">
          <div className="workspace-list">
            {projects.map((p) => (
              <div
                key={p.id}
                className={`workspace-item ${p.id === activeProject.id ? 'active' : ''}`}
                onClick={() => {
                  onSwitch(p.id)
                  setOpen(false)
                }}
              >
                <span className="workspace-item-name">{p.name}</span>
                {projects.length > 1 && (
                  <button
                    className="workspace-item-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete "${p.name}"?`)) {
                        onDelete(p.id)
                      }
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="workspace-divider" />
          {creating ? (
            <div className="workspace-create-form">
              <input
                ref={newInputRef}
                className="workspace-create-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') {
                    setCreating(false)
                    setNewName('')
                  }
                }}
                onBlur={() => {
                  if (!newName.trim()) {
                    setCreating(false)
                    setNewName('')
                  }
                }}
              />
            </div>
          ) : (
            <button
              className="workspace-create-btn"
              onClick={() => setCreating(true)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New project
            </button>
          )}
        </div>
      )}
    </div>
  )
}
