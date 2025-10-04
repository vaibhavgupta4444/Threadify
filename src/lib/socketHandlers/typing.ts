import { Socket } from "socket.io";

export const typingHandler = (socket: Socket) => {
    socket.on('typing', (data: { chatId: string, userId: string, isTyping: boolean }) => {
        const { chatId, userId, isTyping } = data;
        socket.to(chatId).emit('user-typing', {
          userId,
          isTyping
        })
      })
}