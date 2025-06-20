import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Element } from '../types/drawing';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: Element[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  elements,
  canvasRef,
}) => {
  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(elements, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'drawing.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Export Drawing</h2>
          <button
            title='jdsenik'
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={exportAsPNG}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={20} className="text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Export as PNG</div>
              <div className="text-sm text-gray-500">Download as image file</div>
            </div>
          </button>
          
          <button
            onClick={exportAsJSON}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText size={20} className="text-green-600" />
            <div className="text-left">
              <div className="font-medium">Export as JSON</div>
              <div className="text-sm text-gray-500">Save drawing data</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};