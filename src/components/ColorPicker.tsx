import React from 'react'

interface ColorPickerProps {
  color: string
  onChange: (newColor: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <label htmlFor="colorPicker" className="font-medium">
        Pick Color:
      </label>
      <input
        type="color"
        id="colorPicker"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 cursor-pointer border border-gray-300 rounded"
      />
      <span className="text-sm">{color}</span>
    </div>
  )
}

export default ColorPicker
