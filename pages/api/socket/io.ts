import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import dbConnection from '../../../lib/dbConnection'
import Message from '../../../models/Message'
import Chat from '../../../models/Chat'
import { Types } from 'mongoose'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

interface MessageData {
  chatId: string
  content: string
  senderId: string
  messageType?: 'text' | 'image' | 'video' | 'file'
  mediaUrl?: string
  replyTo?: string
}

interface JoinRoomData {
  chatId: string
  userId: string
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
    res.socket.server.io = io

    io.on('connection', (socket) => {
     

      // Join a chat room
      socket.on('join-chat', async (data: JoinRoomData) => {
        try {
          const { chatId, userId } = data
          
          await dbConnection()
          
          // Verify user is participant in the chat
          const chat = await Chat.findById(chatId)
          if (!chat || !chat.participants.includes(new Types.ObjectId(userId))) {
            socket.emit('error', 'Unauthorized to join this chat')
            return
          }

          socket.join(chatId)
          console.log(`User ${userId} joined chat ${chatId}`)
          
          // Notify others in the room
          socket.to(chatId).emit('user-joined', {
            userId,
            message: 'User joined the chat'
          })
        } catch (error) {
          console.error('Error joining chat:', error)
          socket.emit('error', 'Failed to join chat')
        }
      })

      // Leave a chat room
      socket.on('leave-chat', (data: JoinRoomData) => {
        const { chatId, userId } = data
        socket.leave(chatId)
        console.log(`User ${userId} left chat ${chatId}`)
        
        socket.to(chatId).emit('user-left', {
          userId,
          message: 'User left the chat'
        })
      })

      // Send a message
      socket.on('send-message', async (data: MessageData) => {
        try {
          const { chatId, content, senderId, messageType = 'text', mediaUrl, replyTo } = data
          
          await dbConnection()
          
          // Verify user is participant in the chat
          const chat = await Chat.findById(chatId)
          if (!chat || !chat.participants.includes(new Types.ObjectId(senderId))) {
            socket.emit('error', 'Unauthorized to send message to this chat')
            return
          }

          // Create new message
          const newMessage = new Message({
            chatId: new Types.ObjectId(chatId),
            sender: new Types.ObjectId(senderId),
            content,
            messageType,
            mediaUrl,
            replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined
          })

          const savedMessage = await newMessage.save()
          
          // Populate sender info
          await savedMessage.populate('sender', 'username firstName lastName image')
          if (replyTo) {
            await savedMessage.populate('replyTo', 'content sender')
          }

          // Emit to all users in the chat room
          io.to(chatId).emit('new-message', savedMessage)
          
          console.log(`Message sent in chat ${chatId}:`, content)
        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('error', 'Failed to send message')
        }
      })

      // Mark messages as read
      socket.on('mark-read', async (data: { messageIds: string[], userId: string }) => {
        try {
          const { messageIds, userId } = data
          
          await dbConnection()
          
          await Message.updateMany(
            { 
              _id: { $in: messageIds.map(id => new Types.ObjectId(id)) },
              'readBy.user': { $ne: new Types.ObjectId(userId) }
            },
            { 
              $push: { 
                readBy: { 
                  user: new Types.ObjectId(userId), 
                  readAt: new Date() 
                } 
              } 
            }
          )

          // Emit read status to chat participants
          const messages = await Message.find({ _id: { $in: messageIds } }).select('chatId')
          const chatIds = [...new Set(messages.map(msg => msg.chatId.toString()))]
          
          chatIds.forEach(chatId => {
            io.to(chatId).emit('messages-read', {
              messageIds,
              userId,
              readAt: new Date()
            })
          })
        } catch (error) {
          console.error('Error marking messages as read:', error)
          socket.emit('error', 'Failed to mark messages as read')
        }
      })

      // User typing indicator
      socket.on('typing', (data: { chatId: string, userId: string, isTyping: boolean }) => {
        const { chatId, userId, isTyping } = data
        socket.to(chatId).emit('user-typing', {
          userId,
          isTyping
        })
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
  res.end()
}

export default SocketHandler