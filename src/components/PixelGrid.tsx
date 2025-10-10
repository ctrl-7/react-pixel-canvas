import React, { useEffect, useRef } from 'react'
import ColorPicker from './ColorPicker'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Undo2, Redo2, Trash2, ChevronDown } from 'lucide-react'
import SettingsDialog from './SettingsDialog'
import { exportOptions, type ExportTypes } from '@/util/export'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import clsx from 'clsx'
import { useCanvasStore } from '@/store/canvasStore'
import { useThemeStore } from '@/store/themeStore'

interface PixelGridProps {
  rows?: number
  cols?: number
}

const PixelGrid: React.FC<PixelGridProps> = () => {
  // Zustand stores
  const grid = useCanvasStore((state) => state.grid)
  const settings = useCanvasStore((state) => state.settings)
  const paintCell = useCanvasStore((state) => state.paintCell)
  const undo = useCanvasStore((state) => state.undo)
  const redo = useCanvasStore((state) => state.redo)
  const resetGrid = useCanvasStore((state) => state.resetGrid)
  const resetGridWithSettings = useCanvasStore((state) => state.resetGridWithSettings)
  const setSelectedColor = useCanvasStore((state) => state.setSelectedColor)

  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const gridRef = useRef<HTMLDivElement>(null)

  // Reset grid when settings change
  useEffect(() => {
    resetGridWithSettings(settings.gridRows, settings.gridCols, settings.defaultCellColor)
  }, [settings.gridRows, settings.gridCols, settings.defaultCellColor, resetGridWithSettings])

  const handleCellClick = (row: number, col: number) => {
    paintCell(row, col, settings.selectedColor)
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const triggerAction = (action: () => void) => {
        event.preventDefault()
        action()
      }

      const modifierKeyPressed = event.ctrlKey || event.metaKey

      if (modifierKeyPressed) {
        // Ctrl/Cmd + Z = Undo
        // Ctrl/Cmd + Shift + Z = Redo
        if (event.key === 'z') {
          if (event.shiftKey) triggerAction(() => redo())
          else triggerAction(() => undo())
        }

        // Ctrl/Cmd + Y = Redo
        if (event.key === 'y') triggerAction(() => redo())
      } else {
        // C = Reset
        if (event.key === 'c') triggerAction(() => resetGrid())

        // D = Toggle Dark Mode
        if (event.key === 'd') triggerAction(() => toggleTheme())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, resetGrid, toggleTheme])

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      {/* Pixel Grid */}
      <div
        ref={gridRef}
        className={clsx({
          'bg-gray-300 dark:bg-gray-700 gap-[1px]': settings.showGridLines,
        })}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${settings.gridCols}, ${settings.cellSize}px)`,
          gridTemplateRows: `repeat(${settings.gridRows}, ${settings.cellSize}px)`,
        }}
      >
        {grid.present.map((row, i) =>
          row.map((color, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => handleCellClick(i, j)}
              onMouseDown={() => handleCellClick(i, j)}
              onMouseEnter={(e) => {
                const LEFT_MOUSE = 1
                if (e.buttons === LEFT_MOUSE) {
                  handleCellClick(i, j)
                }
              }}
              style={{
                backgroundColor: color,
                width: `${settings.cellSize}px`,
                height: `${settings.cellSize}px`,
              }}
              className="cursor-pointer transition-colors select-none"
            />
          ))
        )}
      </div>

      {/* Bottom-Left Floating Toolbar */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => undo()} disabled={grid.past.length === 0}>
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => redo()} disabled={grid.future.length === 0}>
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => resetGrid()}>
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
            <ColorPicker color={settings.selectedColor} onChange={setSelectedColor} />
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
        <SettingsDialog />
      </div>
    </div>
  )
}

export default PixelGrid
