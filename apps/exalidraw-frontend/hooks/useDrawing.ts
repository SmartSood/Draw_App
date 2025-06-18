import { useState, useCallback, useEffect } from 'react';
import { Element, DrawingState, Point } from '../types/drawing';

const initialState: DrawingState = {
  elements: [],
  currentTool: 'pen',
  currentColor: '#000000',
  currentStrokeWidth: 2,
  isDrawing: false,
  currentElement: null,
  selectedElements: [],
  history: [[]],
  historyIndex: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
  editingTextId: null,
};

// Add a type for the argument
type SetElementsArg = Element[] | ((prev: Element[]) => Element[]);

export const useDrawing = () => {
  const [state, setState] = useState<DrawingState>(initialState);

  const addToHistory = useCallback((elements: Element[]) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...elements]);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // Update setElements to accept either an array or a function
  const setElements = useCallback((arg: SetElementsArg) => {
    setState(prev => {
      const elements = typeof arg === "function" ? arg(prev.elements) : arg;
      addToHistory(elements);
      return { ...prev, elements };
    });
  }, [addToHistory]);

  const setCurrentTool = useCallback((tool: string) => {
    setState(prev => ({ ...prev, currentTool: tool }));
  }, []);

  const setCurrentColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, currentColor: color }));
  }, []);

  const setCurrentStrokeWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, currentStrokeWidth: width }));
  }, []);

  const setSelectedElements = useCallback((selectedIds: string[]) => {
    setState(prev => ({ ...prev, selectedElements: selectedIds }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  }, []);

  const setPan = useCallback((pan: Point) => {
    setState(prev => ({ ...prev, pan }));
  }, []);

  const setEditingTextId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, editingTextId: id }));
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          elements: [...prev.history[newIndex]],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          elements: [...prev.history[newIndex]],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    ...state,
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
  };
};