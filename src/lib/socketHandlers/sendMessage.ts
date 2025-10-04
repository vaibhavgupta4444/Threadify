import dbConnection from "../../../lib/dbConnection";
import {Server as SocketIOServer, Socket} from 'socket.io';
import Chat from "../../../models/Chat";
import { Types } from "mongoose";
import Message from "../../../models/Message";

interface MessageData {
  chatId: string
  content: string
  senderId: string
  messageType?: 'text' | 'image' | 'video' | 'file'
  mediaUrl?: string
  replyTo?: string
}

export const sendMessageHandler = (io: SocketIOServer, socket: Socket) => {
    socket.on('send-message', async (data: MessageData) => {
            try {
              const { chatId, content, senderId, messageType = 'text', mediaUrl, replyTo } = data
              
              await dbConnection();
              
              // Verify user is participant in the chat
              const chat = await Chat.findById(chatId);
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
}