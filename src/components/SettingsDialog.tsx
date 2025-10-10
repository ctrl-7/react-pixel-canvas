import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Sun, Moon, X as XIcon, Settings, EyeClosed, Eye } from 'lucide-react'
import { useCanvasStore } from '@/store/canvasStore'
import { useThemeStore } from '@/store/themeStore'

const SettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false)

  // Zustand stores
  const settings = useCanvasStore((state) => state.settings)
  const setGridRows = useCanvasStore((state) => state.setGridRows)
  const setGridCols = useCanvasStore((state) => state.setGridCols)
  const setCellSize = useCanvasStore((state) => state.setCellSize)
  const setDefaultCellColor = useCanvasStore((state) => state.setDefaultCellColor)
  const setSelectedColor = useCanvasStore((state) => state.setSelectedColor)
  const toggleGridLines = useCanvasStore((state) => state.toggleGridLines)

  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

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
            <Button onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>

          {/* Grid Lines Toggle */}
          <div className="flex items-center justify-between">
            <span>Grid Lines</span>
            <Button onClick={toggleGridLines}>
              {settings.showGridLines ? <EyeClosed size={16} /> : <Eye size={16} />}
            </Button>
          </div>

          {/* Grid Rows */}
          <div className="flex items-center justify-between">
            <span>Grid Rows</span>
            <input
              type="number"
              min={1}
              value={settings.gridRows}
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
              value={settings.gridCols}
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
              value={settings.cellSize}
              onChange={(e) => setCellSize(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Default Cell Color */}
          <div className="flex items-center justify-between">
            <span>Default Cell Color</span>
            <div className="flex items-center gap-2">
              <span>{settings.defaultCellColor.toLocaleUpperCase()}</span>
              <input
                type="color"
                value={settings.defaultCellColor}
                onChange={(e) => setDefaultCellColor(e.target.value)}
                className="w-20 h-10 border rounded"
              />
            </div>
          </div>

          {/* Selected Color */}
          <div className="flex items-center justify-between">
            <span>Selected Color</span>
            <div className="flex items-center gap-2">
              <span>{settings.selectedColor.toLocaleUpperCase()}</span>
              <input
                type="color"
                value={settings.selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-20 h-10 border rounded"
              />
            </div>
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
