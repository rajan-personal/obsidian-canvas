import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { NoteShapeUtil } from './shapes/NoteShapeUtil'

const shapeUtils = [NoteShapeUtil]

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        persistenceKey="obsidian-canvas"
        shapeUtils={shapeUtils}
      />
    </div>
  )
}
