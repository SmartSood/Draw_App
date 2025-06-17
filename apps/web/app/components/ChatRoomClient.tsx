"use client"

import { useEffect,useState } from "react"
import { useSocket } from "../hooks/useSocket"

export function ChatRoomClient({
    messages,
    id
}:{
    messages:{message:string}[];
    id:string
}){
    const [chats,setChats]=useState(messages)
    const [currentMessage,setCurrentMessage]=useState("");
    const {socket,loading}=useSocket();
    useEffect(()=>{
        if(socket&&!loading){

            socket.send(JSON.stringify({
                type:"join_room",
                roomId:id
            }))


            socket.onmessage=(event)=>{
                const parsedData=JSON.parse(event.data);
                if(parsedData.type==="chat"){
                  setChats(c=>[...c,{message:parsedData.message}])  
                }
            }
        }
        //return and close rthe connection with alert
        return () => {
            alert("closing socket")
            socket?.close(); // ✅ Correct
          };


    },[socket,loading,id])

    return <div>
        {chats && chats.map((m,index)=>{
            return <div key={index}>{m.message}</div>
        })}


        <input type="text" placeholder="message" value={currentMessage} onChange={(e)=>{
            setCurrentMessage(e.target.value)
        }} />
        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type:"chat",
                message:currentMessage,
                roomId:id
            }))
  
        }}>Send Message</button>
    </div>
}