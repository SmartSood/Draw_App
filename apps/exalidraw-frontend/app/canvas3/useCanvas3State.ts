import { useEffect, useState, useCallback } from "react";
import { Element, Point } from "@/types/drawing";
import axios from "axios";
import { HTTP_URL } from "@repo/backend-common/config";

export function useCanvas3State({ roomId, socket }: { roomId: string, socket: WebSocket | null }) {
  const [elements, setElements] = useState<Element[]>([]);
  const [currentTool, setCurrentTool] = useState<string>("select");
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(2);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  // Placeholders for undo/redo
  // const [history, setHistory] = useState<Element[][]>([]);
  // const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initial fetch of elements from backend
  useEffect(() => {
    async function fetchInitial() {
      const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
      const messages = res.data.messages;
      const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message);
        return messageData;
      });
      setElements(shapes);
    }
    if (roomId) fetchInitial();
  }, [roomId]);

  // WebSocket receive logic
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        // Attach chatId to the shape
        parsedShape.chatId = message.chatId;
        setElements((prev) => [...prev, parsedShape]);
      }
      // TODO: handle delete, update, etc.
    };
  }, [socket]);

  // Send new element to backend
  const handleElementsChange = useCallback((newElements: Element[]) => {
    // Find the new element (assume append)
    if (newElements.length > elements.length) {
      const newElement = newElements[newElements.length - 1];
      if (socket && roomId) {
        socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(newElement),
            roomId,
          })
        );
      }
    }
    setElements(newElements);
  }, [elements, socket, roomId]);

  // Selection change
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setElements((prev) =>
      prev.map((el) => ({ ...el, selected: selectedIds.includes(el.id) }))
    );
  }, []);

  return {
    elements,
    currentTool,
    currentColor,
    currentStrokeWidth,
    zoom,
    pan,
    editingTextId,
    setElements: handleElementsChange,
    setCurrentTool,
    setCurrentColor,
    setCurrentStrokeWidth,
    setZoom,
    setPan,
    setEditingTextId,
    onElementsChange: handleElementsChange,
    onSelectionChange: handleSelectionChange,
    onZoomChange: setZoom,
    onPanChange: setPan,
    socket,
    roomId,
  };
} 