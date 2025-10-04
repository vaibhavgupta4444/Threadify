import { Server as SocketIOServer, Socket } from "socket.io";
import dbConnection from "../../../lib/dbConnection";
import Message from "../../../models/Message";
import { Types } from "mongoose";

export const markReadHandler = (io: SocketIOServer, socket: Socket) => {
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
}