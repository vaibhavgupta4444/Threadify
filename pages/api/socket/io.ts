import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { joinChatHandler } from '@/lib/socketHandlers/joinChat'
import { leaveChatHandler } from '@/lib/socketHandlers/leaveChat'
import { sendMessageHandler } from '@/lib/socketHandlers/sendMessage'
import { markReadHandler } from '@/lib/socketHandlers/markRead'
import { typingHandler } from '@/lib/socketHandlers/typing'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}


const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })
    res.socket.server.io = io;

    io.on('connection', (socket) => {
     

      // Join a chat room
      joinChatHandler(io, socket);

      // Leave a chat room
      leaveChatHandler(socket);

      // Send a message
      sendMessageHandler(io, socket);

      // Mark messages as read
      markReadHandler(io, socket);

      // User typing indicator
      typingHandler(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
  res.end()
}

export default SocketHandler