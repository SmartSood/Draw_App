import { HTTP_URL } from "@repo/backend-common/config"
import axios from "axios"
import { Tool } from "@/components/EnhancedCanvas"

export type Shape = {
    id: string
    type: Tool
    x: number
    y: number
    width: number
    height: number
    rotation?: number
    text?: string
    color?: string
    fill?: string
    strokeWidth?: number
    opacity?: number
    points?: [number, number][]
}

type Camera = {
    offsetX: number
    offsetY: number
    scale: number
}

type StyleOptions = {
    strokeColor: string
    fillColor: string
    strokeWidth: number
    opacity: number
}

function isPointInShape(x: number, y: number, shape: Shape): boolean {
    // Simple bounding box check for all shapes
    if (shape.type === 'line' && shape.points) {
        // For line, check if close to any segment
        for (let i = 1; i < shape.points.length; i++) {
            const [x1, y1] = shape.points[i - 1]
            const [x2, y2] = shape.points[i]
            const dist = pointToSegmentDistance(x, y, x1, y1, x2, y2)
            if (dist < 10) return true
        }
        return false
    }
    // For all others, use bounding box
    return (
        x >= Math.min(shape.x, shape.x + shape.width) &&
        x <= Math.max(shape.x, shape.x + shape.width) &&
        y >= Math.min(shape.y, shape.y + shape.height) &&
        y <= Math.max(shape.y, shape.y + shape.height)
    )
}

function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    const dot = A * C + B * D
    const len_sq = C * C + D * D
    let param = -1
    if (len_sq !== 0) param = dot / len_sq
    let xx, yy
    if (param < 0) {
        xx = x1
        yy = y1
    } else if (param > 1) {
        xx = x2
        yy = y2
    } else {
        xx = x1 + param * C
        yy = y1 + param * D
    }
    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
}

export async function initEnhancedDraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    container: HTMLDivElement,
    selectedTool: Tool,
    setZoom: (zoom: number) => void,
    zoom: number,
    forceRerender: number,
    styleOptions?: StyleOptions,
    onEditText?: (id: string, value: string, x: number, y: number, screenX: number, screenY: number) => void
) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let camera: Camera = {
        offsetX: 0,
        offsetY: 0,
        scale: zoom
    }

    let shapes: Shape[] = await getExistingShapes(roomId)
    let isDrawing = false
    let startX = 0
    let startY = 0
    let currentShape: Shape | null = null
    let selectedShape: Shape | null = null
    let dragOffset = { x: 0, y: 0 }
    let isDragging = false
    let isEditingText = false

    function screenToWorld(x: number, y: number): [number, number] {
        return [
            (x - camera.offsetX) / camera.scale,
            (y - camera.offsetY) / camera.scale
        ]
    }

    function worldToScreen(x: number, y: number): [number, number] {
        return [
            x * camera.scale + camera.offsetX,
            y * camera.scale + camera.offsetY
        ]
    }

    function clampCamera() {
        const containerRect = container.getBoundingClientRect()
        const canvasRect = canvas.getBoundingClientRect()
        
        const minX = containerRect.width - canvasRect.width * camera.scale
        const minY = containerRect.height - canvasRect.height * camera.scale
        
        camera.offsetX = Math.min(0, Math.max(minX, camera.offsetX))
        camera.offsetY = Math.min(0, Math.max(minY, camera.offsetY))
    }

    function renderShape(shape: Shape, highlight: boolean = false) {
        ctx.save()
        ctx.strokeStyle = highlight ? "#a78bfa" : (shape.color || "white")
        ctx.lineWidth = (shape.strokeWidth || 2) * camera.scale
        ctx.globalAlpha = (shape.opacity ?? 1) * (highlight ? 0.8 : 1)
        if (shape.fill && shape.fill !== 'none') {
            ctx.fillStyle = shape.fill
        } else {
            ctx.fillStyle = 'transparent'
        }

        switch (shape.type) {
            case 'rectangle':
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
                if (shape.fill && shape.fill !== 'none') ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
                break
            case 'diamond':
                const centerX = shape.x + shape.width / 2
                const centerY = shape.y + shape.height / 2
                ctx.beginPath()
                ctx.moveTo(centerX, shape.y)
                ctx.lineTo(shape.x + shape.width, centerY)
                ctx.lineTo(centerX, shape.y + shape.height)
                ctx.lineTo(shape.x, centerY)
                ctx.closePath()
                ctx.stroke()
                if (shape.fill && shape.fill !== 'none') ctx.fill()
                break
            case 'ellipse':
                ctx.beginPath()
                ctx.ellipse(
                    shape.x + shape.width / 2,
                    shape.y + shape.height / 2,
                    Math.abs(shape.width / 2),
                    Math.abs(shape.height / 2),
                    0,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
                if (shape.fill && shape.fill !== 'none') ctx.fill()
                break
            case 'arrow':
                drawArrow(shape)
                break
            case 'line':
                if (shape.points) {
                    ctx.beginPath()
                    ctx.moveTo(shape.points[0][0], shape.points[0][1])
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i][0], shape.points[i][1])
                    }
                    ctx.stroke()
                }
                break
            case 'text':
                if (shape.text) {
                    ctx.font = `${20 * camera.scale}px Arial`
                    ctx.fillStyle = shape.color || "white"
                    ctx.globalAlpha = shape.opacity ?? 1
                    ctx.fillText(shape.text, shape.x, shape.y)
                }
                break
        }
        ctx.restore()
        // Draw bounding box if highlight
        if (highlight) {
            ctx.save()
            ctx.strokeStyle = "#a78bfa"
            ctx.setLineDash([6, 4])
            ctx.lineWidth = 2 * camera.scale
            ctx.globalAlpha = 0.7
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            ctx.restore()
        }
    }

    function drawArrow(shape: Shape) {
        const headLength = 20 * camera.scale
        const angle = Math.atan2(shape.height, shape.width)
        
        ctx.beginPath()
        ctx.moveTo(shape.x, shape.y)
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height)
        
        // Arrow head
        ctx.lineTo(
            shape.x + shape.width - headLength * Math.cos(angle - Math.PI / 6),
            shape.y + shape.height - headLength * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(shape.x + shape.width, shape.y + shape.height)
        ctx.lineTo(
            shape.x + shape.width - headLength * Math.cos(angle + Math.PI / 6),
            shape.y + shape.height - headLength * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
    }

    function renderAll() {
        camera.scale = zoom // always use latest zoom
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.save()
        ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.offsetX, camera.offsetY)

        shapes.forEach(shape => {
            if (selectedShape && shape.id === selectedShape.id) {
                renderShape(shape, true)
            } else {
                renderShape(shape)
            }
        })
        if (isDrawing && currentShape) {
            renderShape(currentShape)
        }

        ctx.restore()
    }

    // Event Listeners
    canvas.onmousedown = (e) => {
        if (e.button === 1) return // Middle mouse button for panning
        const [x, y] = screenToWorld(
            e.clientX - canvas.getBoundingClientRect().left,
            e.clientY - canvas.getBoundingClientRect().top
        )
        if (selectedTool === 'select') {
            // Try to select a shape
            selectedShape = null
            for (let i = shapes.length - 1; i >= 0; i--) {
                if (isPointInShape(x, y, shapes[i])) {
                    selectedShape = shapes[i]
                    dragOffset = { x: x - shapes[i].x, y: y - shapes[i].y }
                    isDragging = true
                    isEditingText = (selectedShape.type === 'text')
                    break
                }
            }
            renderAll()
        } else if (selectedTool === 'text') {
            // Place new text
            isDrawing = true
            startX = x
            startY = y
            currentShape = {
                id: Date.now().toString(),
                type: 'text',
                x,
                y,
                width: 0,
                height: 0,
                text: '',
                color: styleOptions?.strokeColor,
                opacity: styleOptions?.opacity,
                strokeWidth: styleOptions?.strokeWidth
            }
            // Prompt for text
            const text = prompt('Enter text:')
            if (text) {
                currentShape.text = text
                shapes.push(currentShape)
                socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify(currentShape),
                    roomId: roomId
                }))
            }
            isDrawing = false
            currentShape = null
            renderAll()
        } else {
            // Start drawing new shape
            isDrawing = true
            startX = x
            startY = y
            currentShape = {
                id: Date.now().toString(),
                type: selectedTool,
                x,
                y,
                width: 0,
                height: 0,
                color: styleOptions?.strokeColor,
                fill: styleOptions?.fillColor,
                strokeWidth: styleOptions?.strokeWidth,
                opacity: styleOptions?.opacity
            }
            renderAll()
        }
    }

    canvas.onmousemove = (e) => {
        const [x, y] = screenToWorld(
            e.clientX - canvas.getBoundingClientRect().left,
            e.clientY - canvas.getBoundingClientRect().top
        )
        if (selectedTool === 'select' && isDragging && selectedShape) {
            // Move selected shape
            selectedShape.x = x - dragOffset.x
            selectedShape.y = y - dragOffset.y
            renderAll()
        } else if (isDrawing && currentShape) {
            if (selectedTool === 'line') {
                if (!currentShape.points) {
                    currentShape.points = [[startX, startY]]
                }
                currentShape.points.push([x, y])
            } else {
                currentShape.width = x - startX
                currentShape.height = y - startY
            }
            renderAll()
        }
    }

    canvas.onmouseup = (e) => {
        if (selectedTool === 'select' && isDragging && selectedShape) {
            // Commit move
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify(selectedShape),
                roomId: roomId
            }))
            isDragging = false
            renderAll()
        } else if (isDrawing && currentShape) {
            if (selectedTool === 'line') {
                if (currentShape.points && currentShape.points.length > 1) {
                    shapes.push(currentShape)
                    socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify(currentShape),
                        roomId: roomId
                    }))
                }
            } else {
                shapes.push(currentShape)
                socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify(currentShape),
                    roomId: roomId
                }))
            }
            isDrawing = false
            currentShape = null
            renderAll()
        }
    }

    // Deselect on canvas click (empty space)
    canvas.ondblclick = (e) => {
        const [x, y] = screenToWorld(
            e.clientX - canvas.getBoundingClientRect().left,
            e.clientY - canvas.getBoundingClientRect().top
        )
        if (selectedTool === 'select') {
            // Check if double-clicked a text shape
            for (let i = shapes.length - 1; i >= 0; i--) {
                const shape = shapes[i]
                if (shape.type === 'text' && isPointInShape(x, y, shape)) {
                    // Convert world to screen coordinates for input placement
                    const [screenX, screenY] = worldToScreen(shape.x, shape.y)
                    if (onEditText) {
                        onEditText(shape.id, shape.text || '', shape.x, shape.y, screenX, screenY)
                    }
                    return
                }
            }
            selectedShape = null
            renderAll()
        }
    }

    // Zoom and Pan
    canvas.onwheel = (e) => {
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        if (e.ctrlKey || e.metaKey) {
            const zoomChange = -e.deltaY * 0.001
            const newScale = Math.min(Math.max(camera.scale * (1 + zoomChange), 0.1), 10)
            const scaleRatio = newScale / camera.scale
            camera.offsetX = mouseX - (mouseX - camera.offsetX) * scaleRatio
            camera.offsetY = mouseY - (mouseY - camera.offsetY) * scaleRatio
            camera.scale = newScale
            setZoom(newScale)
        } else {
            const PAN_SPEED = 1.5
            camera.offsetX -= e.deltaX * PAN_SPEED
            camera.offsetY -= e.deltaY * PAN_SPEED
        }
        clampCamera()
        renderAll()
    }

    // Pan with middle mouse button
    let isPanning = false
    let panStart = { x: 0, y: 0 }
    canvas.addEventListener("mousedown", (e) => {
        if (e.button === 1) {
            isPanning = true
            panStart.x = e.clientX
            panStart.y = e.clientY
        }
    })
    canvas.addEventListener("mousemove", (e) => {
        if (isPanning) {
            const dx = e.clientX - panStart.x
            const dy = e.clientY - panStart.y
            camera.offsetX += dx
            camera.offsetY += dy
            panStart.x = e.clientX
            panStart.y = e.clientY
            clampCamera()
            renderAll()
        }
    })
    canvas.addEventListener("mouseup", (e) => {
        if (e.button === 1) {
            isPanning = false
        }
    })

    // WebSocket message handling
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === "chat") {
            const shape = JSON.parse(message.message)
            // If shape with same id exists, update it (for move), else add
            const idx = shapes.findIndex(s => s.id === shape.id)
            if (idx !== -1) {
                shapes[idx] = shape
            } else {
                shapes.push(shape)
            }
            renderAll()
        }
    }

    // Initial render
    renderAll()
}

async function getExistingShapes(roomId: string): Promise<Shape[]> {
    try {
        const res = await axios.get(`${HTTP_URL}/chats/${roomId}`)
        const messages = res.data.messages
        return messages.map((x: { message: string }) => JSON.parse(x.message))
    } catch (error) {
        console.error('Error fetching shapes:', error)
        return []
    }
} 