import React, { useRef, useEffect, useState, useCallback } from "react";
import { Element, Point } from "@/types/drawing";
import { drawRoughLine, drawRoughRectangle, drawRoughEllipse, drawArrow, drawRoughStar, drawRoughHeart, drawRoughTriangle, drawRoughHexagon, drawRoughDiamond, isPointInElement, getBoundingBox } from "@/utils/drawing";

const CANVAS_SIZE = 10000;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_SENSITIVITY = 0.01;
const PAN_SPEED = 1.5;
const HANDLE_SIZE = 8;

// Accept all relevant props for collaborative drawing
export const Canvas3 = React.forwardRef<HTMLCanvasElement, any>(({
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
  strokeType,
  selectedPageType,
  bgColor,
  lineColor
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [textInputPosition, setTextInputPosition] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [moveStartPoint, setMoveStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [resizeStartBox, setResizeStartBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Combine refs
  const combinedRef = (node: HTMLCanvasElement) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
    canvasRef.current = node;
  };

  const screenToWorld = useCallback((x: number, y: number): [number, number] => {
    return [
      (x - pan.x) / zoom,
      (y - pan.y) / zoom
    ];
  }, [pan, zoom]);

  const worldToScreen = useCallback((x: number, y: number): [number, number] => {
    return [
      x * zoom + pan.x,
      y * zoom + pan.y
    ];
  }, [pan, zoom]);

  const clampCamera = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(0, containerRect.width - width * zoom);
    const minY = Math.min(0, containerRect.height - height * zoom);
    const clampedX = Math.max(minX, Math.min(0, pan.x));
    const clampedY = Math.max(minY, Math.min(0, pan.y));
    if (clampedX !== pan.x || clampedY !== pan.y) {
      onPanChange({ x: clampedX, y: clampedY });
    }
  }, []);

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: Element) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (element.type) {
      case "pen":
        if (element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            const point = element.points[i];
            if (strokeType === 'rough') {
              const roughness = element.strokeWidth * 0.3;
              const x = point.x + (Math.random() - 0.5) * roughness;
              const y = point.y + (Math.random() - 0.5) * roughness;
              ctx.lineTo(x, y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.stroke();
        }
        break;
      case "line":
        if (element.points.length >= 2) {
          const start = element.points[0];
          const end = element.points[element.points.length - 1];
          if (strokeType === 'rough') {
            drawRoughLine(ctx, start.x, start.y, end.x, end.y, element.strokeWidth);
          } else {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        }
        break;
      case "rectangle":
        if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
          if (strokeType === 'rough') {
            drawRoughRectangle(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
          } else {
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          }
        }
        break;
      case "shape":
        if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
          switch (element.customShape) {
            case "star":
              if (strokeType === 'rough') {
                drawRoughStar(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              } else {
                // Draw a normal star (fallback: use rough for now)
                drawRoughStar(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              }
              break;
            case "heart":
              if (strokeType === 'rough') {
                drawRoughHeart(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              } else {
                drawRoughHeart(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              }
              break;
            case "triangle":
              if (strokeType === 'rough') {
                drawRoughTriangle(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              } else {
                drawRoughTriangle(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              }
              break;
            case "hexagon":
              if (strokeType === 'rough') {
                drawRoughHexagon(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              } else {
                drawRoughHexagon(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              }
              break;
            case "diamond":
              if (strokeType === 'rough') {
                drawRoughDiamond(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              } else {
                drawRoughDiamond(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
              }
              break;
          }
        }
        break;
      case "ellipse":
        if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
          if (strokeType === 'rough') {
            drawRoughEllipse(ctx, element.x, element.y, element.width, element.height, element.strokeWidth);
          } else {
            ctx.beginPath();
            ctx.ellipse(
              element.x + element.width / 2,
              element.y + element.height / 2,
              Math.abs(element.width / 2),
              Math.abs(element.height / 2),
              0,
              0,
              2 * Math.PI
            );
            ctx.stroke();
          }
        }
        break;
      case "arrow":
        if (element.points.length >= 2) {
          const start = element.points[0];
          const end = element.points[element.points.length - 1];
          if (strokeType === 'rough') {
            drawArrow(ctx, start.x, start.y, end.x, end.y, element.strokeWidth);
          } else {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            drawNormalArrowhead(ctx, start, end, 16);
          }
        }
        break;
      case "text":
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
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(bbox.x - 5, bbox.y - 5, bbox.width + 10, bbox.height + 10);
      ctx.setLineDash([]);
    }
  }, [strokeType]);

  // Helper to render canvas backgrounds
  const renderBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    // Fill background
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgColor || "#fff";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y);
    const gridGap = 32;
    const visibleLeft = -pan.x / zoom;
    const visibleTop = -pan.y / zoom;
    const visibleRight = visibleLeft + width / zoom;
    const visibleBottom = visibleTop + height / zoom;

    // Helper to get RGBA color with alpha for grid lines
    function getGridLineColor(color: string) {
      if (color === '#fff' || color === '#ffffff') return 'rgba(255,255,255,0.25)';
      if (color.startsWith('#')) {
        // Convert hex to rgb
        const hex = color.replace('#', '');
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r},${g},${b},0.2)`;
      }
      return color;
    }
    const gridLineColor = getGridLineColor(lineColor || "#60a5fa");

    if (selectedPageType === "lined" || selectedPageType === "boxed") {
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1 / zoom;
      // Draw horizontal lines
      let startY = Math.floor(visibleTop / gridGap) * gridGap;
      for (let y = startY; y < visibleBottom; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(visibleLeft, y);
        ctx.lineTo(visibleRight, y);
        ctx.stroke();
      }
    }
    if (selectedPageType === "columned" || selectedPageType === "boxed") {
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1 / zoom;
      // Draw vertical lines
      let startX = Math.floor(visibleLeft / gridGap) * gridGap;
      for (let x = startX; x < visibleRight; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, visibleTop);
        ctx.lineTo(x, visibleBottom);
        ctx.stroke();
      }
    }
    ctx.restore();
  }, [width, height, zoom, pan, selectedPageType, bgColor, lineColor]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderBackground(ctx);
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y);

    elements.forEach((element: Element) => {
      drawElement(ctx, element);
      if (element.selected) {
        // Draw selection box
        if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
          ctx.save();
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(element.x - 5, element.y - 5, element.width + 10, element.height + 10);
          ctx.setLineDash([]);
          ctx.restore();
          // Draw resize handles
          getResizeHandles(element).forEach((handle: { id: string; x: number; y: number }) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, HANDLE_SIZE, 0, 2 * Math.PI);
            ctx.fillStyle = '#3b82f6';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          });
        }
      }
    });

    if (isDrawing && currentElement) {
      drawElement(ctx, currentElement);
    }

    ctx.restore();
  }, [elements, zoom, pan, drawElement, isDrawing, currentElement, renderBackground]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const [x, y] = screenToWorld(mouseX, mouseY);

    if (e.button === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (currentTool === "select") {
      // Check for handle first
      const selected = elements.find(el => el.selected);
      if (selected) {
        const handle = getResizeHandles(selected).find(h => isPointInHandle({ x, y }, h));
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle.id);
          setResizeStartBox({ ...selected });
          setMoveStartPoint({ x, y });
          return;
        }
      }
      // Check for shape selection
      const clicked = elements.find(el => isPointInElement({ x, y }, el));
      if (clicked) {
        setSelectedElements([clicked.id]);
        onSelectionChange([clicked.id]);
        onElementsChange(elements.map(el => ({ ...el, selected: el.id === clicked.id })));
        setIsMoving(true);
        setMoveStartPoint({ x, y });
      } else {
        setSelectedElements([]);
        onSelectionChange([]);
        onElementsChange(elements.map(el => ({ ...el, selected: false })));
      }
      return;
    }

    if (e.button === 0) {
      setIsDrawing(true);
      setStartPoint({ x, y });
      let newElement: Element = {
        id: Math.random().toString(36).substr(2, 9),
        type: currentTool,
        points: [{ x, y }],
        color: currentColor,
        strokeWidth: currentStrokeWidth,
      };
      if (currentTool.startsWith("shape-")) {
        const shapeId = currentTool.replace("shape-", "");
        newElement = {
          ...newElement,
          type: "shape",
          customShape: shapeId,
          x,
          y,
          width: 0,
          height: 0,
        };
      } else if (
        currentTool === "rectangle" ||
        currentTool === "ellipse"
      ) {
        newElement = {
          ...newElement,
          x,
          y,
          width: 0,
          height: 0,
        };
      }
      setCurrentElement(newElement);
    }

    if (currentTool === "text") {
      // Convert mouse to world coordinates
      const [x, y] = screenToWorld(mouseX, mouseY);

      // Check if clicking on an existing text element
      const clickedTextElement = elements.find(
        (el: Element) => el.type === "text" && isPointInElement({ x, y }, el)
      );

      if (clickedTextElement) {
        // Edit existing text
        onEditingTextChange(clickedTextElement.id);
        setTextInputValue(clickedTextElement.text || "");
        const [screenX, screenY] = worldToScreen(clickedTextElement.x || x, clickedTextElement.y || y);
        setTextInputPosition({ x: screenX, y: screenY });
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.select();
          }
        }, 0);
      } else {
        // Create new text element
        const newElement: Element = {
          id: Math.random().toString(36).substr(2, 9),
          type: "text",
          points: [{ x, y }],
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          fontSize: 16,
          text: "",
          x,
          y,
        };
        onElementsChange([...elements, newElement]);
        onEditingTextChange(newElement.id);
        setTextInputValue("");
        const [screenX, screenY] = worldToScreen(x, y);
        setTextInputPosition({ x: screenX, y: screenY });
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }, 0);
      }
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const [x, y] = screenToWorld(mouseX, mouseY);

    if (isPanning && lastPanPoint) {
      // Update pan offset
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
  
      onPanChange({ x: pan.x + dx, y: pan.y + dy });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
  
      setTimeout(clampCamera, 0);
      return;
    }
  
    if (isMoving && moveStartPoint) {
      const deltaX = x - moveStartPoint.x;
      const deltaY = y - moveStartPoint.y;
      onElementsChange(elements.map((el: Element) => {
        if (el.selected) {
          return {
            ...el,
            x: (el.x || 0) + deltaX,
            y: (el.y || 0) + deltaY,
            points: el.points?.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }))
          };
        }
        return el;
      }));
      setMoveStartPoint({ x, y });
      return;
    }
  
    if (isResizing && moveStartPoint && resizeStartBox && resizeHandle) {
      const deltaX = x - moveStartPoint.x;
      const deltaY = y - moveStartPoint.y;
      onElementsChange(elements.map((el: Element) => {
        if (!el.selected) return el;
        let { x: bx, y: by, width, height } = resizeStartBox;
        switch (resizeHandle) {
          case 'nw':
            bx += deltaX;
            by += deltaY;
            width -= deltaX;
            height -= deltaY;
            break;
          case 'ne':
            by += deltaY;
            width += deltaX;
            height -= deltaY;
            break;
          case 'sw':
            bx += deltaX;
            width -= deltaX;
            height += deltaY;
            break;
          case 'se':
            width += deltaX;
            height += deltaY;
            break;
        }
        width = Math.max(10, width);
        height = Math.max(10, height);
        return { ...el, x: bx, y: by, width, height };
      }));
      return;
    }
  
    if (isDrawing && currentElement && startPoint) {
      // Convert to world coordinates
      const [currentX, currentY] = screenToWorld(mouseX, mouseY);
      let updatedElement = {
        ...currentElement,
        points: [...currentElement.points, { x: currentX, y: currentY }],
      };
  
      if (
        currentElement.type === "rectangle" ||
        currentElement.type === "ellipse" ||
        currentElement.type === "shape" ||
        currentTool.startsWith("shape-")
      ) {
        updatedElement = {
          ...updatedElement,
          x: Math.min(startPoint.x, currentX),
          y: Math.min(startPoint.y, currentY),
          width: Math.abs(currentX - startPoint.x),
          height: Math.abs(currentY - startPoint.y),
        };
      }
  
      setCurrentElement(updatedElement);
    }
  };
  

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

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    e.preventDefault();
  
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomChange = -e.deltaY * ZOOM_SENSITIVITY;
      const newZoom = Math.min(Math.max(zoom * (1 + zoomChange), MIN_ZOOM), MAX_ZOOM);
      const scaleRatio = newZoom / zoom;
  
      // Adjust offset to keep zoom centered on cursor
      const offsetX = mouseX - (mouseX - pan.x) * scaleRatio;
      const offsetY = mouseY - (mouseY - pan.y) * scaleRatio;
  
      onZoomChange(newZoom);
      onPanChange({ x: offsetX, y: offsetY });
    } else {
      // Pan
      const PAN_SPEED = 1.5;
      onPanChange({
        x: pan.x - e.deltaX * PAN_SPEED,
        y: pan.y - e.deltaY * PAN_SPEED,
      });
    }
  
    setTimeout(clampCamera, 0);
  };
  

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (editingTextId) {
        const updatedElements = elements.map((el: Element) =>
          el.id === editingTextId ? { ...el, text: textInputValue } : el
        );
        onElementsChange(updatedElements);
        onEditingTextChange(null);
        setTextInputPosition(null);
        setTextInputValue("");

        // Send to backend
        if (socket && roomId) {
          socket.send(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify(updatedElements.find((el: Element) => el.id === editingTextId)),
              roomId,
            })
          );
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      // Call the existing handleWheel logic
      // Convert to React synthetic event shape
      // We'll just call the zoom/pan logic directly here
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const zoomChange = -e.deltaY * ZOOM_SENSITIVITY;
        const newZoom = Math.min(Math.max(zoom * (1 + zoomChange), MIN_ZOOM), MAX_ZOOM);
        const scaleRatio = newZoom / zoom;
        const offsetX = mouseX - (mouseX - pan.x) * scaleRatio;
        const offsetY = mouseY - (mouseY - pan.y) * scaleRatio;
        onZoomChange(newZoom);
        onPanChange({ x: offsetX, y: offsetY });
      } else {
        // Pan
        const PAN_SPEED = 1.5;
        onPanChange({
          x: pan.x - e.deltaX * PAN_SPEED,
          y: pan.y - e.deltaY * PAN_SPEED,
        });
      }
      setTimeout(clampCamera, 0);
    };

    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheelNative);
    };
  }, [zoom, pan, onZoomChange, onPanChange, clampCamera]);

  // Helper to draw a normal arrowhead
  function drawNormalArrowhead(ctx: CanvasRenderingContext2D, from: Point, to: Point, size = 12) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 7),
      to.y - size * Math.sin(angle - Math.PI / 7)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 7),
      to.y - size * Math.sin(angle + Math.PI / 7)
    );
    ctx.stroke();
    ctx.restore();
  }

  function getResizeHandles(element) {
    if (element.x === undefined || element.y === undefined || element.width === undefined || element.height === undefined) return [];
    return [
      { id: 'nw', x: element.x, y: element.y },
      { id: 'ne', x: element.x + element.width, y: element.y },
      { id: 'sw', x: element.x, y: element.y + element.height },
      { id: 'se', x: element.x + element.width, y: element.y + element.height },
    ];
  }

  function isPointInHandle(point, handle) {
    return (
      Math.abs(point.x - handle.x) < HANDLE_SIZE &&
      Math.abs(point.y - handle.y) < HANDLE_SIZE
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden" style={{ position: "fixed", zIndex: 0 }}>
      <canvas
        ref={combinedRef}
        width={width}
        height={height}
        className="block touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {editingTextId && textInputPosition && (
        <input
          ref={textInputRef}
          type="text"
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          onKeyDown={handleTextInputKeyDown}
          title="Edit Text"
          placeholder="Enter text"
          style={{
            position: "absolute",
            left: textInputPosition.x,
            top: textInputPosition.y,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}); 