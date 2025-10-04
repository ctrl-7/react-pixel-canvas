import React, { useReducer, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toPng } from 'html-to-image'

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

const GRID_SIZE_DEFAULT = 16

const createEmptyGrid = (rows: number, cols: number) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => '#ffffff'))

const gridReducer = (state: GridState, action: Action): GridState => {
  switch (action.type) {
    case 'PAINT': {
      const { row, col, color } = action
      const newPresent = state.present.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? color : cell))
      )
      return {
        past: [...state.past, state.present],
        present: newPresent,
        future: [],
      }
    }
    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, state.past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      }
    }
    case 'RESET': {
      const emptyGrid = createEmptyGrid(GRID_SIZE_DEFAULT, GRID_SIZE_DEFAULT)
      return { past: [...state.past, state.present], present: emptyGrid, future: [] }
    }
    default:
      return state
  }
}

const PixelGrid: React.FC<PixelGridProps> = ({
  rows = GRID_SIZE_DEFAULT,
  cols = GRID_SIZE_DEFAULT,
}) => {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [state, dispatch] = useReducer(gridReducer, {
    past: [],
    present: createEmptyGrid(rows, cols),
    future: [],
  })

  const gridRef = useRef<HTMLDivElement>(null)

  const handleCellClick = (row: number, col: number) => {
    dispatch({ type: 'PAINT', row, col, color: selectedColor })
  }

  const handleExport = () => {
    if (!gridRef.current) return
    toPng(gridRef.current)
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'pixel-art.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => console.error('Export failed:', err))
  }

  return (
    <Card className="inline-block p-4 bg-gray-50 shadow-lg">
      <CardHeader>
        <h2 className="text-lg font-semibold">Pixel Art Grid</h2>
      </CardHeader>

      <CardContent>
        {/* Color Picker */}
        <ColorPicker color={selectedColor} onChange={setSelectedColor} />

        {/* Toolbar */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={state.past.length === 0}
          >
            Undo
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={state.future.length === 0}
          >
            Redo
          </Button>

          {/* Clear Canvas with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Clear</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset the entire grid to white. You can undo if you change your mind.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2 justify-end mt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => dispatch({ type: 'RESET' })}>
                  Confirm
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleExport}>Export as PNG</Button>
        </div>

        {/* Pixel Grid */}
        <div ref={gridRef}>
          {state.present.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((color, colIndex) => (
                <div
                  key={colIndex}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className="w-6 h-6 border border-gray-300 cursor-pointer transition-colors duration-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PixelGrid
