import { useEditor, useValue } from 'tldraw'
import { NOTE_TYPE, NOTE_COLORS } from '../shapes/NoteShape'
import type { NoteShape } from '../shapes/NoteShapeUtil'

export function NoteColorPicker() {
  const editor = useEditor()

  const selectedNoteColor = useValue(
    'selected note color',
    () => {
      const selectedShapes = editor.getSelectedShapes()
      const notes = selectedShapes.filter(
        (s): s is NoteShape => s.type === NOTE_TYPE
      )
      if (notes.length === 0) return null
      return notes[0].props.color
    },
    [editor]
  )

  if (selectedNoteColor === null) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 4,
        padding: '6px 8px',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    >
      {Object.entries(NOTE_COLORS).map(([name, hex]) => (
        <button
          key={name}
          onClick={() => {
            const selectedShapes = editor.getSelectedShapes()
            const notes = selectedShapes.filter((s) => s.type === NOTE_TYPE)
            notes.forEach((note) => {
              editor.updateShape({
                id: note.id,
                type: NOTE_TYPE,
                props: { color: name },
              })
            })
          }}
          title={name}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: hex,
            border: selectedNoteColor === name
              ? '2px solid #333'
              : '2px solid #ddd',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      ))}
    </div>
  )
}
