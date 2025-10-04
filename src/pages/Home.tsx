import React from "react";
import PixelGrid from "@/components/PixelGrid";

const Home: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 w-full flex-1 py-10 lg:py-20">
      <h1 className="text-3xl font-bold">React Pixel Canvas</h1>
      <PixelGrid />
    </div>
  );
};

export default Home;
