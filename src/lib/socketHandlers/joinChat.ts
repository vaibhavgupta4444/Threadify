import dbConnection from '../../../lib/dbConnection';
import Chat from "../../../models/Chat";
import { Types } from "mongoose";
import { Socket } from "socket.io";

interface JoinRoomData {
  chatId: string;
  userId: string;
}

export const joinChatHandler = (socket: Socket) => {
  socket.on("join-chat", async (data: JoinRoomData) => {
    try {
      const { chatId, userId } = data;

      await dbConnection();

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(new Types.ObjectId(userId))) {
        socket.emit("error", "Unauthorized to join this chat");
        return;
      }

      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);

      socket.to(chatId).emit("user-joined", {
        userId,
        message: "User joined the chat",
      });
    } catch (error) {
      console.error("Error joining chat:", error);
      socket.emit("error", "Failed to join chat");
    }
  });
};
