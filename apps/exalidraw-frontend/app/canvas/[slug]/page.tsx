import { RoomCanvas } from "@/components/RoomCanvas"
import { HTTP_URL } from "@repo/backend-common/config"
import axios from "axios"
export default async function CanvasPage({
    params}:{
    params:{
    slug:string
    }}){
    const slug=(await params).slug
    const response=await axios.get(`${HTTP_URL}/room/${slug}`)
    console.log(response.data)



    return <RoomCanvas roomId={response.data}/>


    



}