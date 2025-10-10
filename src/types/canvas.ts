export type Theme = 'light' | 'dark'

export interface GridState {
  past: string[][][]
  present: string[][]
  future: string[][][]
}

export interface CanvasSettings {
  gridRows: number
  gridCols: number
  cellSize: number
  defaultCellColor: string
  selectedColor: string
  showGridLines: boolean
}

export const DEFAULT_SETTINGS: CanvasSettings = {
  gridRows: 16,
  gridCols: 16,
  cellSize: 32,
  defaultCellColor: '#ffffff',
  selectedColor: '#000000',
  showGridLines: true,
}
