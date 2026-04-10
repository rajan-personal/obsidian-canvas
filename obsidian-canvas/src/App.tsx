import { useState, useCallback } from 'react'
import { Editor, Tldraw, TLShapeId, StateNode } from 'tldraw'
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
    editor.user.updateUserPreferences({ colorScheme: 'dark' })

    // Override select tool idle state's onDoubleClick to create notes instead of text
    const selectIdle = editor.getStateDescendant<StateNode>('select.idle')
    if (selectIdle) {
      const originalOnDoubleClick = selectIdle.onDoubleClick?.bind(selectIdle)
      selectIdle.onDoubleClick = (info) => {
        // If double-clicking on a shape, use default behavior (enters edit mode)
        if (info.target === 'shape') {
          originalOnDoubleClick?.(info)
          return
        }

        // On empty canvas, create a note instead of text
        if (info.target === 'canvas') {
          const { x, y } = editor.inputs.currentPagePoint
          const id = createShapeId()
          editor.createShape({
            id,
            type: NOTE_TYPE,
            x: x - 110,
            y: y - 20,
            props: { w: 220, h: 40, text: '', color: 'yellow' },
          })
          editor.select(id)
          editor.setEditingShape(id)
          return
        }

        // Other targets: use default
        originalOnDoubleClick?.(info)
      }
    }

    // Cmd+click to open markdown editor
    const container = document.querySelector('.tl-container')
    if (container) {
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
    }
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
