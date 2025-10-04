import React from "react";

const PixelGrid: React.FC = () => {
  // Render empty 16x16 grid for now
  const size = 16;
  const cells = Array.from({ length: size * size });

  return (
    <div className="grid grid-cols-16 gap-1 bg-gray-300 p-2">
      {cells.map((_, idx) => (
        <div
          key={idx}
          className="w-5 h-5 bg-white border border-gray-200"
        />
      ))}
    </div>
  );
};

export default PixelGrid;
