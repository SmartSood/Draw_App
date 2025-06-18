import { useEffect, useState, useCallback } from "react";
import { Element, Point } from "@/types/drawing";
import axios from "axios";
import { HTTP_URL } from "@repo/backend-common/config";

const MAX_HISTORY = 50; // Maximum number of states to keep in history

export function useCanvas3State({ roomId, socket }: { roomId: string, socket: WebSocket | null }) {
  const [elements, setElements] = useState<Element[]>([]);
  const [currentTool, setCurrentTool] = useState<string>("select");
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(2);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [history, setHistory] = useState<Element[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Add current state to history
  const addToHistory = useCallback((newElements: Element[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newElements]);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  // Initial fetch of elements from backend
  useEffect(() => {
    async function fetchInitial() {
      const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
      const messages = res.data.messages;
      const shapes = messages.map((x: { message: string, id: number }) => {
        const messageData = JSON.parse(x.message);
        return messageData;
      });
      setElements(shapes);
      // Initialize history with initial state
      setHistory([shapes]);
      setHistoryIndex(0);
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
        console.log("parsedShape",parsedShape)
    
        setElements((prev) => {
          const newElements = [...prev, parsedShape];
          addToHistory(newElements);
          return newElements;
        });
      }
    };
  }, [socket, addToHistory]);

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
    addToHistory(newElements);
  }, [elements, socket, roomId, addToHistory]);

  // Selection change
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setElements((prev) =>
      prev.map((el) => ({ ...el, selected: selectedIds.includes(el.id) }))
    );
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    socket,
    roomId,
  };
} 