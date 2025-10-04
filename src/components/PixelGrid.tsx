import React, { useEffect, useReducer, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Undo2, Redo2, Trash2, Download, ChevronDown } from 'lucide-react'
import SettingsDialog from './SettingsDialog'
import { exportOptions, type ExportTypes } from '@/util/export'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu'

interface PixelGridProps {
  rows?: number
  cols?: number
}

type GridState = {
  past: string[][][]
  present: string[][]
  future: string[][][]
}
type Action =
  | { type: 'PAINT'; row: number; col: number; color: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }
  | { type: 'RESET_WITH_SETTINGS'; rows: number; cols: number; defaultColor: string }

const DEFAULT_GRID = 16

const createEmptyGrid = (rows: number, cols: number, color: string = '#ffffff') =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => color))

const gridReducer = (state: GridState, action: Action): GridState => {
  switch (action.type) {
    case 'PAINT': {
      const { row, col, color } = action
      const newPresent = state.present.map((r, i) =>
        r.map((c, j) => (i === row && j === col ? color : c))
      )
      return { past: [...state.past, state.present], present: newPresent, future: [] }
    }
    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, state.past.length - 1),
        present: previous,
        future: [state.present, ...state.future],
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return { past: [...state.past, state.present], present: next, future: state.future.slice(1) }
    }
    case 'RESET': {
      return {
        past: [...state.past, state.present],
        present: createEmptyGrid(DEFAULT_GRID, DEFAULT_GRID),
        future: [],
      }
    }
    case 'RESET_WITH_SETTINGS': {
      const { rows, cols, defaultColor } = action
      return {
        past: [],
        present: Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => defaultColor)
        ),
        future: [],
      }
    }
    default:
      return state
  }
}

const PixelGrid: React.FC<PixelGridProps> = ({ rows = DEFAULT_GRID, cols = DEFAULT_GRID }) => {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  const [gridRows, setGridRows] = useState(DEFAULT_GRID)
  const [gridCols, setGridCols] = useState(DEFAULT_GRID)
  const [cellSize, setCellSize] = useState(32)
  const [defaultCellColor, setDefaultCellColor] = useState('#ffffff')

  const [state, dispatch] = useReducer(gridReducer, {
    past: [],
    present: createEmptyGrid(gridRows, gridCols, defaultCellColor),
    future: [],
  })

  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch({
      type: 'RESET_WITH_SETTINGS',
      rows: gridRows,
      cols: gridCols,
      defaultColor: defaultCellColor,
    })
  }, [gridRows, gridCols, defaultCellColor])

  // Persist dark mode
  useEffect(() => {
    const root = window.document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Persist other settings
  useEffect(() => {
    const settings = { selectedColor }
    localStorage.setItem('pixelgrid-settings', JSON.stringify(settings))
  }, [selectedColor])

  const handleCellClick = (row: number, col: number) => {
    dispatch({ type: 'PAINT', row, col, color: selectedColor })
  }

  const handleExport = (format: ExportTypes) => {
    if (!gridRef.current) return

    const exportOption = exportOptions.find((option) => option.format === format)
    if (!exportOption) return

    exportOption
      .converter(gridRef.current)
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `pixel-art.${exportOption.format}`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => console.error('Export failed:', err))
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      {/* Pixel Grid */}
      <div
        ref={gridRef}
        className="gap-[1px] bg-gray-300 dark:bg-gray-700"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
        }}
      >
        {state.present.map((row, i) =>
          row.map((color, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => handleCellClick(i, j)}
              style={{ backgroundColor: color, width: `${cellSize}px`, height: `${cellSize}px` }}
              className="cursor-pointer transition-colors"
            />
          ))
        )}
      </div>

      {/* Bottom-Left Floating Toolbar */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.past.length === 0}
            >
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.future.length === 0}
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => dispatch({ type: 'RESET' })}>
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Canvas</TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom-Center Floating Color Picker */}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Tooltip>
          <TooltipTrigger asChild>
            <ColorPicker color={selectedColor} onChange={setSelectedColor} />
          </TooltipTrigger>
          <TooltipContent>Selected Color</TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom-Right Floating Export and Settings */}
      <div className="absolute bottom-4 right-4 flex gap-2 items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Export as
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {exportOptions.map((option) => (
                  <DropdownMenuItem key={option.format} onClick={() => handleExport(option.format as ExportTypes)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>Export your pixel art</TooltipContent>
        </Tooltip>

        {/* Settings Alert Dialog */}
        <SettingsDialog
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          gridRows={gridRows}
          setGridRows={setGridRows}
          gridCols={gridCols}
          setGridCols={setGridCols}
          cellSize={cellSize}
          setCellSize={setCellSize}
          defaultCellColor={defaultCellColor}
          setDefaultCellColor={setDefaultCellColor}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      </div>
    </div>
  )
}

export default PixelGrid
