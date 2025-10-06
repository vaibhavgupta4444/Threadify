import { Server as SocketIOServer, Socket } from "socket.io";
import dbConnection from "../../../lib/dbConnection";
import Message from "../../../models/Message";
import { Types } from "mongoose";

export const markReadHandler = (io: SocketIOServer, socket: Socket) => {
    socket.on('markAsRead', async (data: { messageIds: string[], userId: string, chatId: string }) => {
        try {
          const { messageIds, userId, chatId } = data
          
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
          io.to(chatId).emit('messageRead', {
            messageIds,
            userId,
            readAt: new Date()
          })
          
          console.log(`Messages marked as read by user ${userId} in chat ${chatId}`)
        } catch (error) {
          console.error('Error marking messages as read:', error)
          socket.emit('error', 'Failed to mark messages as read')
        }
      })
}