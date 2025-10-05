import { NextRequest, NextResponse } from "next/server"
import dbConnection from "../../../../../lib/dbConnection"
import User from "../../../../../models/User"

export async function GET(request: NextRequest) {
  try {
    await dbConnection()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    // Search users by username, firstName, or lastName
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ],
      verified: true
    })
    .select('username firstName lastName image')
    .limit(limit)
    .lean()

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}