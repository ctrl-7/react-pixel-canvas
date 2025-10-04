import React, { useState } from 'react'

interface PixelGridProps {
  rows?: number
  cols?: number
}

const PixelGrid: React.FC<PixelGridProps> = ({ rows = 16, cols = 16 }) => {
  // Track the color of each cell (default: white)
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => 'white'))
  )

  // Toggle cell color on click
  const handleCellClick = (row: number, col: number) => {
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? (cell === 'white' ? 'black' : 'white') : cell))
    )
    setGrid(newGrid)
  }

  return (
    <div className="inline-block p-2 bg-gray-100 rounded-lg shadow-md">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-6 h-6 border border-gray-300 cursor-pointer transition-colors duration-200 ${
                color === 'black' ? 'bg-black' : 'bg-white'
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default PixelGrid
