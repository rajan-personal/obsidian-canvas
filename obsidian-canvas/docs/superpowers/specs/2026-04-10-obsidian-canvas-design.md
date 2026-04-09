# Obsidian Canvas — Design Spec

## Overview

A frontend-only React app that provides an Obsidian-style infinite canvas for planning ideas. Users create resizable note cards, write markdown content in them, and connect them with arrows. Built on tldraw for canvas interactions and persistence.

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
- **Canvas engine:** tldraw (latest v2)
- **Markdown:** react-markdown + remark-gfm
- **Persistence:** tldraw's built-in localStorage via `persistenceKey`

## Architecture

Single-page app. One custom tldraw shape (`note`). Everything else (arrows, selection, pan, zoom, undo/redo) is provided by tldraw out of the box.

### Custom Note Shape

**Type ID:** `note`

**Props:**
- `text` (string) — markdown content, default: `"# New Note\n\nDouble-click to edit..."`
- `color` (string) — background color key, one of: `yellow`, `blue`, `green`, `pink`, `purple`, `white`. Default: `yellow`

**Dimensions:**
- Default size: 240x160
- Minimum size: 120x80
- Resizable via `canResize: true` (tldraw handles drag handles)

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

- **View mode:** Renders markdown content using react-markdown. Styled with a card-like appearance — rounded corners, subtle shadow, colored background, small title bar area.
- **Edit mode:** A textarea fills the note. Raw markdown is visible and editable. On blur or Escape, switches back to view mode with rendered markdown.

### Color Picker

When a note is selected, tldraw's style panel will show a color picker with the 6 pastel options. This is achieved by defining a custom style for the note shape.

### Creating Notes

- Double-click on empty canvas creates a new note at that position
- Notes start in edit mode immediately

### Arrows

tldraw's built-in arrow tool. Arrows bind to note shapes on their edges. No custom arrow logic needed — tldraw handles arrow creation, binding, bending, and deletion.

### Persistence

Pass `persistenceKey="obsidian-canvas"` to the tldraw `<Tldraw>` component. This automatically saves/loads all shapes and arrows to localStorage.

## Project Structure

```
obsidian-canvas/
├── src/
│   ├── App.tsx                — tldraw canvas with custom shape registration
│   ├── main.tsx               — React entry point
│   ├── shapes/
│   │   ├── NoteShape.ts       — shape type definition, props, migrations
│   │   └── NoteShapeUtil.tsx   — shape rendering (view/edit), resize, indicators
│   ├── components/
│   │   └── MarkdownRenderer.tsx — react-markdown + remark-gfm wrapper
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

- `ShapeUtil` — custom shape class for rendering and behavior
- `defineShape` / shape type registration via `shapeUtils` prop
- `BaseBoxShapeUtil` — base class for rectangular shapes with resize
- `persistenceKey` — localStorage persistence
- `TLBaseShape` — type for custom shape props
- Arrow binding — automatic when shapes implement proper bounds
