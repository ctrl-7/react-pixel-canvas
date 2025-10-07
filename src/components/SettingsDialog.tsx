import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Moon, Settings, Sun, Upload, X as XIcon, EyeClosed, Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type { Action, GridState } from './PixelGrid'

interface SettingsDialogProps {
  darkMode: boolean
  toggleDarkMode: () => void
  showGridLines: boolean
  toggleGridLines: () => void
  gridRows: number
  setGridRows: (rows: number) => void
  gridCols: number
  setGridCols: (cols: number) => void
  cellSize: number
  setCellSize: (size: number) => void
  defaultCellColor: string
  setDefaultCellColor: (color: string) => void
  selectedColor: string
  setSelectedColor: (color: string) => void
  dispatch: React.Dispatch<Action>
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  showGridLines,
  toggleGridLines,
  darkMode,
  toggleDarkMode,
  gridRows,
  setGridRows,
  gridCols,
  setGridCols,
  cellSize,
  setCellSize,
  defaultCellColor,
  setDefaultCellColor,
  selectedColor,
  setSelectedColor,
  dispatch,
}) => {
  const [open, setOpen] = useState(false)

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pixelgrid-settings')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.gridRows) setGridRows(data.gridRows)
      if (data.gridCols) setGridCols(data.gridCols)
      if (data.cellSize) setCellSize(data.cellSize)
      if (data.defaultCellColor) setDefaultCellColor(data.defaultCellColor)
      if (data.selectedColor) setSelectedColor(data.selectedColor)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      gridRows,
      gridCols,
      cellSize,
      defaultCellColor,
      selectedColor,
      darkMode,
    }
    localStorage.setItem('pixelgrid-settings', JSON.stringify(settings))
  }, [gridRows, gridCols, cellSize, defaultCellColor, selectedColor, darkMode])

  const handleLoadJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string
          const gridState = JSON.parse(jsonString) as GridState
          dispatch({ type: 'LOAD_STATE', state: gridState })
        } catch (error) {
          console.error('Failed to load JSON:', error)
          alert('Invalid JSON file format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Settings />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="">
        <AlertDialogHeader>
          <AlertDialogTitle>Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Configure your PixelGrid preferences below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <Button onClick={toggleDarkMode}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>

          {/* Grid Lines Toggle */}
          <div className="flex items-center justify-between">
            <span>Grid Lines</span>
            <Button onClick={toggleGridLines}>
              {showGridLines ? <EyeClosed size={16} /> : <Eye size={16} />}
            </Button>
          </div>

          {/* Grid Rows */}
          <div className="flex items-center justify-between">
            <span>Grid Rows</span>
            <input
              type="number"
              min={1}
              value={gridRows}
              onChange={(e) => setGridRows(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Grid Columns */}
          <div className="flex items-center justify-between">
            <span>Grid Columns</span>
            <input
              type="number"
              min={1}
              value={gridCols}
              onChange={(e) => setGridCols(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Cell Size */}
          <div className="flex items-center justify-between">
            <span>Cell Size (px)</span>
            <input
              type="number"
              min={4}
              value={cellSize}
              onChange={(e) => setCellSize(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Default Cell Color */}
          <div className="flex items-center justify-between">
            <span>Default Cell Color</span>
            <div className="flex items-center gap-2">
              <span>{defaultCellColor.toLocaleUpperCase()}</span>
              <input
                type="color"
                value={defaultCellColor}
                onChange={(e) => setDefaultCellColor(e.target.value)}
                className="w-20 h-10 border rounded"
              />
            </div>
          </div>

          {/* Selected Color */}
          <div className="flex items-center justify-between">
            <span>Selected Color</span>
            <div className="flex items-center gap-2">
              <span>{selectedColor.toLocaleUpperCase()}</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-20 h-10 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Load from JSON</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleLoadJSON}>
              <Upload />
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <AlertDialogFooter className="absolute right-4 top-4">
          <Button className="cursor-pointer" onClick={() => setOpen(false)} variant="outline">
            <XIcon />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default SettingsDialog
