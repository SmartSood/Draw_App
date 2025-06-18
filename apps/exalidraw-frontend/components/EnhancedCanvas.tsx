import { useEffect, useRef, useState } from "react"
import { initEnhancedDraw } from "@/draw/enhanced"

const CANVAS_SIZE = 10000
const MIN_ZOOM = 0.1
const MAX_ZOOM = 10

const STROKE_COLORS = ["#000000", "#ffffff", "#ef4444", "#f59e42", "#fbbf24", "#22c55e", "#3b82f6", "#a78bfa"]
const FILL_COLORS = ["none", "#ffffff", "#fbbf24", "#22c55e", "#3b82f6", "#a78bfa", "#ef4444"]
const STROKE_WIDTHS = [2, 4, 8, 12]

export type Tool = 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'line' | 'text' | 'select'

export function EnhancedCanvas({
    roomId,
    socket
}: {
    roomId: string
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedTool, setSelectedTool] = useState<Tool>('rectangle')
    const [zoom, setZoom] = useState(1)
    const [forceRerender, setForceRerender] = useState(0)

    // Style states
    const [strokeColor, setStrokeColor] = useState("#000000")
    const [fillColor, setFillColor] = useState("none")
    const [strokeWidth, setStrokeWidth] = useState(2)
    const [opacity, setOpacity] = useState(1)

    // In-place text editing state
    const [editingText, setEditingText] = useState<null | {
        id: string,
        value: string,
        x: number,
        y: number,
        screenX: number,
        screenY: number
    }>(null)

    // Zoom handlers
    const handleZoomIn = () => {
        setZoom(z => Math.min(z * 1.1, MAX_ZOOM))
        setForceRerender(f => f + 1)
    }
    const handleZoomOut = () => {
        setZoom(z => Math.max(z / 1.1, MIN_ZOOM))
        setForceRerender(f => f + 1)
    }

    // Callback for in-place text editing
    const handleEditText = (id: string, value: string, x: number, y: number, screenX: number, screenY: number) => {
        setEditingText({ id, value, x, y, screenX, screenY })
    }

    // Pass style props and edit callback to drawing logic
    useEffect(() => {
        if (canvasRef.current && containerRef.current) {
            initEnhancedDraw(
                canvasRef.current,
                roomId,
                socket,
                containerRef.current,
                selectedTool,
                setZoom,
                zoom,
                forceRerender,
                {
                    strokeColor,
                    fillColor,
                    strokeWidth,
                    opacity
                },
                handleEditText
            )
        }
    }, [canvasRef, containerRef, selectedTool, zoom, forceRerender, strokeColor, fillColor, strokeWidth, opacity])

    const tools: { id: Tool; label: string; icon: string }[] = [
        { id: 'select', label: 'Select', icon: '🖱️' },
        { id: 'rectangle', label: 'Rectangle', icon: '▭' },
        { id: 'diamond', label: 'Diamond', icon: '◆' },
        { id: 'ellipse', label: 'Ellipse', icon: '⬭' },
        { id: 'arrow', label: 'Arrow', icon: '➔' },
        { id: 'line', label: 'Line', icon: '／' },
        { id: 'text', label: 'Text', icon: 'A' }
    ]

    // Handle text input commit
    const handleTextInputCommit = (newValue: string) => {
        // Send update to backend via socket (handled in draw logic)
        setEditingText(null)
        setForceRerender(f => f + 1)
    }

    return (
        <div className="w-screen h-screen flex bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
            {/* Sidebar/Toolbox */}
            <aside className="z-20 flex flex-col items-center py-6 px-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 m-4 h-[90vh] w-24">
                {/* Tool buttons */}
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-xl text-2xl font-bold transition-all duration-200 shadow-md border-2 ${
                            selectedTool === tool.id
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-400 scale-110 shadow-lg'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-purple-100 dark:hover:bg-purple-800 hover:scale-105'
                        }`}
                        title={tool.label}
                    >
                        {tool.icon}
                    </button>
                ))}
                {/* Divider */}
                <div className="w-10 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 my-4 rounded-full opacity-60" />
                {/* Stroke color */}
                <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1 text-center">Stroke</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {STROKE_COLORS.map(color => (
                            <button
                                key={color}
                                className={`w-6 h-6 rounded-full border-2 ${strokeColor === color ? 'border-purple-500 scale-110' : 'border-gray-300'} transition-all`}
                                style={{ background: color }}
                                onClick={() => setStrokeColor(color)}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
                {/* Fill color */}
                <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1 text-center">Fill</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {FILL_COLORS.map(color => (
                            <button
                                key={color}
                                className={`w-6 h-6 rounded-full border-2 ${fillColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'} transition-all`}
                                style={{ background: color === 'none' ? 'transparent' : color, borderStyle: color === 'none' ? 'dashed' : 'solid' }}
                                onClick={() => setFillColor(color)}
                                title={color}
                            >{color === 'none' ? <span className="block w-full h-full border border-gray-400 rounded-full" /> : null}</button>
                        ))}
                    </div>
                </div>
                {/* Stroke width */}
                <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1 text-center">Width</div>
                    <div className="flex gap-1 justify-center">
                        {STROKE_WIDTHS.map(w => (
                            <button
                                key={w}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${strokeWidth === w ? 'border-purple-500 scale-110' : 'border-gray-300'} transition-all`}
                                onClick={() => setStrokeWidth(w)}
                                title={`Width ${w}`}
                            >
                                <div style={{ width: w, height: 2, background: '#333', borderRadius: 2 }} />
                            </button>
                        ))}
                    </div>
                </div>
                {/* Opacity */}
                <div className="mb-4 w-full flex flex-col items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1 text-center">Opacity</div>
                    <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={opacity}
                        onChange={e => setOpacity(Number(e.target.value))}
                        className="w-16"
                        title="Opacity"
                    />
                </div>
            </aside>

            {/* Main Drawing Area */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 m-4 flex items-center px-6 space-x-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent select-none">Exalidraw Clone</span>
                    <div className="flex items-center space-x-2 ml-8">
                        <button onClick={handleZoomOut} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-all">-</button>
                        <span className="text-gray-700 dark:text-gray-200 font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={handleZoomIn} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-all">+</button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-hidden relative rounded-3xl m-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 bg-black"
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            maxWidth: CANVAS_SIZE,
                            maxHeight: CANVAS_SIZE,
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_SIZE}
                            height={CANVAS_SIZE}
                            className="block"
                        />
                        {/* In-place text editor */}
                        {editingText && (
                            <input
                                type="text"
                                value={editingText.value}
                                autoFocus
                                style={{
                                    position: 'absolute',
                                    left: editingText.screenX,
                                    top: editingText.screenY,
                                    zIndex: 50,
                                    fontSize: 20 * zoom,
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: 6,
                                    border: '1px solid #a78bfa',
                                    padding: '2px 8px',
                                    minWidth: 60
                                }}
                                onChange={e => setEditingText({ ...editingText, value: e.target.value })}
                                onBlur={() => handleTextInputCommit(editingText.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleTextInputCommit(editingText.value)
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 