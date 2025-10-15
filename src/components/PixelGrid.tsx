import React, { useEffect, useReducer, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Undo2, Redo2, Trash2, ChevronDown, Paintbrush, Eraser } from 'lucide-react'
import SettingsDialog from './SettingsDialog'
import { exportOptions, type ExportData, type ExportTypes } from '@/util/export'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import clsx from 'clsx'
import ColorTooltip from './ColorTooltip'

interface PixelGridProps {
  rows?: number
  cols?: number
}

const TOOLTIP_OFFSET = 12
type ToolMode = 'paint' | 'eraser'

export type GridState = {
  past: string[][][]
  present: string[][]
  future: string[][][]
}
export type Action =
  | { type: 'PAINT'; row: number; col: number; color: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }
  | { type: 'RESET_WITH_SETTINGS'; rows: number; cols: number; defaultColor: string }
  | { type: 'LOAD_STATE'; state: GridState }

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
    case 'LOAD_STATE': {
      return action.state
    }
    default:
      return state
  }
}

const DEFAULT_PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
]

const PixelGrid: React.FC<PixelGridProps> = ({ rows = DEFAULT_GRID, cols = DEFAULT_GRID }) => {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [showGridLines, setShowGridLines] = useState(true)
  const [toolMode, setToolMode] = useState<ToolMode>('paint')
  const [isEyedropperActive, setIsEyedropperActive] = useState(false)

  const [gridRows, setGridRows] = useState(rows)
  const [gridCols, setGridCols] = useState(cols)
  const [cellSize, setCellSize] = useState(32)
  const [defaultCellColor, setDefaultCellColor] = useState('#ffffff')

  const [presetColors, setPresetColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('preset-colors')
    return saved ? JSON.parse(saved) : DEFAULT_PRESET_COLORS
  })
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null)

  const [state, dispatch] = useReducer(gridReducer, {
    past: [],
    present: createEmptyGrid(gridRows, gridCols, defaultCellColor),
    future: [],
  })

  const gridRef = useRef<HTMLDivElement>(null)

  const [tooltip, setTooltip] = useState<{ color: string; x: number; y: number } | null>(null)

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
    const settings = { selectedColor, toolMode }
    localStorage.setItem('pixelgrid-settings', JSON.stringify(settings))
  }, [selectedColor, toolMode])

  // Save preset colors to localStorage
  useEffect(() => {
    localStorage.setItem('preset-colors', JSON.stringify(presetColors))
  }, [presetColors])

  // Load persisted settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('pixelgrid-settings')
    if (savedSettings) {
      try {
        const { selectedColor: savedColor, toolMode: savedTool } = JSON.parse(savedSettings)
        if (savedColor) setSelectedColor(savedColor)
        if (savedTool) setToolMode(savedTool)
      } catch (e) {
        console.warn('Failed to load saved settings:', e)
      }
    }
  }, [])

  const handleCellClick = (row: number, col: number) => {
    // If eyedropper is active, sample the color instead of painting
    if (isEyedropperActive) {
      const sampledColor = state.present[row][col]
      setSelectedColor(sampledColor)
      return
    }

    let colorToUse: string

    switch (toolMode) {
      case 'paint':
        colorToUse = selectedColor
        break
      case 'eraser':
        colorToUse = defaultCellColor // Use default background color
        break
      default:
        colorToUse = selectedColor
    }

    dispatch({ type: 'PAINT', row, col, color: colorToUse })
  }

  const handlePresetClick = (presetColor: string, index: number) => {
    setSelectedColor(presetColor)
    setSelectedPresetIndex(index)
  }

  const handleColorPickerChange = (newColor: string) => {
    setSelectedColor(newColor)

    // If a preset was selected, update that preset slot
    if (selectedPresetIndex !== null) {
      const updatedPresets = [...presetColors]
      updatedPresets[selectedPresetIndex] = newColor
      setPresetColors(updatedPresets)
    }
  }

  const handleExport = (format: ExportTypes) => {
    if (!gridRef.current) return

    const exportOption = exportOptions.find((option) => option.format === format)
    if (!exportOption) return

    const passedData = format === 'json' ? state : gridRef.current

    exportOption
      .converter(passedData as ExportData)
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `pixel-art.${exportOption.format}`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => console.error('Export failed:', err))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const triggerAction = (action: Function) => {
        event.preventDefault()
        action()
      }

      const modifierKeyPressed = event.ctrlKey || event.metaKey

      if (modifierKeyPressed) {
        // Ctrl/Cmd + Z = Undo
        // Ctrl/Cmd + Shift + Z = Redo
        if (event.key === 'z') {
          if (event.shiftKey) triggerAction(() => dispatch({ type: 'REDO' }))
          else triggerAction(() => dispatch({ type: 'UNDO' }))
        }

        // Ctrl/Cmd + Y = Redo
        if (event.key === 'y') triggerAction(() => dispatch({ type: 'REDO' }))
      } else {
        // C = Reset
        if (event.key === 'c') triggerAction(() => dispatch({ type: 'RESET' }))

        // D = Toggle Dark Mode
        if (event.key === 'd') triggerAction(() => setDarkMode((prev) => !prev))

        // P = Paint mode
        if (event.key === 'p') triggerAction(() => setToolMode('paint'))

        // E = Eraser mode
        if (event.key === 'e') triggerAction(() => setToolMode('eraser'))

        // I = Eyedropper mode (temporary activation)
        if (event.key === 'i') {
          event.preventDefault()
          setIsEyedropperActive(true)
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      // Deactivate eyedropper when I key is released
      if (event.key === 'i') {
        setIsEyedropperActive(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Get cursor class based on current state
  const getCursorClass = () => {
    if (isEyedropperActive) return 'cursor-eyedropper'
    if (toolMode === 'paint') return 'cursor-crosshair'
    if (toolMode === 'eraser') return 'cursor-eraser'
    return 'cursor-crosshair'
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      {/* Eyedropper tooltip overlay */}
      {isEyedropperActive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm z-10">
          Click a pixel to sample its color
        </div>
      )}

      {/* Pixel Grid */}
      <div
        ref={gridRef}
        className={clsx({
          'bg-gray-300 dark:bg-gray-700 gap-[1px]': showGridLines,
        })}
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
              onMouseDown={() => handleCellClick(i, j)}
              onMouseEnter={(e) => {
                setTooltip({ color, x: e.clientX + TOOLTIP_OFFSET, y: e.clientY + TOOLTIP_OFFSET })

                const LEFT_MOUSE = 1
                if (e.buttons === LEFT_MOUSE && !isEyedropperActive) {
                  handleCellClick(i, j)
                }
              }}
              onMouseMove={(e) => {
                setTooltip({ color, x: e.clientX + TOOLTIP_OFFSET, y: e.clientY + TOOLTIP_OFFSET })
              }}
              onMouseLeave={() => {
                setTooltip(null)
              }}
              style={{ backgroundColor: color, width: `${cellSize}px`, height: `${cellSize}px` }}
              className={clsx('transition-colors select-none', getCursorClass())}
            />
          ))
        )}
      </div>

      {tooltip && <ColorTooltip {...tooltip} />}

      {/* Bottom-Left Floating Toolbar */}
      <div className="absolute bottom-4 left-4 flex gap-2 flex-col">
        {/* Tool Selection */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={toolMode === 'paint' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToolMode('paint')}
              >
                <Paintbrush className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paint Mode (P)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={toolMode === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToolMode('eraser')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser Mode - Default Color (E)</TooltipContent>
          </Tooltip>
        </div>

        {/* Eyedropper Info */}
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
          <div className="text-xs text-gray-600 dark:text-gray-300 text-center">
            Hold <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">I</kbd>{' '}
            to sample colors
          </div>
        </div>
        {/* Preset Colors Palette */}
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
          <div className="grid grid-cols-5 gap-1.5">
            {presetColors.map((presetColor, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePresetClick(presetColor, index)}
                    className="size-6 rounded border-2 transition-all hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: presetColor,
                      borderColor: selectedPresetIndex === index ? '#3b82f6' : '#9ca3af',
                      boxShadow:
                        selectedPresetIndex === index
                          ? '0 0 0 2px rgba(59, 130, 246, 0.3)'
                          : 'none',
                    }}
                    aria-label={`Select color ${presetColor}`}
                  />
                </TooltipTrigger>
                <TooltipContent>{presetColor.toUpperCase()}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
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
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
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
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={() => dispatch({ type: 'RESET' })}>
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas (C)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Bottom-Center Floating Color Picker */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        {/* Paint Color */}
        {toolMode === 'paint' && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 text-center">
              Paint Color
            </div>
            <ColorPicker color={selectedColor} onChange={handleColorPickerChange} />
          </div>
        )}

        {/* Eraser Color */}
        {toolMode === 'eraser' && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 text-center">Eraser</div>
            <div className="flex items-center gap-2 flex-col">
              <div
                className="size-10 border-2 border-gray-300 dark:border-gray-600 rounded cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: defaultCellColor }}
              >
                <Eraser className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm">{defaultCellColor.toUpperCase()}</span>
            </div>
          </div>
        )}
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
                  <DropdownMenuItem
                    key={option.format}
                    onClick={() => handleExport(option.format as ExportTypes)}
                  >
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
          showGridLines={showGridLines}
          toggleGridLines={() => setShowGridLines((p) => !p)}
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
          dispatch={dispatch}
        />
      </div>
    </div>
  )
}

export default PixelGrid
