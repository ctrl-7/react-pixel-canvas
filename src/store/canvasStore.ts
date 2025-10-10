import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GridState, CanvasSettings } from '@/types/canvas'
import { DEFAULT_SETTINGS } from '@/types/canvas'

const createEmptyGrid = (rows: number, cols: number, color: string = '#ffffff') =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => color))

interface CanvasStore {
  // Grid state (not persisted)
  grid: GridState

  // Settings (persisted)
  settings: CanvasSettings

  // Grid actions
  paintCell: (row: number, col: number, color: string) => void
  undo: () => void
  redo: () => void
  resetGrid: () => void
  resetGridWithSettings: (rows: number, cols: number, defaultColor: string) => void

  // Settings actions
  updateSettings: (settings: Partial<CanvasSettings>) => void
  setGridRows: (rows: number) => void
  setGridCols: (cols: number) => void
  setCellSize: (size: number) => void
  setDefaultCellColor: (color: string) => void
  setSelectedColor: (color: string) => void
  toggleGridLines: () => void
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      // Initial grid state
      grid: {
        past: [],
        present: createEmptyGrid(
          DEFAULT_SETTINGS.gridRows,
          DEFAULT_SETTINGS.gridCols,
          DEFAULT_SETTINGS.defaultCellColor
        ),
        future: [],
      },

      // Initial settings
      settings: DEFAULT_SETTINGS,

      // Grid actions
      paintCell: (row, col, color) =>
        set((state) => {
          const newPresent = state.grid.present.map((r, i) =>
            r.map((c, j) => (i === row && j === col ? color : c))
          )
          return {
            grid: {
              past: [...state.grid.past, state.grid.present],
              present: newPresent,
              future: [],
            },
          }
        }),

      undo: () =>
        set((state) => {
          if (state.grid.past.length === 0) return state
          const previous = state.grid.past[state.grid.past.length - 1]
          return {
            grid: {
              past: state.grid.past.slice(0, state.grid.past.length - 1),
              present: previous,
              future: [state.grid.present, ...state.grid.future],
            },
          }
        }),

      redo: () =>
        set((state) => {
          if (state.grid.future.length === 0) return state
          const next = state.grid.future[0]
          return {
            grid: {
              past: [...state.grid.past, state.grid.present],
              present: next,
              future: state.grid.future.slice(1),
            },
          }
        }),

      resetGrid: () =>
        set((state) => ({
          grid: {
            past: [...state.grid.past, state.grid.present],
            present: createEmptyGrid(
              state.settings.gridRows,
              state.settings.gridCols,
              state.settings.defaultCellColor
            ),
            future: [],
          },
        })),

      resetGridWithSettings: (rows, cols, defaultColor) =>
        set(() => ({
          grid: {
            past: [],
            present: createEmptyGrid(rows, cols, defaultColor),
            future: [],
          },
        })),

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setGridRows: (rows) =>
        set((state) => ({
          settings: { ...state.settings, gridRows: rows },
        })),

      setGridCols: (cols) =>
        set((state) => ({
          settings: { ...state.settings, gridCols: cols },
        })),

      setCellSize: (size) =>
        set((state) => ({
          settings: { ...state.settings, cellSize: size },
        })),

      setDefaultCellColor: (color) =>
        set((state) => ({
          settings: { ...state.settings, defaultCellColor: color },
        })),

      setSelectedColor: (color) =>
        set((state) => ({
          settings: { ...state.settings, selectedColor: color },
        })),

      toggleGridLines: () =>
        set((state) => ({
          settings: { ...state.settings, showGridLines: !state.settings.showGridLines },
        })),
    }),
    {
      name: 'pixelgrid-settings',
      storage: createJSONStorage(() => localStorage),
      // Only persist settings, not grid state
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
