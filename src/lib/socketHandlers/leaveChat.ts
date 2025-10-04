import { Socket } from "socket.io"

interface JoinRoomData {
    chatId: string;
    userId: string;
}

export const leaveChatHandler = (socket: Socket) => {
    socket.on('leave-chat', (data: JoinRoomData) => {
        const { chatId, userId } = data
        socket.leave(chatId)
        console.log(`User ${userId} left chat ${chatId}`)

        socket.to(chatId).emit('user-left', {
            userId,
            message: 'User left the chat'
        })
    })
};