import {HTTP_URL} from "@repo/backend-common/config"
import axios from "axios";
type Shape={
    type: "rectangle",
    x:number,
    y:number,
    width:number,
    height:number

}|{
    type: "circle",
    centerX:number,
    centerY:number,
    radius:number

}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, container: HTMLDivElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let camera = {
        offsetX: 0,
        offsetY: 0,
        scale: 1
    };

    function screenToWorld(x: number, y: number): [number, number] {
        return [
            (x - camera.offsetX) / camera.scale,
            (y - camera.offsetY) / camera.scale
        ];
    }

    function worldToScreen(x: number, y: number): [number, number] {
        return [
            x * camera.scale + camera.offsetX,
            y * camera.scale + camera.offsetY
        ];
    }

    function clampCamera() {
        const containerRect = container.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // Calculate bounds based on current scale
        const minX = containerRect.width - canvasRect.width * camera.scale;
        const minY = containerRect.height - canvasRect.height * camera.scale;
        
        // Clamp camera position
        camera.offsetX = Math.min(0, Math.max(minX, camera.offsetX));
        camera.offsetY = Math.min(0, Math.max(minY, camera.offsetY));
    }

    function renderAll(ctx: CanvasRenderingContext2D) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.offsetX, camera.offsetY);

        clearCanvas(existingShape, canvas, ctx);

        ctx.restore();
    }

    let existingShape: Shape[] = await getExistingShape(roomId);
    renderAll(ctx);

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShape.push(parsedShape);
            renderAll(ctx);
        }
    };

    // Zoom
    const ZOOM_SENSITIVITY = 0.01;
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 10;
    
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
    
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        if (e.ctrlKey || e.metaKey) {
            // Get zoom direction & factor
            const zoomChange = -e.deltaY * ZOOM_SENSITIVITY;
            const newScale = Math.min(Math.max(camera.scale * (1 + zoomChange), MIN_ZOOM), MAX_ZOOM);
    
            // Compute zoom focus point
            const scaleRatio = newScale / camera.scale;
            camera.offsetX = mouseX - (mouseX - camera.offsetX) * scaleRatio;
            camera.offsetY = mouseY - (mouseY - camera.offsetY) * scaleRatio;
    
            camera.scale = newScale;
        } else {
            // Normal scroll → pan
            const PAN_SPEED = 1.5;
            camera.offsetX -= e.deltaX * PAN_SPEED;
            camera.offsetY -= e.deltaY * PAN_SPEED;
        }
    
        clampCamera();
        renderAll(ctx);
    }, { passive: false });
    
    

    // Pan
    let isPanning = false;
    let panStart = { x: 0, y: 0 };

    // canvas.addEventListener("mousedown", (e) => {
    //     if (e.button === 1) {
    //         isPanning = true;
    //         panStart.x = e.clientX;
    //         panStart.y = e.clientY;
    //     }

    //     if (e.button === 0) {
    //         clicked = true;
    //         const [x, y] = screenToWorld(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    //         startX = x;
    //         startY = y;
    //     }
    // });

    // canvas.addEventListener("mouseup", (e) => {
    //     if (e.button === 1) isPanning = false;
    //     if (e.button !== 0) return;

    //     clicked = false;
    //     const [endX, endY] = screenToWorld(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    //     const width = endX - startX;
    //     const height = endY - startY;

    //     const shape: Shape = {
    //         type: "rectangle",
    //         x: startX,
    //         y: startY,
    //         width,
    //         height
    //     };

    //     existingShape.push(shape);
    //     socket.send(JSON.stringify({
    //         type: "chat",
    //         message: JSON.stringify(shape),
    //         roomId: roomId
    //     }));

    //     renderAll(ctx);
    // });

    canvas.addEventListener("mousemove", (e) => {
        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            camera.offsetX += dx;
            camera.offsetY += dy;
            panStart.x = e.clientX;
            panStart.y = e.clientY;
            
            clampCamera();
            renderAll(ctx);
        }

        if (clicked) {
            const [currentX, currentY] = screenToWorld(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
            const width = currentX - startX;
            const height = currentY - startY;

            renderAll(ctx);
            ctx.save();
            ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.offsetX, camera.offsetY);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(startX, startY, width, height);
            ctx.restore();
        }
    });

    let clicked = false;
    let startX = 0, startY = 0;
}



function clearCanvas(existingShape:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="rgba(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    existingShape.map((shape)=>{
    if(shape.type==="rectangle"){
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
    }

    })

}


async function getExistingShape(roomId:string){
           const res=await  axios.get(`${HTTP_URL}/chats/${roomId}`)
            const messages=res.data.messages;
            const shapes=messages.map((x:{message:string})=>{
                const messageData=JSON.parse(x.message);
                return messageData

            })
            return shapes;


}


