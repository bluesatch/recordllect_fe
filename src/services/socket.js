import { io } from 'socket.io-client'

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001'

let socket = null 

export const connectSocket = (token)=> {
    if (socket?.connected) return socket 

    socket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        autoConnect: true
    })

    socket.on('connect', ()=> {
        console.log('WebSocket connected')
    })

    socket.on('disconnect', ()=> {
        console.log('WebSocket disconnected')
    })

    socket.on('connect_error', (err)=> {
        console.error('WebSocket error:', err.message)
    })

    return socket
}

export const disconnectSocket =()=> {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export const getSocket =()=> socket