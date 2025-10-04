import React, { useState } from 'react'
import ColorPicker from './ColorPicker'

interface PixelGridProps {
  rows?: number
  cols?: number
}

const PixelGrid: React.FC<PixelGridProps> = ({ rows = 16, cols = 16 }) => {
  // Track grid cells
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => '#ffffff'))
  )

  // Track selected color
  const [selectedColor, setSelectedColor] = useState<string>('#000000')

  // Toggle cell color
  const handleCellClick = (row: number, col: number) => {
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? selectedColor : cell))
    )
    setGrid(newGrid)
  }

  return (
    <div className="inline-block p-4 bg-gray-100 rounded-lg shadow-md">
      {/* Color Picker */}
      <ColorPicker color={selectedColor} onChange={setSelectedColor} />

      {/* Pixel Grid */}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-6 h-6 border border-gray-300 cursor-pointer transition-colors duration-200`}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default PixelGrid
