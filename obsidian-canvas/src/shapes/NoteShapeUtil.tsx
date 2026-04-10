import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape, TLResizeInfo, useIsEditing, useEditor } from 'tldraw'
import { NOTE_TYPE, noteShapeProps } from './NoteShape'
import { useRef, useEffect, useCallback } from 'react'

export type NoteShape = TLBaseShape<typeof NOTE_TYPE, {
  w: number
  h: number
  text: string
  color: string
}>

const MIN_W = 140
const MIN_H = 40

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
      style={{
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'inherit',
        color: '#dcddde',
        padding: 0,
        lineHeight: 1,
      }}
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
      w: 220,
      h: 40,
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
    const firstLine = shape.props.text.split('\n')[0] || ''
    const hasContent = shape.props.text.trim().length > 0
    const hasMoreLines = hasContent && shape.props.text.split('\n').length > 1

    return (
      <HTMLContainer
        style={{
          pointerEvents: isEditing ? 'all' : 'none',
        }}
      >
        <div
          data-note-id={shape.id}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '8px',
            border: '1px solid #666',
            background: '#303030',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: '6px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {isEditing ? (
            <NoteEditor shape={shape} />
          ) : (
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: hasContent ? '#dcddde' : '#666',
                fontStyle: hasContent ? 'normal' : 'italic',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                lineHeight: 1,
              }}
            >
              {hasContent ? firstLine || 'Untitled' : 'Untitled'}
            </span>
          )}
          {hasMoreLines && (
            <span style={{ color: '#666', fontSize: '12px', flexShrink: 0 }}>...</span>
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
        rx={8}
        ry={8}
      />
    )
  }
}
