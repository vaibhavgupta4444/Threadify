import { NextRequest, NextResponse } from "next/server"
import dbConnection from "../../../../../../lib/dbConnection"
import Message from "../../../../../../models/Message"
import Chat from "../../../../../../models/Chat"
import { Types } from "mongoose"

// Get messages for a specific chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    await dbConnection()
    
    const { searchParams } = new URL(request.url);
    const { chatId }= await params;
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    
    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Chat ID is required" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    // Verify user is participant in the chat
    const chat = await Chat.findById(chatId)
    if (!chat || !chat.participants.includes(new Types.ObjectId(userId))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to access this chat" },
        { status: 403 }
      )
    }

    // Get messages with pagination
    const messages = await Message.find({
      chatId: new Types.ObjectId(chatId),
      isDeleted: false
    })
    .populate('sender', 'username firstName lastName image')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()

    // Reverse to show oldest first
    const orderedMessages = messages.reverse()

    return NextResponse.json({
      success: true,
      messages: orderedMessages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    })

  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}