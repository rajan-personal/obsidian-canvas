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
