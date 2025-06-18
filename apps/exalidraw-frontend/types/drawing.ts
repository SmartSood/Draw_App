export interface Point {
    x: number;
    y: number;
  }
  
  export interface Element {
    id: string;
    type: 'pen' | 'line' | 'rectangle' | 'ellipse' | 'arrow' | 'text' | 'shape';
    points: Point[];
    color: string;
    strokeWidth: number;
    text?: string;
    fontSize?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    selected?: boolean;
    customShape?: string;
    chatId?: number;
  }
  
  export interface DrawingState {
    elements: Element[];
    currentTool: string;
    currentColor: string;
    currentStrokeWidth: number;
    isDrawing: boolean;
    currentElement: Element | null;
    selectedElements: string[];
    history: Element[][];
    historyIndex: number;
    zoom: number;
    pan: Point;
    editingTextId: string | null;
  }
  
  export interface CanvasProps {
    width: number;
    height: number;
    elements: Element[];
    currentTool: string;
    currentColor: string;
    currentStrokeWidth: number;
    onElementsChange: (elements: Element[]) => void;
    onSelectionChange: (selectedIds: string[]) => void;
    zoom: number;
    pan: Point;
    onZoomChange: (zoom: number) => void;
    onPanChange: (pan: Point) => void;
    editingTextId: string | null;
    onEditingTextChange: (id: string | null) => void;
    socket: WebSocket | null;
    roomId: string;
  }
  
  export interface PreRenderedShape {
    id: string;
    name: string;
    icon: React.ComponentType<{ size?: number }>;
    create: (point: Point, color: string, strokeWidth: number) => Element;
  }