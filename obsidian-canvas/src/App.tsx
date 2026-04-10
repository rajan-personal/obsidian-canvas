import { useState, useCallback } from 'react'
import { Editor, Tldraw, TLShapeId } from 'tldraw'
import { createShapeId } from '@tldraw/editor'
import 'tldraw/tldraw.css'
import { NoteShapeUtil, NoteShape } from './shapes/NoteShapeUtil'
import { NOTE_TYPE } from './shapes/NoteShape'
import { NoteColorPicker } from './components/NoteColorPicker'
import { MarkdownEditor } from './components/MarkdownEditor'

const shapeUtils = [NoteShapeUtil]

let editorRef: Editor | null = null

export default function App() {
  const [editingShapeId, setEditingShapeId] = useState<TLShapeId | null>(null)
  const [editingText, setEditingText] = useState('')

  const handleMount = useCallback((editor: Editor) => {
    editorRef = editor
    const container = document.querySelector('.tl-container')
    if (!container) return

    container.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement
      if (!target.closest('.note-card')) {
        const { x, y } = editor.inputs.currentPagePoint
        const id = createShapeId()
        editor.createShape({
          id,
          type: NOTE_TYPE,
          x: x - 100,
          y: y - 18,
          props: { w: 200, h: 36, text: '', color: 'yellow' },
        })
        editor.select(id)
        editor.setEditingShape(id)
      }
    })

    // Cmd+click to open markdown editor
    container.addEventListener('click', (ev) => {
      const e = ev as MouseEvent
      if (!(e.metaKey || e.ctrlKey)) return

      const target = e.target as HTMLElement
      const noteEl = target.closest('.note-card')
      if (!noteEl) return

      e.preventDefault()
      e.stopPropagation()

      // Find which note shape was clicked via the page point
      const pagePoint = editor.inputs.currentPagePoint
      const shapesAtPoint = editor.getShapesAtPoint(pagePoint)
      const note = shapesAtPoint.find(
        (s): s is NoteShape => s.type === NOTE_TYPE
      )
      if (note) {
        setEditingText(note.props.text)
        setEditingShapeId(note.id)
      }
    })
  }, [])

  const handleSave = useCallback((newText: string) => {
    if (editorRef && editingShapeId) {
      editorRef.updateShape({
        id: editingShapeId,
        type: NOTE_TYPE,
        props: { text: newText },
      })
    }
  }, [editingShapeId])

  const handleCloseEditor = useCallback(() => {
    setEditingShapeId(null)
    setEditingText('')
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        persistenceKey="obsidian-canvas"
        shapeUtils={shapeUtils}
        onMount={handleMount}
      >
        <NoteColorPicker />
      </Tldraw>
      {editingShapeId && (
        <MarkdownEditor
          text={editingText}
          onSave={handleSave}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
