import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
}


const presetColors = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
];

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
        {presetColors.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-transform transform hover:scale-110 ${
              color.toLowerCase() === preset.toLowerCase()
                ? 'border-blue-500 scale-110'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: preset }}
            title={preset}
          />
        ))}
        <div 
          className="relative w-8 h-8 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center"
          title="Custom Color"
        >
          <input
            type="color"
            id="colorPicker"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full cursor-pointer opacity-0 absolute inset-0"
          />
           <div 
                className="w-6 h-6 rounded-full"
                style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
            ></div>
        </div>
      </div>
       <span className="text-xs font-mono p-1 px-2 bg-gray-200 dark:bg-gray-700 rounded-full">{color.toLocaleUpperCase()}</span>
    </div>
  );
};

export default ColorPicker;
