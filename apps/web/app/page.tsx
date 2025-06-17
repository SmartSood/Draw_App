"use client"
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useState } from "react";



export default function Home() {

  const [roomId,setRoomId]=useState("");
  const router=useRouter();
  return (
   <div className={styles.page}>
      <input type="text" value={roomId} onChange={(e)=>{
        setRoomId(e.target.value)
      }} placeholder="Room id"/>

      <button onClick={()=>{
        router.push(`/room/${roomId
        }`)
      }}> Join Room</button>

   </div>
  );
}
