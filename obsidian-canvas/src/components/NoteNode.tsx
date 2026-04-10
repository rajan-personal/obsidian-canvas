import { useRef, useState, useCallback, useEffect } from 'react'
import { type NodeProps, NodeResizer } from '@xyflow/react'
import { useCanvas } from '../context/CanvasContext'
import type { NoteData } from '../types'

export function NoteNode({ id, data, selected }: NodeProps) {
  const { title = '', text = '' } = data as NoteData
  const { updateNodeData, autoEditId, clearAutoEdit } = useCanvas()
  const [editing, setEditing] = useState(false)
  const [titleValue, setTitleValue] = useState(title)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasContent = text.trim().length > 0

  // Enter editing when autoEditId matches (double-click on node or new node)
  useEffect(() => {
    if (autoEditId === id && !editing) {
      setEditing(true)
    }
  }, [autoEditId, id, editing])

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      const ta = inputRef.current
      ta.focus()
      ta.selectionStart = ta.selectionEnd = ta.value.length
      autoSize(ta)
    }
  }, [editing])

  // Sync external title changes when not editing
  useEffect(() => {
    if (!editing) setTitleValue(title)
  }, [title, editing])

  const autoSize = (ta: HTMLTextAreaElement) => {
    ta.style.height = '0'
    ta.style.height = ta.scrollHeight + 'px'
  }

  const save = useCallback(() => {
    setEditing(false)
    if (autoEditId === id) clearAutoEdit()
    if (titleValue !== title) {
      updateNodeData(id, { title: titleValue })
    }
  }, [id, title, titleValue, updateNodeData, autoEditId, clearAutoEdit])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitleValue(e.target.value)
    autoSize(e.target)
  }, [])

  return (
    <div
      data-node-id={id}
      className={`note-node ${selected ? 'selected' : ''} ${hasContent ? 'has-content' : ''}`}
    >
      <NodeResizer
        minWidth={60}
        maxWidth={400}
        isVisible={!!selected}
        lineClassName="note-resize-line"
        handleClassName="note-resize-handle"
      />

      <div className="note-content">
        {editing ? (
          <textarea
            ref={inputRef}
            className="note-input nowheel nopan nodrag"
            value={titleValue}
            rows={1}
            onChange={handleChange}
            placeholder=""
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                save()
              }
              // Stop propagation so ReactFlow doesn't interpret keys
              // (e.g. Backspace/Delete triggering node deletion)
              e.stopPropagation()
            }}
            onBlur={save}
          />
        ) : (
          <span className={`note-title ${!titleValue ? 'empty' : ''}`}>
            {titleValue || '\u00A0'}
          </span>
        )}
      </div>
    </div>
  )
}
