"use client"

import { useEffect,useRef,useState } from "react"
import { initDraw } from "@/draw"
import { WS_URL } from "@repo/backend-common/config"
import { Canvas } from "./Canvas"
import { useDrawing } from "@/hooks/useDrawing"
import { Toolbar } from './Toolbar';
import { ExportModal } from "./ExportModal"
export function RoomCanvas({roomId}:{roomId:string}){


    const [socket,setSocket]=useState<WebSocket|null>(null)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [showExportModal, setShowExportModal] = useState(false);
    useEffect(() => {
        const updateCanvasSize = () => {
          setCanvasSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };
    
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
      }, []);
    

    const canvasRef = useRef<HTMLCanvasElement>(null!);
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

      const handleExport = () => {
        setShowExportModal(true);
      };


    
    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5YzJmYzU1NS1hMTNjLTRjNDYtOGRjNy1iNmZiODZmMDk5OTciLCJpYXQiOjE3NTAwODM1Mjl9.wYCf0X3IaB6jP_PDoJpAabDJPdRVprFO6TUkochqvBQ`)
        ws.onopen=()=>{
            setSocket(ws)

            ws.send(JSON.stringify({
                type:"join_room",
                roomId:roomId
            }))
        }
    },[])


    if(socket==null){
        return <div>
            connecting to server
        </div>
    }


    return <div>
        {/* <Canvas roomId={roomId} socket={socket}/> */}
             <Canvas
        ref={canvasRef}
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
      />
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
        {/* Status Bar */}
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Elements: {elements.length}</span>
          <span>Tool: {currentTool}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600 max-w-xs">
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

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        elements={elements}
        canvasRef={canvasRef}
      />

    </div>


}