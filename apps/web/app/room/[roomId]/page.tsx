
import axios from "axios"
import { BACKEND_URL,WS_URL } from "../../config"
import { ChatRoom } from "../../components/ChatRoom"
async function getRoomId(slug:string){
    const response=await axios.get(`http://localhost:3001/room/${slug}`)
    return response
}

export default async function ChatRoom1(
   { params}:{
params:{
    roomId:string
}
    }
){

    const slug=  params.roomId
    const roomId=await getRoomId(slug)
    return <ChatRoom id={roomId.data}></ChatRoom>

}