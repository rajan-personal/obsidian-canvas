# Obsidian Canvas Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Obsidian-style infinite canvas app where users create resizable markdown notes and connect them with arrows.

**Architecture:** Single-page React app using tldraw as the canvas engine. One custom `note` shape handles markdown rendering and editing. tldraw provides arrows, persistence, pan/zoom, and undo/redo out of the box.

**Tech Stack:** React 18, TypeScript, Vite, tldraw (latest), react-markdown, remark-gfm

**Spec:** `docs/superpowers/specs/2026-04-10-obsidian-canvas-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config |
| `vite.config.ts` | Vite build config |
| `index.html` | HTML entry point |
| `src/main.tsx` | React DOM mount |
| `src/App.tsx` | Tldraw canvas setup, shape registration, double-click handler |
| `src/shapes/NoteShape.ts` | Shape type declaration, prop validators, migrations |
| `src/shapes/NoteShapeUtil.tsx` | Shape rendering (view/edit mode), resize, indicator |
| `src/components/MarkdownRenderer.tsx` | react-markdown + remark-gfm wrapper |
| `src/components/NoteColorPicker.tsx` | Color picker toolbar for selected notes |
| `src/styles/note.css` | Note card styling (pastels, shadows, typography) |

---

## Chunk 1: Project Scaffold and Tldraw Setup

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Initialize Vite project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

Expected: Project files created in current directory.

- [ ] **Step 2: Install tldraw**

Run:
```bash
npm install tldraw
```

- [ ] **Step 3: Install markdown dependencies**

Run:
```bash
npm install react-markdown remark-gfm
```

- [ ] **Step 4: Replace App.tsx with tldraw canvas**

Replace `src/App.tsx` with:

```tsx
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw persistenceKey="obsidian-canvas" />
    </div>
  )
}
```

- [ ] **Step 5: Clean up main.tsx**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 6: Remove default Vite CSS files**

Delete `src/App.css` and `src/index.css`. Remove the `import './index.css'` line from `main.tsx` if present.

- [ ] **Step 7: Run dev server and verify tldraw loads**

Run:
```bash
npm run dev
```

Expected: Browser shows tldraw canvas with default tools (select, draw, arrow, etc.). Pan and zoom work.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src/main.tsx src/App.tsx src/vite-env.d.ts
git commit -m "feat: scaffold Vite + React + tldraw project"
```

---

## Chunk 2: Custom Note Shape

### Task 2: Define note shape type and validators

**Files:**
- Create: `src/shapes/NoteShape.ts`

- [ ] **Step 1: Create shape type declaration**

Create `src/shapes/NoteShape.ts`:

```typescript
import { T } from '@tldraw/validate'

export const NOTE_TYPE = 'note' as const

// Color options for notes
export const NOTE_COLORS: Record<string, string> = {
  yellow: '#FEF3C7',
  blue: '#DBEAFE',
  green: '#D1FAE5',
  pink: '#FCE7F3',
  purple: '#EDE9FE',
  white: '#FFFFFF',
}

export const noteShapeProps = {
  w: T.number,
  h: T.number,
  text: T.string,
  color: T.string,
}

// Note: w and h are required by BaseBoxShapeUtil's prop system.
// They are managed by tldraw's resize system automatically.
```

- [ ] **Step 2: Commit**

```bash
git add src/shapes/NoteShape.ts
git commit -m "feat: define note shape type and color constants"
```

### Task 3: Create NoteShapeUtil with view mode rendering

**Files:**
- Create: `src/shapes/NoteShapeUtil.tsx`
- Create: `src/components/MarkdownRenderer.tsx`
- Create: `src/styles/note.css`

- [ ] **Step 1: Create MarkdownRenderer component**

Create `src/components/MarkdownRenderer.tsx`:

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="note-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 2: Create note.css with card styling**

Create `src/styles/note.css`:

```css
.note-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.note-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.note-markdown {
  font-size: 14px;
  line-height: 1.5;
  color: #1a1a1a;
}

.note-markdown h1 { font-size: 1.4em; margin: 0 0 0.4em; }
.note-markdown h2 { font-size: 1.2em; margin: 0 0 0.3em; }
.note-markdown h3 { font-size: 1.1em; margin: 0 0 0.3em; }
.note-markdown p { margin: 0 0 0.5em; }
.note-markdown ul, .note-markdown ol { margin: 0 0 0.5em; padding-left: 1.5em; }
.note-markdown code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}
.note-markdown pre {
  background: rgba(0, 0, 0, 0.06);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
.note-markdown pre code {
  background: none;
  padding: 0;
}
.note-markdown blockquote {
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  margin: 0 0 0.5em;
  padding-left: 12px;
  color: #555;
}
.note-markdown a { color: #2563eb; }
.note-markdown hr { border: none; border-top: 1px solid rgba(0, 0, 0, 0.1); margin: 0.5em 0; }
.note-markdown table { border-collapse: collapse; width: 100%; margin: 0 0 0.5em; }
.note-markdown th, .note-markdown td { border: 1px solid rgba(0, 0, 0, 0.1); padding: 4px 8px; text-align: left; }
.note-markdown th { background: rgba(0, 0, 0, 0.04); }

.note-placeholder {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.note-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  padding: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  background: transparent;
  color: #1a1a1a;
  box-sizing: border-box;
}
```

- [ ] **Step 3: Create NoteShapeUtil with view mode**

Create `src/shapes/NoteShapeUtil.tsx`:

```tsx
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
```

- [ ] **Step 4: Register shape in App.tsx**

Replace `src/App.tsx` with:

```tsx
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
```

- [ ] **Step 5: Run dev server and verify note shape renders**

Run:
```bash
npm run dev
```

At this point, notes can't be created from the UI yet (that's Task 4). To verify the shape works, temporarily add an `onMount` to create a test note:

Add to `<Tldraw>` temporarily:
```tsx
onMount={(editor) => {
  editor.createShape({
    type: 'note',
    x: 200,
    y: 200,
    props: { w: 240, h: 160, text: '# Hello\n\nThis is a **test** note.', color: 'yellow' },
  })
}}
```

Expected: A yellow card appears with rendered markdown. Double-click enters edit mode with textarea. Click away saves and renders markdown.

- [ ] **Step 6: Remove the temporary onMount test code**

Remove the `onMount` prop from `<Tldraw>`.

- [ ] **Step 7: Commit**

```bash
git add src/shapes/ src/components/MarkdownRenderer.tsx src/styles/note.css src/App.tsx
git commit -m "feat: add custom note shape with markdown rendering and edit mode"
```

---

## Chunk 3: Double-Click to Create Notes and Color Picker

### Task 4: Add double-click on canvas to create notes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add onMount handler with double-click override**

Update `src/App.tsx`:

```tsx
import { createShapeId, Editor, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { NoteShapeUtil } from './shapes/NoteShapeUtil'
import { NOTE_TYPE } from './shapes/NoteShape'

const shapeUtils = [NoteShapeUtil]

function handleMount(editor: Editor) {
  // Override the canvas double-click handler to create notes
  editor.sideEffects.registerHandler('pointer', ({ name, target }) => {
    // This handler runs on pointer events — we only care about double_click on canvas
  })

  // Use a DOM-level listener on the tldraw container as a reliable fallback
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
      />
    </div>
  )
}
```

**Note:** The double-click approach uses a DOM event listener on the tldraw container. This is needed because tldraw's built-in double-click on shapes already triggers edit mode (via `canEdit()`), so we only need to handle clicks on the empty canvas. The `target.closest('.note-container')` check ensures we don't create a new note when double-clicking an existing one (tldraw handles that case by entering edit mode). If this approach has issues at runtime, an alternative is to extend `StateNode` to create a custom tool — adapt as needed during implementation.

- [ ] **Step 2: Run dev server and test**

Run:
```bash
npm run dev
```

Expected: Double-click on empty canvas creates a yellow note centered on cursor. The note opens in edit mode immediately. Double-click on an existing note enters edit mode. Arrows from tldraw toolbar connect notes.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: double-click on canvas creates new note in edit mode"
```

### Task 5: Add color picker for notes

**Files:**
- Create: `src/components/NoteColorPicker.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create NoteColorPicker component**

Create `src/components/NoteColorPicker.tsx`:

```tsx
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
```

- [ ] **Step 2: Add NoteColorPicker to App.tsx**

Update `src/App.tsx` — add the color picker as a child of `<Tldraw>`:

```tsx
import { createShapeId, Editor, Tldraw } from 'tldraw'
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
      if (!target.closest('.note-container')) {
        const { x, y } = editor.inputs.currentPagePoint
        const id = createShapeId()
        editor.createShape({
          id,
          type: NOTE_TYPE,
          x: x - 120,
          y: y - 80,
          props: { w: 240, h: 160, text: '', color: 'yellow' },
        })
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
```

- [ ] **Step 3: Run dev server and test color picker**

Run:
```bash
npm run dev
```

Expected: Create a note by double-clicking. Click the note to select it. A color picker bar appears at top center with 6 color dots. Clicking a color changes the note background. The picker disappears when no note is selected.

- [ ] **Step 4: Commit**

```bash
git add src/components/NoteColorPicker.tsx src/App.tsx
git commit -m "feat: add color picker toolbar for note shapes"
```

---

## Chunk 4: Polish and Final Verification

### Task 6: Final testing and cleanup

**Files:**
- Possibly modify: any file that needs fixes

- [ ] **Step 1: Test complete workflow**

Run:
```bash
npm run dev
```

Test the following scenarios:
1. Double-click canvas → note appears in edit mode
2. Type markdown (headings, bold, lists, code) → click away → renders correctly
3. Double-click note → edit mode with textarea showing raw markdown
4. Escape or click away → exits edit mode
5. Resize note via handles → content reflows
6. Use tldraw arrow tool → draw arrow from one note to another → arrow binds to edges
7. Delete note → connected arrows clean up
8. Select note → color picker appears → change color → background updates
9. Refresh page → all notes and arrows persist
10. Pan and zoom → all elements respond correctly

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Fix any issues found during testing**

Address any bugs found in step 1 or 2.

- [ ] **Step 4: Commit any fixes**

```bash
git add src/
git commit -m "fix: polish and final adjustments"
```

- [ ] **Step 5: Final commit — remove any unused files from Vite scaffold**

Check for and remove any leftover Vite boilerplate (e.g., `src/assets/react.svg`, `public/vite.svg`).

```bash
git add src/ public/
git commit -m "chore: remove unused Vite scaffold files"
```
