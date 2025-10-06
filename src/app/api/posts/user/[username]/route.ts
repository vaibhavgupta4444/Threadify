import { NextRequest, NextResponse } from "next/server"
import dbConnection from "../../../../../../lib/dbConnection"
import Post from "../../../../../../models/Post"
import User from "../../../../../../models/User"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await dbConnection()
    
    const { username } = await params
    
    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      )
    }

    // Find user by username to get their ID
    const user = await User.findOne({ username }).select('_id')
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Get all posts by this user, sorted by newest first
    const posts = await Post.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(posts)

  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}