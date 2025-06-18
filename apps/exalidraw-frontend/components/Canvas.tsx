// import { useEffect, useRef } from "react";
// import { RoomCanvas } from "./RoomCanvas";
// import { initDraw } from "@/draw";

// const CANVAS_SIZE = 10000;
// const MIN_ZOOM = 0.1;
// const MAX_ZOOM = 10;

// export function Canvas({
//     roomId,
//     socket
// }: {
//     roomId: string
//     socket: WebSocket
// }) {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const containerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (canvasRef.current && containerRef.current) {
//             initDraw(canvasRef.current, roomId, socket, containerRef.current);
//         }
//     }, [canvasRef, containerRef]);

//     return (
//         <div
//             ref={containerRef}
//             className="w-screen h-screen overflow-hidden"
//             style={{
//                 position: 'relative',
//             }}
//         >
//             <div
//                 className="absolute inset-0"
//                 style={{
//                     maxWidth: 15000,
//                     maxHeight: CANVAS_SIZE,
//                 }}
//             >
//                 <canvas
//                     ref={canvasRef}
//                     width={15000}
//                     height={CANVAS_SIZE}
//                     className="block"
//                 />
//             </div>
//         </div>
//     );
// }

import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { Point, Element, CanvasProps } from '../types/drawing';
import { 
  generateId, 
  distance, 
  drawRoughLine, 
  drawRoughRectangle, 
  drawRoughEllipse, 
  drawArrow,
  drawRoughStar,
  drawRoughHeart,
  drawRoughTriangle,
  drawRoughHexagon,
  drawRoughDiamond,
  isPointInElement,
  getBoundingBox,
  preRenderedShapes
} from '../utils/drawing';

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  width,
  height,
  elements,
  currentTool,
  currentColor,
  currentStrokeWidth,
  onElementsChange,
  onSelectionChange,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  editingTextId,
  onEditingTextChange,
  socket,
        roomId,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [textInputPosition, setTextInputPosition] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [moveStartPoint, setMoveStartPoint] = useState<Point | null>(null);
  const [resizeStartBox, setResizeStartBox] = useState<Point | null>(null);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: Element) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'pen':
        if (element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            const point = element.points[i];
            const prevPoint = element.points[i - 1];
            const roughness = element.strokeWidth * 0.3;
            const x = point.x + (Math.random() - 0.5) * roughness;
            const y = point.y + (Math.random() - 0.5) * roughness;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
      case 'line':
        if (element.points.length >= 2) {
          const start = element.points[0];
          const end = element.points[element.points.length - 1];
          drawRoughLine(ctx, start.x, start.y, end.x, end.y, element.strokeWidth);
        }
        break;
      case 'rectangle':
        if (element.x !== undefined && element.y !== undefined && 
            element.width !== undefined && element.height !== undefined) {
          drawRoughRectangle(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
        }
        break;
      case 'shape':
        if (element.x !== undefined && element.y !== undefined && 
            element.width !== undefined && element.height !== undefined) {
          switch (element.customShape) {
            case 'star':
              drawRoughStar(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              break;
            case 'heart':
              drawRoughHeart(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              break;
            case 'triangle':
              drawRoughTriangle(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              break;
            case 'hexagon':
              drawRoughHexagon(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              break;
            case 'diamond':
              drawRoughDiamond(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              break;
          }
        }
        break;
      case 'ellipse':
        if (element.x !== undefined && element.y !== undefined && 
            element.width !== undefined && element.height !== undefined) {
          drawRoughEllipse(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
        }
        break;
      case 'arrow':
        if (element.points.length >= 2) {
          const start = element.points[0];
          const end = element.points[element.points.length - 1];
          drawArrow(ctx, start.x, start.y, end.x, end.y, element.strokeWidth);
        }
        break;
      case 'text':
        if (element.text && element.x !== undefined && element.y !== undefined) {
          ctx.fillStyle = element.color;
          ctx.font = `${element.fontSize || 16}px Arial`;
          ctx.fillText(element.text, element.x, element.y);
        }
        break;
    }

    // Draw selection highlight
    if (element.selected) {
      const bbox = getBoundingBox(element);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(bbox.x - 5, bbox.y - 5, bbox.width + 10, bbox.height + 10);
      ctx.setLineDash([]);
    }
  }, []);

  // Add resize handles for selected elements
  const getResizeHandles = (element: Element) => {
    if (!element.selected) return [];
    const bbox = getBoundingBox(element);
    return [
      { id: 'nw', x: bbox.x, y: bbox.y },
      { id: 'ne', x: bbox.x + bbox.width, y: bbox.y },
      { id: 'sw', x: bbox.x, y: bbox.y + bbox.height },
      { id: 'se', x: bbox.x + bbox.width, y: bbox.y + bbox.height }
    ];
  };

  // Draw resize handles
  const drawResizeHandles = (ctx: CanvasRenderingContext2D, element: Element) => {
    if (!element.selected) return;
    
    const handles = getResizeHandles(element);
    handles.forEach(handle => {
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  // Check if point is in a resize handle
  const isPointInResizeHandle = (point: Point, element: Element) => {
    const handles = getResizeHandles(element);
    return handles.find(handle => 
      Math.abs(handle.x - point.x) < 8 && 
      Math.abs(handle.y - point.y) < 8
    );
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1 / zoom;
    const gridSize = 20;
    const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
    const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
    const endX = startX + (canvas.width / zoom) + gridSize;
    const endY = startY + (canvas.height / zoom) + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => {
      if (element.id !== editingTextId) {
        drawElement(ctx, element);
        if (element.selected) {
          drawResizeHandles(ctx, element);
        }
      }
    });

    // Draw current element
    if (currentElement) {
      drawElement(ctx, currentElement);
      if (currentElement.selected) {
        drawResizeHandles(ctx, currentElement);
      }
    }

    ctx.restore();
  }, [elements, currentElement, drawElement, pan, zoom, editingTextId]);

  useEffect(() => {
    render();
  }, [render]);

  const handleTextSubmit = useCallback(() => {
    if (editingTextId && textInputValue.trim()) {
      const updatedElements = elements.map(el => 
        el.id === editingTextId 
          ? { ...el, text: textInputValue.trim() }
          : el
      );
      onElementsChange(updatedElements);
    } else if (editingTextId && !textInputValue.trim()) {
      // Remove empty text element
      const updatedElements = elements.filter(el => el.id !== editingTextId);
      onElementsChange(updatedElements);
    }
    
    setTextInputPosition(null);
    setTextInputValue('');
    onEditingTextChange(null);
  }, [editingTextId, textInputValue, elements, onElementsChange, onEditingTextChange]);

  // Handle mouse down for selection and movement
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);

    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setLastPanPoint(point);
      return;
    }

    if (currentTool === 'select') {
      // Check if clicking on a resize handle first
      const clickedElement = elements.find(el => el.selected && isPointInResizeHandle(point, el));
      if (clickedElement) {
        const handle = isPointInResizeHandle(point, clickedElement);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle.id);
          setStartPoint(point);
          return;
        }
      }

      // Check if clicking on an element for movement
      const elementToMove = elements.find(el => isPointInElement(point, el));
      if (elementToMove) {
        setIsMoving(true);
        setMoveStartPoint(point);
        const newSelected = e.shiftKey 
          ? selectedElements.includes(elementToMove.id)
            ? selectedElements.filter(id => id !== elementToMove.id)
            : [...selectedElements, elementToMove.id]
          : [elementToMove.id];
        
        setSelectedElements(newSelected);
        onSelectionChange(newSelected);
        
        const updatedElements = elements.map(el => ({
          ...el,
          selected: newSelected.includes(el.id)
        }));
        onElementsChange(updatedElements);
        return;
      }

      // If clicking on empty space, deselect all
      setSelectedElements([]);
      onSelectionChange([]);
      const updatedElements = elements.map(el => ({ ...el, selected: false }));
      onElementsChange(updatedElements);
      return;
    }

    if (currentTool === 'text') {
      // Check if clicking on existing text element
      const clickedTextElement = elements.find(el => 
        el.type === 'text' && isPointInElement(point, el)
      );
      
      if (clickedTextElement) {
        // Edit existing text
        onEditingTextChange(clickedTextElement.id);
        setTextInputValue(clickedTextElement.text || '');
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          setTextInputPosition({
            x: (clickedTextElement.x || 0) * zoom + pan.x + rect.left,
            y: (clickedTextElement.y || 0) * zoom + pan.y + rect.top - (clickedTextElement.fontSize || 16)
          });
        }
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.select();
          }
        }, 0);
      } else {
        // Create new text element
        const newElement: Element = {
          id: generateId(),
          type: 'text',
          points: [point],
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          fontSize: 16,
          text: '',
          x: point.x,
          y: point.y,
        };
        
        const updatedElements = [...elements, newElement];
        onElementsChange(updatedElements);
        onEditingTextChange(newElement.id);
        setTextInputValue('');
        
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          setTextInputPosition({
            x: point.x * zoom + pan.x + rect.left,
            y: point.y * zoom + pan.y + rect.top - 16
          });
        }
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }, 0);
      }
      return;
    }

    // Handle shape tools
    if (currentTool.startsWith('shape-')) {
      const shapeId = currentTool.replace('shape-', '');
      const shape = preRenderedShapes.find(s => s.id === shapeId);
      if (shape) {
        setIsDrawing(true);
        setStartPoint(point);
        
        const newElement = shape.create(point, currentColor, currentStrokeWidth);
        newElement.width = 0;
        newElement.height = 0;
        setCurrentElement(newElement);
        return;
      }
    }

    setIsDrawing(true);
    setStartPoint(point);

    const newElement: Element = {
      id: generateId(),
      type: currentTool as Element['type'],
      points: [point],
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    };

    if (currentTool === 'rectangle' || currentTool === 'ellipse') {
      newElement.x = point.x;
      newElement.y = point.y;
      newElement.width = 0;
      newElement.height = 0;
    }

    setCurrentElement(newElement);
  };

  // Handle mouse move for movement and resizing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);

    if (isPanning && lastPanPoint) {
      const deltaX = (point.x - lastPanPoint.x) * zoom;
      const deltaY = (point.y - lastPanPoint.y) * zoom;
      onPanChange({ x: pan.x + deltaX, y: pan.y + deltaY });
      return;
    }

    if (isMoving && moveStartPoint) {
      const deltaX = point.x - moveStartPoint.x;
      const deltaY = point.y - moveStartPoint.y;
      
      const updatedElements = elements.map(el => {
        if (el.selected) {
          return {
            ...el,
            x: (el.x || 0) + deltaX,
            y: (el.y || 0) + deltaY,
            points: el.points?.map(p => ({
              x: p.x + deltaX,
              y: p.y + deltaY
            }))
          };
        }
        return el;
      });
      
      onElementsChange(updatedElements);
      setMoveStartPoint(point);
      return;
    }

    if (isResizing && startPoint && resizeHandle) {
      const selectedElement = elements.find(el => el.selected);
      if (selectedElement) {
        const deltaX = point.x - startPoint.x;
        const deltaY = point.y - startPoint.y;
        
        let newWidth = selectedElement.width || 0;
        let newHeight = selectedElement.height || 0;
        let newX = selectedElement.x || 0;
        let newY = selectedElement.y || 0;

        switch (resizeHandle) {
          case 'se':
            newWidth += deltaX;
            newHeight += deltaY;
            break;
          case 'sw':
            newWidth -= deltaX;
            newHeight += deltaY;
            newX += deltaX;
            break;
          case 'ne':
            newWidth += deltaX;
            newHeight -= deltaY;
            newY += deltaY;
            break;
          case 'nw':
            newWidth -= deltaX;
            newHeight -= deltaY;
            newX += deltaX;
            newY += deltaY;
            break;
        }

        const updatedElement = {
          ...selectedElement,
          x: newX,
          y: newY,
          width: Math.max(10, newWidth),
          height: Math.max(10, newHeight)
        };

        const updatedElements = elements.map(el =>
          el.id === selectedElement.id ? updatedElement : el
        );
        
        onElementsChange(updatedElements);
        setStartPoint(point);
      }
      return;
    }

    if (!isDrawing || !currentElement || !startPoint) return;

    const updatedElement = { ...currentElement };

    if (currentTool === 'pen') {
      updatedElement.points = [...updatedElement.points, point];
    } else if (currentTool === 'rectangle' || currentTool === 'ellipse' || currentTool.startsWith('shape-')) {
      updatedElement.x = Math.min(startPoint.x, point.x);
      updatedElement.y = Math.min(startPoint.y, point.y);
      updatedElement.width = Math.abs(point.x - startPoint.x);
      updatedElement.height = Math.abs(point.y - startPoint.y);
    } else {
      updatedElement.points = [startPoint, point];
    }

    setCurrentElement(updatedElement);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isMoving) {
      elements.filter((el: Element) => el.selected).forEach((el: Element) => {
        if (socket && roomId) {
          socket.send(JSON.stringify({
            type: "update_shape",
            roomId,
            shape: el,
            chatId: el.chatId || undefined
          }));
        }
      });
    }
    if (isResizing) {
      elements.filter((el: Element) => el.selected).forEach((el: Element) => {
        if (socket && roomId) {
          socket.send(JSON.stringify({
            type: "update_shape",
            roomId,
            shape: el,
            chatId: el.chatId || undefined
          }));
        }
      });
    }
    setIsMoving(false);
    setIsResizing(false);
    setResizeHandle(null);
    setMoveStartPoint(null);
    setResizeStartBox(null);

    setIsDrawing(false);
    setIsPanning(false);
    if (currentElement) {
      onElementsChange([...elements, currentElement]);
      if (socket && roomId) {
        if (currentTool === 'select') {
          // Send update_shape only when select tool is active
          socket.send(JSON.stringify({
            type: "update_shape",
            roomId,
            shape: currentElement,
            chatId: currentElement.chatId || undefined
          }));
        } else {
          // Send chat message for new shapes
          socket.send(JSON.stringify({
            type: "chat",
            roomId,
            message: JSON.stringify(currentElement)
          }));
        }
      }
    }
    setCurrentElement(null);
    setStartPoint(null);
  };

  // Add WebSocket message handler
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "shape_updated") {
          let found = false;
          const updatedElements = elements.map(el => {
            if (el.id === data.shape.id) {
              found = true;
              return data.shape;
            }
            return el;
          });
          if (!found) {
            updatedElements.push(data.shape);
          }
          onElementsChange(updatedElements);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, elements, onElementsChange]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    onZoomChange(newZoom);
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setTextInputPosition(null);
      setTextInputValue('');
      onEditingTextChange(null);
    }
  };
    
    return (
    <div className="relative">
      <canvas
        ref={ref}
        width={width}
        height={height}
        className="cursor-crosshair bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      />
      
      {/* Dynamic Text Input */}
      {textInputPosition && (
        <input
          ref={textInputRef}
          type="text"
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          onBlur={handleTextSubmit}
          onKeyDown={handleTextInputKeyDown}
          className="absolute border-2 border-blue-400 bg-white outline-none px-2 py-1 rounded"
          style={{
            left: textInputPosition.x,
            top: textInputPosition.y,
            fontSize: `${16 * zoom}px`,
            color: currentColor,
            fontFamily: 'Arial',
            minWidth: '100px',
            zIndex: 1000,
          }}
          placeholder="Type here..."
        />
      )}
        </div>
      );
});