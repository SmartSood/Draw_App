import { useState,useEffect } from "react";
import { WS_URL } from "../config";


export function useSocket(){
    const [loading,setLoading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();

    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5YzJmYzU1NS1hMTNjLTRjNDYtOGRjNy1iNmZiODZmMDk5OTciLCJpYXQiOjE3NTAwODM1Mjl9.wYCf0X3IaB6jP_PDoJpAabDJPdRVprFO6TUkochqvBQ`);
        ws.onopen=()=>{
            setLoading(false)
            setSocket(ws)
        }
          
    },[])

    return{
        socket,
        loading
    }
}