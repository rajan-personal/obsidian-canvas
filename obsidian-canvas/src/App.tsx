import { Editor, Tldraw } from 'tldraw'
import { createShapeId } from '@tldraw/editor'
import 'tldraw/tldraw.css'
import { NoteShapeUtil } from './shapes/NoteShapeUtil'
import { NOTE_TYPE } from './shapes/NoteShape'
import { NoteColorPicker } from './components/NoteColorPicker'

const shapeUtils = [NoteShapeUtil]

function handleMount(editor: Editor) {
  const container = document.querySelector('.tl-container')
  if (container) {
    container.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement
      // Only create a note if clicking on the canvas background, not on an existing shape
      if (!target.closest('.note-container')) {
        const { x, y } = editor.inputs.currentPagePoint
        const id = createShapeId()
        editor.createShape({
          id,
          type: NOTE_TYPE,
          x: x - 120, // center the note on click
          y: y - 80,
          props: { w: 240, h: 160, text: '', color: 'yellow' },
        })
        // Select then enter edit mode
        editor.select(id)
        editor.setEditingShape(id)
      }
    })
  }
}

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        persistenceKey="obsidian-canvas"
        shapeUtils={shapeUtils}
        onMount={handleMount}
      >
        <NoteColorPicker />
      </Tldraw>
    </div>
  )
}
