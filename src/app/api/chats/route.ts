import { NextRequest, NextResponse } from "next/server"
import dbConnection from "../../../../lib/dbConnection"
import Chat from "../../../../models/Chat"
import User from "../../../../models/User"
import { Types } from "mongoose"

// Get all chats for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnection()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    const chats = await Chat.find({
      participants: new Types.ObjectId(userId)
    })
    .populate('participants', 'username firstName lastName image')
    .populate('lastMessage', 'content messageType createdAt')
    .sort({ lastMessageTime: -1 })
    .lean()

    return NextResponse.json({
      success: true,
      chats
    })

  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a new chat
export async function POST(request: NextRequest) {
  try {
    await dbConnection()
    
    const { participants, isGroupChat = false, chatName, createdBy } = await request.json()
    
    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json(
        { success: false, message: "At least 2 participants are required" },
        { status: 400 }
      )
    }

    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: "Creator ID is required" },
        { status: 400 }
      )
    }

    // Verify all participants exist
    const users = await User.find({
      _id: { $in: participants.map((id: string) => new Types.ObjectId(id)) }
    })

    if (users.length !== participants.length) {
      return NextResponse.json(
        { success: false, message: "Some participants not found" },
        { status: 400 }
      )
    }

    // For one-on-one chats, check if chat already exists
    if (!isGroupChat && participants.length === 2) {
      const existingChat = await Chat.findOne({
        participants: { $all: participants.map((id: string) => new Types.ObjectId(id)) },
        isGroupChat: false
      })

      if (existingChat) {
        return NextResponse.json({
          success: true,
          chat: existingChat,
          message: "Chat already exists"
        })
      }
    }

    // Create new chat
    const newChat = new Chat({
      participants: participants.map((id: string) => new Types.ObjectId(id)),
      isGroupChat,
      chatName: isGroupChat ? chatName : undefined,
      createdBy: new Types.ObjectId(createdBy),
      admins: isGroupChat ? [new Types.ObjectId(createdBy)] : undefined
    })

    const savedChat = await newChat.save()
    
    // Populate participants
    await savedChat.populate('participants', 'username firstName lastName image')

    return NextResponse.json({
      success: true,
      chat: savedChat,
      message: "Chat created successfully"
    })

  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}