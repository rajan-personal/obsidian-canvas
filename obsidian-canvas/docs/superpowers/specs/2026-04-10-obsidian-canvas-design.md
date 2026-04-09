# Obsidian Canvas — Design Spec

## Overview

A frontend-only React app that provides an Obsidian-style infinite canvas for planning ideas. Users create resizable note cards, write markdown content in them, and connect them with arrows. Built on tldraw for canvas interactions and local browser persistence (IndexedDB).

## Goals

- Provide a simple, distraction-free canvas for idea planning
- Notes support markdown with live rendering
- Notes are resizable and draggable
- Arrows connect notes to show relationships
- All data persists locally in the browser (no backend)

## Non-Goals

- Collaboration / multiplayer
- File export/import (can be added later)
- Backend or database
- Authentication

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Canvas engine:** tldraw v3 (latest stable)
- **Markdown:** react-markdown + remark-gfm
- **Persistence:** tldraw's built-in IndexedDB persistence via `persistenceKey`

**Required imports:** tldraw CSS must be imported (`import 'tldraw/tldraw.css'`) for proper rendering.

## Architecture

Single-page app. One custom tldraw shape (`note`). Everything else (arrows, selection, pan, zoom, undo/redo) is provided by tldraw out of the box.

### Custom Note Shape

**Type definition:**

```typescript
type NoteShape = TLBaseShape<'note', {
  text: string
  color: string
}>
```

**Props:**
- `text` (string) — markdown content, default: `"# New Note\n\nDouble-click to edit..."`
- `color` (string) — background color key, one of: `yellow`, `blue`, `green`, `pink`, `purple`, `white`. Default: `yellow`

**Dimensions:**
- Default size: 240x160
- Minimum size: 120x80
- Resizable via `canResize = () => true` (tldraw handles drag handles)

**Behaviors:**

| Action | Behavior |
|--------|----------|
| Single click | Select the note (tldraw default) |
| Double-click | Enter edit mode: show textarea for markdown editing |
| Click away / Escape | Exit edit mode: render markdown |
| Drag | Move note on canvas (tldraw default) |
| Resize handles | Resize note (tldraw default) |
| Arrow tool | Arrows bind to note edges (tldraw binding) |

**Rendering:**

- **View mode:** Renders markdown content using react-markdown. Styled with a card-like appearance — rounded corners, subtle shadow, colored background. Content that exceeds the note size is clipped with overflow scroll.
- **Edit mode:** A textarea fills the note. Raw markdown is visible and editable. On blur or Escape, switches back to view mode with rendered markdown. The textarea must call `stopPropagation` on keyboard events to prevent tldraw from intercepting shortcuts.

**Edit mode implementation:**
- `NoteShapeUtil` extends `BaseBoxShapeUtil` with `override canEdit = () => true`
- The `component()` method checks editing state via `useIsEditing()` hook
- When editing, renders a `<textarea>` with `onKeyDown` calling `e.stopPropagation()`
- When not editing, renders markdown via `MarkdownRenderer`

**Empty note:** When `text` is empty string, show placeholder text "Double-click to edit..." in muted style.

**Migrations:** None needed initially (greenfield project). The migrations array in `NoteShape.ts` is empty but exists as a placeholder for future schema changes.

### Color Picker

A custom toolbar component (not tldraw's built-in style panel) that appears when a note is selected. Shows 6 color swatches. Clicking a swatch updates the selected note's `color` prop via `editor.updateShape()`.

### Creating Notes

- Double-click on empty canvas creates a new note at that position
- Implemented by overriding the default select tool's `onDoubleClick` handler: check if the click target is the canvas (not a shape), then call `editor.createShape()` with the note type at the click coordinates
- Notes start in edit mode immediately after creation

### Arrows

tldraw's built-in arrow tool. Arrows bind to note shapes on their edges. No custom arrow logic needed — tldraw handles arrow creation, binding, bending, and deletion. When a note is deleted, connected arrows are automatically cleaned up by tldraw's binding system.

### Persistence

Pass `persistenceKey="obsidian-canvas"` to the `<Tldraw>` component. This automatically saves/loads all shapes and arrows to IndexedDB.

## Project Structure

```
obsidian-canvas/
├── src/
│   ├── App.tsx                — tldraw canvas with custom shape registration
│   ├── main.tsx               — React entry point
│   ├── shapes/
│   │   ├── NoteShape.ts       — shape type definition, props, empty migrations
│   │   └── NoteShapeUtil.tsx   — shape rendering (view/edit), resize, indicators
│   ├── components/
│   │   ├── MarkdownRenderer.tsx — react-markdown + remark-gfm wrapper
│   │   └── NoteColorPicker.tsx  — custom color picker toolbar
│   └── styles/
│       └── note.css           — note card styling (Obsidian-like pastels)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Visual Design

- **Canvas:** Dark or light neutral background (tldraw default)
- **Notes:** Rounded rectangles with subtle drop shadow. Colored backgrounds using soft pastels:
  - Yellow: `#FEF3C7`
  - Blue: `#DBEAFE`
  - Green: `#D1FAE5`
  - Pink: `#FCE7F3`
  - Purple: `#EDE9FE`
  - White: `#FFFFFF`
- **Typography:** System font stack, markdown renders with proper heading sizes, lists, code blocks
- **Arrows:** tldraw default arrow styling

## Key tldraw APIs Used

- `BaseBoxShapeUtil` — base class for rectangular shapes with resize, extended by `NoteShapeUtil`
- `shapeUtils` prop on `<Tldraw>` — registers custom shape util classes (array of ShapeUtil classes)
- `useIsEditing()` — hook to check if shape is in edit mode
- `editor.createShape()` — programmatic shape creation for double-click-to-create
- `editor.updateShape()` — update shape props (e.g., color)
- `persistenceKey` — IndexedDB persistence
- `TLBaseShape` — type for custom shape props
- Arrow binding — automatic when shapes implement proper bounds

## Edge Cases

| Case | Handling |
|------|----------|
| Delete note with arrows | tldraw auto-cleans bound arrows |
| Empty note content | Show placeholder text in muted style |
| Content overflow | Clip with `overflow: auto` (scrollable) |
| Paste into textarea | Standard textarea paste behavior works |
| Keyboard shortcuts in edit mode | `stopPropagation` prevents tldraw from capturing |
