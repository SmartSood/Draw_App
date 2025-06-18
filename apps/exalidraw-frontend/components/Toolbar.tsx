import React, { useState } from 'react';
import { 
  Mouse, 
  Edit3, 
  Minus, 
  Square, 
  Circle, 
  ArrowRight, 
  Type,
  Undo,
  Redo,
  Download,
  Palette,
  ChevronDown,
  Shapes
} from 'lucide-react';
import { preRenderedShapes } from '../utils/drawing';

interface ToolbarProps {
  currentTool: string;
  currentColor: string;
  currentStrokeWidth: number;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools = [
  { id: 'select', icon: Mouse, label: 'Select' },
  { id: 'pen', icon: Edit3, label: 'Pen' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'text', icon: Type, label: 'Text' },
];

const colors = [
  '#000000', '#e74c3c', '#3498db', '#2ecc71', 
  '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'
];

const strokeWidths = [1, 2, 4, 8];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  currentColor,
  currentStrokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onExport,
  canUndo,
  canRedo,
}) => {
  const [showShapes, setShowShapes] = useState(false);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          {/* Tools */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    currentTool === tool.id
                      ? 'bg-blue-100 text-blue-600 shadow-sm'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={tool.label}
                >
                  <Icon size={18} />
                </button>
              );
            })}
            
            {/* Shapes Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShapes(!showShapes)}
                className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                  currentTool.startsWith('shape-')
                    ? 'bg-blue-100 text-blue-600 shadow-sm'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Shapes"
              >
                <Shapes size={18} />
                <ChevronDown size={12} />
              </button>
              
              {showShapes && (
                <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]">
                  <div className="grid grid-cols-2 gap-1">
                    {preRenderedShapes.map((shape) => {
                      const Icon = shape.icon;
                      return (
                        <button
                          key={shape.id}
                          onClick={() => {
                            onToolChange(`shape-${shape.id}`);
                            setShowShapes(false);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
                            currentTool === `shape-${shape.id}`
                              ? 'bg-blue-100 text-blue-600'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon size={16} />
                          {shape.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            <div className="relative">
              <Palette size={16} className="text-gray-500 mr-2" />
            </div>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  currentColor === color
                    ? 'border-gray-400 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            {strokeWidths.map((width) => (
              <button
                key={width}
                onClick={() => onStrokeWidthChange(width)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentStrokeWidth === width
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={`Stroke width: ${width}px`}
              >
                <div
                  className="bg-current rounded-full"
                  style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-all duration-200 ${
                canUndo
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-all duration-200 ${
                canRedo
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </button>
            <button
              onClick={onExport}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200"
              title="Export"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};