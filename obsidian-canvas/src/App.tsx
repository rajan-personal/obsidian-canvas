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
    // Set dark mode
    editor.user.updateUserPreferences({ colorScheme: 'dark' })

    const container = document.querySelector('.tl-container')
    if (!container) return

    container.addEventListener('dblclick', () => {
      // Check if there's any shape at the click point — if so, don't create a new one
      const pagePoint = editor.inputs.currentPagePoint
      const shapesAtPoint = editor.getShapesAtPoint(pagePoint)
      if (shapesAtPoint.length > 0) return

      // Also check if tldraw is already editing a shape (user double-clicked a shape)
      if (editor.getEditingShapeId()) return

      const { x, y } = pagePoint
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
    })

    // Cmd+click to open markdown editor
    container.addEventListener('click', (ev) => {
      const e = ev as MouseEvent
      if (!(e.metaKey || e.ctrlKey)) return

      const pagePoint = editor.inputs.currentPagePoint
      const shapesAtPoint = editor.getShapesAtPoint(pagePoint)
      const note = shapesAtPoint.find(
        (s): s is NoteShape => s.type === NOTE_TYPE
      )
      if (note) {
        e.preventDefault()
        e.stopPropagation()
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
