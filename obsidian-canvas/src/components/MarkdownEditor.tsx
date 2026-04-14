import { useState, useEffect, useCallback, useRef } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'
import '../styles/note.css'

interface MarkdownEditorProps {
  text: string
  onSave: (text: string) => void
  onClose: () => void
}

export function MarkdownEditor({ text, onSave, onClose }: MarkdownEditorProps) {
  const [value, setValue] = useState(text)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleClose = useCallback(() => {
    onSave(value)
    onClose()
  }, [value, onSave, onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleClose])

  return (
    <div className="md-editor-overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) handleClose()
    }}>
      <div className="md-editor-modal">
        <div className="md-editor-header">
          <span className="md-editor-header-title">Edit Note</span>
          <div className="md-editor-tabs">
            <button
              className={`md-editor-tab ${tab === 'edit' ? 'active' : ''}`}
              onClick={() => setTab('edit')}
            >
              Edit
            </button>
            <button
              className={`md-editor-tab ${tab === 'preview' ? 'active' : ''}`}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
          </div>
          <button className="md-editor-close" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="md-editor-body">
          {tab === 'edit' ? (
            <textarea
              ref={textareaRef}
              className="md-editor-textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  e.stopPropagation()
                  const start = e.currentTarget.selectionStart
                  const end = e.currentTarget.selectionEnd
                  const newValue = value.substring(0, start) + '  ' + value.substring(end)
                  setValue(newValue)
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
                    }
                  }, 0)
                }
              }}
              placeholder="Write your markdown here..."
              autoFocus
            />
          ) : (
            <div className="md-editor-preview">
              {value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <span style={{ color: '#999', fontStyle: 'italic' }}>Nothing to preview</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
