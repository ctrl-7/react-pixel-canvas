import React from 'react'

interface ColorPickerProps {
  color: string
  onChange: (newColor: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex items-center gap-2 flex-col">
      <input
        type="color"
        id="colorPicker"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="size-10 cursor-pointer"
      />
      <span className="text-sm">{color.toLocaleUpperCase()}</span>
    </div>
  )
}

export default ColorPicker
