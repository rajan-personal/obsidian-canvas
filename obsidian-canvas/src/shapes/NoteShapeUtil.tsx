import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape, TLResizeInfo, useIsEditing } from 'tldraw'
import { NOTE_TYPE, NOTE_COLORS, noteShapeProps } from './NoteShape'
import '../styles/note.css'

export type NoteShape = TLBaseShape<typeof NOTE_TYPE, {
  w: number
  h: number
  text: string
  color: string
}>

const MIN_W = 120
const MIN_H = 36

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
          style={{ backgroundColor: bgColor }}
        >
          {isEditing ? (
            <input
              className="note-title-input"
              defaultValue={firstLine}
              autoFocus
              placeholder="Type a title..."
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                }
              }}
              onBlur={(e) => {
                const newTitle = e.currentTarget.value
                const lines = shape.props.text.split('\n')
                lines[0] = newTitle
                this.editor.updateShape({
                  id: shape.id,
                  type: NOTE_TYPE,
                  props: { text: lines.join('\n') },
                })
              }}
            />
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
