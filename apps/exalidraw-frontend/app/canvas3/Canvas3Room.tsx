"use client";
import React, { useEffect, useRef, useState } from "react";
import { WS_URL, HTTP_URL } from "@repo/backend-common/config";
import { Canvas3 } from "./Canvas3";
import { Toolbar } from "@/components/Toolbar";
import { ExportModal } from "@/components/ExportModal";
import { useDrawing } from "@/hooks/useDrawing";
import axios from "axios";

// Sidebar UI constants
const pageTypes = [
  { id: "blank", label: "Blank", icon: <span className="w-5 h-5 rounded bg-gray-200 border" /> },
  { id: "lined", label: "Lined", icon: <svg width="20" height="20"><line x1="0" y1="5" x2="20" y2="5" stroke="#60a5fa" strokeWidth="2"/><line x1="0" y1="10" x2="20" y2="10" stroke="#60a5fa" strokeWidth="2"/><line x1="0" y1="15" x2="20" y2="15" stroke="#60a5fa" strokeWidth="2"/></svg> },
  { id: "columned", label: "Columned", icon: <svg width="20" height="20"><rect x="3" y="3" width="4" height="14" fill="#60a5fa"/><rect x="8" y="3" width="4" height="14" fill="#a5b4fc"/><rect x="13" y="3" width="4" height="14" fill="#60a5fa"/></svg> },
  { id: "boxed", label: "Boxed", icon: <svg width="20" height="20"><rect x="3" y="3" width="14" height="14" rx="2" fill="#fbbf24" stroke="#f59e42" strokeWidth="2"/><rect x="6" y="6" width="8" height="8" rx="1" fill="#fff" stroke="#f59e42" strokeWidth="1.5"/></svg> },
];
const bgColors = [
  "#ffffff", "#f3f4f6", "#e0e7ef", "#fef9c3", "#fee2e2", "#d1fae5", "#f0abfc", "#000000"
];
const lineColors = [
  "#60a5fa", "#a5b4fc", "#f59e42", "#f43f5e", "#22d3ee", "#10b981", "#fbbf24", "#000000", "#fff"
];

export function Canvas3Room({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showExportModal, setShowExportModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [instructionsVisible, setInstructionsVisible] = useState(true);
  const [selectedPageType, setSelectedPageType] = useState("blank");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#60a5fa");
  const [strokeType, setStrokeType] = useState<'rough' | 'normal'>('rough');

  // Use the existing useDrawing hook for state management
  const {
    elements,
    currentTool,
    currentColor,
    currentStrokeWidth,
    selectedElements,
    zoom,
    pan,
    editingTextId,
    setElements,
    setCurrentTool,
    setCurrentColor,
    setCurrentStrokeWidth,
    setSelectedElements,
    setZoom,
    setPan,
    setEditingTextId,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDrawing();

  // Handle canvas size updates
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // WebSocket connection and room join
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/signin';
      return;
    }
    const ws = new WebSocket(`${WS_URL}/?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        setElements(prev => [...prev, parsedShape]);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    async function fetchInitialShapes() {
      try {
        const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
        const messages = res.data.messages;
        console.log(res)
        const shapes = messages.map((x: any) => {
          const parsedMessage = JSON.parse(x.message);
          return {
            ...parsedMessage,
            chatId: x.id
          };
        });
        
        console.log(shapes)
        setElements(shapes);
      } catch (err) {
        console.error("Failed to fetch initial shapes", err);
      }
    }
    if (roomId) fetchInitialShapes();
  }, [roomId]);

  const handleExport = () => {
    setShowExportModal(true);
  };

  if (!socket) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Hamburger Button for Sidebar */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 border border-gray-200 shadow hover:bg-gray-100 transition-all"
        onClick={() => setSidebarOpen((v) => !v)}
        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="7" width="16" height="2" rx="1" fill="#555" />
          <rect x="4" y="11" width="16" height="2" rx="1" fill="#555" />
          <rect x="4" y="15" width="16" height="2" rx="1" fill="#555" />
        </svg>
      </button>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-full flex flex-col items-center py-8 px-2 bg-white/80 shadow-lg z-40 rounded-tr-2xl rounded-br-2xl border-r border-gray-200 w-56 transition-all duration-300">
          {/* Hide Sidebar Button */}
          <button
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-sm"
            onClick={() => setSidebarOpen(false)}
            title="Hide Sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke="#555" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          {/* Panel Toggles - move just below close button */}
          
          <div className="flex flex-col gap-8 mt-10 w-full">
            {/* Page Type */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 pl-2">Page Type</div>
              <div className="flex flex-col gap-2">
                {pageTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPageType(type.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm w-full ${selectedPageType === type.id ? "bg-blue-100 border-blue-400 text-blue-700" : "hover:bg-gray-100 border-gray-200 text-gray-600"}`}
                    title={type.label}
                  >
                    <span>{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Background Color */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 pl-2">Background Color</div>
              <div className="flex flex-wrap gap-2 px-2">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${bgColor === color ? "border-blue-500 scale-110" : "border-gray-300 hover:border-gray-400"}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            {/* Line Color (for Lined, Columned, Boxed) */}
            {(selectedPageType === "lined" || selectedPageType === "columned" || selectedPageType === "boxed") && (
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 pl-2">Line Color</div>
                <div className="flex flex-wrap gap-2 px-2 mb-2">
                  {lineColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setLineColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${lineColor === color ? "border-blue-500 scale-110" : "border-gray-300 hover:border-gray-400"}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Rough/Normal Stroke Toggle */}
            <div className="px-2">
              <button
                className={`w-full px-4 py-2 rounded-lg shadow-md border font-semibold transition-all duration-200 ${strokeType === 'rough' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setStrokeType(strokeType === 'rough' ? 'normal' : 'rough')}
              >
                {strokeType === 'rough' ? 'Rough Stroke' : 'Normal Stroke'}
              </button>
            </div>
            <div className="flex flex-col gap-2 px-2 mt-4 mb-6 w-full">
            <div className="text-xs font-semibold text-gray-500 mb-1 pl-1">Panels</div>
            <button
              className="w-full px-3 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
              onClick={() => setToolbarVisible((v) => !v)}
            >
              {toolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
            </button>
            <button
              className="w-full px-3 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
              onClick={() => setInstructionsVisible((v) => !v)}
            >
              {instructionsVisible ? 'Hide Instructions' : 'Show Instructions'}
            </button>
            <button
              className="w-full px-3 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
              onClick={() => setRightPanelVisible((v) => !v)}
            >
              {rightPanelVisible ? 'Hide Info Panel' : 'Show Info Panel'}
            </button>
          </div>
          </div>
        </div>
      )}
      {/* Top Toolbar */}
      {toolbarVisible && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Toolbar
            currentTool={currentTool}
            currentColor={currentColor}
            currentStrokeWidth={currentStrokeWidth}
            onToolChange={setCurrentTool}
            onColorChange={setCurrentColor}
            onStrokeWidthChange={setCurrentStrokeWidth}
            onUndo={undo}
            onRedo={redo}
            onExport={handleExport}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      )}
      {/* Right Info/Status Panel */}
      {rightPanelVisible && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600 z-50">
          <div className="flex items-center gap-4">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>Elements: {elements.length}</span>
            <span>Tool: {currentTool}</span>
          </div>
        </div>
      )}
      <Canvas3
        ref={(node) => { canvasRef.current = node; }}
        width={canvasSize.width}
        height={canvasSize.height}
        elements={elements}
        currentTool={currentTool}
        currentColor={currentColor}
        currentStrokeWidth={currentStrokeWidth}
        onElementsChange={setElements}
        onSelectionChange={setSelectedElements}
        zoom={zoom}
        pan={pan}
        onZoomChange={setZoom}
        onPanChange={setPan}
        editingTextId={editingTextId}
        onEditingTextChange={setEditingTextId}
        socket={socket}
        roomId={roomId}
        strokeType={strokeType}
        selectedPageType={selectedPageType}
        bgColor={bgColor}
        lineColor={lineColor}
      />

      {/* Instructions */}
      {instructionsVisible && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600 max-w-xs z-50">
          <div className="space-y-1">
          <div><strong>Mouse:</strong> Draw with left click</div>
          <div><strong>Text:</strong> Click to add/edit text</div>
          <div><strong>Shapes:</strong> Click shapes dropdown, then drag to resize</div>
          <div><strong>Pan:</strong> Ctrl + drag or middle mouse</div>
          <div><strong>Zoom:</strong> Mouse wheel</div>
          <div><strong>Undo:</strong> Ctrl+Z</div>
          <div><strong>Redo:</strong> Ctrl+Y</div>
        </div>
      </div>
)}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        elements={elements}
        canvasRef={canvasRef}
      />
    </div>
  );
} 