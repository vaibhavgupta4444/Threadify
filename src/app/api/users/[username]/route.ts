import { NextRequest, NextResponse } from "next/server"
import dbConnection from "../../../../../lib/dbConnection"
import User from "../../../../../models/User"
import Post from "../../../../../models/Post"
import { Types } from "mongoose"

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await dbConnection()
    
    const { username } = params
    
    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      )
    }

    // Find user by username
    const user = await User.findOne({ username }).select('-password -verificationCode')
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Get post count for this user
    const postsCount = await Post.countDocuments({ userId: user._id.toString() })

    // Prepare user data with counts
    const userData = {
      ...user.toObject(),
      postsCount,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}