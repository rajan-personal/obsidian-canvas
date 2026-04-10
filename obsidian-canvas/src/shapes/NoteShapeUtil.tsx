import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape, TLResizeInfo, useIsEditing, useEditor } from 'tldraw'
import { NOTE_TYPE, NOTE_COLORS, noteShapeProps } from './NoteShape'
import { useRef, useEffect, useCallback } from 'react'
import '../styles/note.css'

export type NoteShape = TLBaseShape<typeof NOTE_TYPE, {
  w: number
  h: number
  text: string
  color: string
}>

const MIN_W = 120
const MIN_H = 36

function NoteEditor({ shape }: { shape: NoteShape }) {
  const editor = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const firstLine = shape.props.text.split('\n')[0] || ''

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = firstLine
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const save = useCallback(() => {
    if (!inputRef.current) return
    const newTitle = inputRef.current.value
    const lines = shape.props.text.split('\n')
    lines[0] = newTitle
    editor.updateShape({
      id: shape.id,
      type: NOTE_TYPE,
      props: { text: lines.join('\n') },
    })
  }, [editor, shape.id, shape.props.text])

  return (
    <input
      ref={inputRef}
      className="note-title-input"
      placeholder="Type a title..."
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter' || e.key === 'Escape') {
          save()
          editor.setEditingShape(null)
        }
      }}
      onBlur={() => {
        save()
      }}
    />
  )
}

export class NoteShapeUtil extends BaseBoxShapeUtil<NoteShape> {
  static override type = NOTE_TYPE

  static override props = noteShapeProps

  getDefaultProps(): NoteShape['props'] {
    return {
      w: 200,
      h: 36,
      text: '',
      color: 'yellow',
    }
  }

  override canEdit() {
    return true
  }

  override canResize() {
    return true
  }

  override isAspectRatioLocked() {
    return false
  }

  override onResize(shape: NoteShape, info: TLResizeInfo<NoteShape>) {
    const nextW = Math.max(MIN_W, shape.props.w * info.scaleX)
    const nextH = Math.max(MIN_H, shape.props.h * info.scaleY)
    return {
      props: {
        w: nextW,
        h: nextH,
      },
    }
  }

  component(shape: NoteShape) {
    const isEditing = useIsEditing(shape.id)
    const bgColor = NOTE_COLORS[shape.props.color] || NOTE_COLORS.yellow
    const firstLine = shape.props.text.split('\n')[0] || ''
    const hasContent = shape.props.text.trim().length > 0

    return (
      <HTMLContainer
        style={{
          pointerEvents: isEditing ? 'all' : 'none',
        }}
      >
        <div
          className="note-card"
          data-note-id={shape.id}
          style={{ backgroundColor: bgColor }}
        >
          {isEditing ? (
            <NoteEditor shape={shape} />
          ) : (
            <span className={hasContent ? 'note-title' : 'note-title note-title-empty'}>
              {hasContent ? firstLine || 'Untitled' : 'Untitled'}
            </span>
          )}
          {hasContent && shape.props.text.split('\n').length > 1 && (
            <span className="note-has-content">...</span>
          )}
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: NoteShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={6}
        ry={6}
      />
    )
  }
}
