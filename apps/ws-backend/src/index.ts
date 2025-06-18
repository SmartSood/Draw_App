import WebSocket from "ws";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/index";

const wss = new WebSocket.Server({ port: 8080 });


interface User{
    ws:WebSocket,
    rooms:Number[],
    userId:string
}

const Users:User[] = [];


function authentication(token:string,ws:any){
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        //@ts-ignore
        return decoded.userId;
    } catch (err) {
        ws.send("Unauthorized: Invalid token");
        ws.close();
        return "";
    }

}
wss.on("connection", function connection(ws,request){
    console.log("New client connected");

    const url=request.url;
    if(!url)
    return;
    const params = new URLSearchParams(url.split("?")[1]);
    const token = params.get("token");
    if (!token) {
        ws.send("Unauthorized: No token provided");
        ws.close();
        return;
    }


    const userId=authentication(token,ws)
    if(userId=="")
    return;

    Users.push({
        ws,
        rooms:[],
        userId
    })



    
    ws.on("message", async function incoming(message) {

        try{
       const parsedData=JSON.parse(message as unknown as string)
        
    
       if(parsedData.type ==="join_room"){

        //@ts-ignore
        const user =Users.find(x=>x.ws===ws);
        user?.rooms.push(Number(parsedData.roomId))
        console.log("room joined")
        // ws.send(`welcome to room ${parsedData.roomId}`)
       }



       if(parsedData.type ==="leave_room"){
        //@ts-ignore
        const user =Users.find(x=>
            x.ws===ws)
            if(!user)
            return
        const index=user.rooms.indexOf(parsedData.roomId)
        if(index!==-1)
        user.rooms.splice(index,1)
        }





        if(parsedData.type ==="chat"){
            const roomId =Number(parsedData.roomId);
            const message=parsedData.message;

            const chat = await prismaClient.chat.create(
                {
                    data: {
                        roomId,
                        userId,
                        message
                    }
                }
            );
            const message2=JSON.parse(message as unknown as string)
            message2.chatId=chat.id;
            const message3=JSON.stringify(message2)
            console.log(message3)

            Users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({type:"chat",message:message3,roomId,chatId: chat.id}))
            }})
        }

        if(parsedData.type === "update_shape") {

            const roomId = Number(parsedData.roomId);
            const shape = parsedData.shape;
            console.log(parsedData)
       
            shape.selected=false;
            // Broadcast the shape update to all users in the room
            Users.forEach(user => {
                if(user.rooms.includes(roomId)) {
                   
                    user.ws.send(JSON.stringify({
                        type: "shape_updated",
                        shape,
                        roomId,
                        chatId: parsedData.chatId
                    }));
                }
            });

            // Persist the shape in the DB via HTTP backend
            try {
                await fetch('http://localhost:3001/shape/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'authorization': token },
                    body: JSON.stringify({
                        id: parsedData.chatId,
                        roomId: roomId,
                        shapeData: JSON.stringify(shape)
                    })
                });
            } catch (err) {
                console.error('Failed to persist shape to DB', err);
            }
        }

        if(parsedData.type === "delete") {
            const roomId = Number(parsedData.roomId);
            const elementId = parsedData.elementId;
            const chatId = parsedData.chatId;
            console.log(parsedData)

            // Delete the chat from the database
            try {
                await prismaClient.chat.delete({
                    where: {
                        id: chatId
                    }
                });

                // Broadcast the deletion to all users in the room
                Users.forEach(user => {
                    if(user.rooms.includes(roomId)) {
                        user.ws.send(JSON.stringify({
                            type: "delete",
                            elementId,
                            roomId,
                            chatId
                        }));
                    }
                });
            } catch (err) {
                console.error('Failed to delete chat from DB', err);
            }
        }
    }
    catch(err){
        console.log(err);
        ws.close();
    }




    });
    
    ws.on("close", () => {
        console.log("Client disconnected");
    });
})
