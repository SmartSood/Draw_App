"use client"

import { useEffect, useState } from "react"
import { WS_URL } from "@repo/backend-common/config"
import { EnhancedCanvas } from "./EnhancedCanvas"

export function EnhancedRoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (!token) {
            window.location.href = '/auth/signin'
            return
        }

        const ws = new WebSocket(`${WS_URL}/?token=${token}`)
        
        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: roomId
            }))
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        ws.onclose = () => {
            console.log('WebSocket connection closed')
        }

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        }
    }, [roomId])

    if (socket === null) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p>Connecting to server...</p>
                </div>
            </div>
        )
    }

    return <EnhancedCanvas roomId={roomId} socket={socket} />
} 