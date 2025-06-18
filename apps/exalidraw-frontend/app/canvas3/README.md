# Canvas3

This directory contains the new collaborative canvas implementation for Exalidraw-like features, merging:
- **Backend integration and real-time sync** from the original canvas (see `draw/index.ts`)
- **Modern, feature-rich drawing logic** from the new code (see `utils/drawing.ts`)
- **Glassmorphic, modern UI**

## Features
- Multiple shapes (rectangle, ellipse, diamond, arrow, line, text, select, etc.)
- Real-time collaboration via WebSocket and backend
- Zoom and pan (using logic from the old code)
- Sidebar/toolbox and toolbar with modern UI
- Shape selection, moving, and bounding box highlighting
- In-place text editing (double-click to edit text on canvas)
- Sidebar controls for stroke color, fill color, stroke width, and opacity
- Backend sync for all shape changes

## Not Yet Implemented
- Undo/redo (placeholders only)
- Delete (logic stubbed, route not implemented yet)

## Structure
- `Canvas3Room.tsx`: Room entry, manages socket and state
- `Canvas3.tsx`: Main canvas, all drawing and interaction logic
- `Toolbar3.tsx`: Modern toolbar for tools, color, stroke width
- `useCanvas3State.ts`: State and backend sync logic

**Do not change anything outside this directory for canvas3.** 