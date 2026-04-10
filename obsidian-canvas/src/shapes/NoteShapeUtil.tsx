import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape, TLResizeInfo, useIsEditing } from 'tldraw'
import { NOTE_TYPE, NOTE_COLORS, noteShapeProps } from './NoteShape'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import '../styles/note.css'

export type NoteShape = TLBaseShape<typeof NOTE_TYPE, {
  w: number
  h: number
  text: string
  color: string
}>

// Minimum dimensions for notes
const MIN_W = 120
const MIN_H = 80

export class NoteShapeUtil extends BaseBoxShapeUtil<NoteShape> {
  static override type = NOTE_TYPE

  static override props = noteShapeProps

  getDefaultProps(): NoteShape['props'] {
    return {
      w: 240,
      h: 160,
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
    // useIsEditing is the canonical tldraw hook for reactive edit state
    const isEditing = useIsEditing(shape.id)
    const bgColor = NOTE_COLORS[shape.props.color] || NOTE_COLORS.yellow

    return (
      <HTMLContainer
        style={{
          pointerEvents: isEditing ? 'all' : 'none',
        }}
      >
        <div
          className="note-container"
          style={{ backgroundColor: bgColor }}
        >
          <div className="note-content">
            {isEditing ? (
              <textarea
                className="note-textarea"
                defaultValue={shape.props.text}
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  this.editor.updateShape({
                    id: shape.id,
                    type: NOTE_TYPE,
                    props: { text: e.currentTarget.value },
                  })
                }}
              />
            ) : shape.props.text ? (
              <MarkdownRenderer content={shape.props.text} />
            ) : (
              <span className="note-placeholder">Double-click to edit...</span>
            )}
          </div>
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: NoteShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={8}
        ry={8}
      />
    )
  }
}
