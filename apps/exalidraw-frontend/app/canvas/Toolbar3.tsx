import React from "react";

interface Toolbar3Props {
  currentTool: string;
  currentColor: string;
  currentStrokeWidth: number;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export function Toolbar3({
  currentTool,
  currentColor,
  currentStrokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange
}: Toolbar3Props) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 px-6 py-3 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/30">
      {/* Tool buttons */}
      <label htmlFor="tool-select" className="sr-only">Tool</label>
      <select
        id="tool-select"
        title="Tool"
        value={currentTool}
        onChange={e => onToolChange(e.target.value)}
        className="rounded px-2 py-1 bg-white/80"
      >
        <option value="select">Select</option>
        <option value="pen">Pen</option>
        <option value="line">Line</option>
        <option value="rectangle">Rectangle</option>
        <option value="ellipse">Ellipse</option>
        <option value="arrow">Arrow</option>
        <option value="text">Text</option>
        <option value="shape">Shape</option>
      </select>
      {/* Color picker */}
      <label htmlFor="color-picker" className="sr-only">Stroke Color</label>
      <input
        id="color-picker"
        title="Stroke Color"
        type="color"
        value={currentColor}
        onChange={e => onColorChange(e.target.value)}
        className="w-8 h-8 rounded-full border border-gray-300"
      />
      {/* Stroke width */}
      <label htmlFor="stroke-width" className="sr-only">Stroke Width</label>
      <input
        id="stroke-width"
        title="Stroke Width"
        type="range"
        min={1}
        max={10}
        value={currentStrokeWidth}
        onChange={e => onStrokeWidthChange(Number(e.target.value))}
      />
    </div>
  );
} 