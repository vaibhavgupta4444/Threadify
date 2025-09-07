import { NextRequest, NextResponse } from "next/server";
import Comment, { CommentInterface } from "../../../../models/Comment";
import dbConnect from "../../../../lib/dbConnection";
import User from "../../../../models/User";


export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "postId is required" },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .populate({
        path: 'userId',
        select: 'username image',
        model: User
      })
      .limit(limit)
      .lean();

    const formattedComments = comments.map((comment) => ({
      ...comment,
      userData: comment.userId, // populated user object
    }));

    return NextResponse.json({ success: true, comments:formattedComments });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const commentData = (await request.json()) as CommentInterface;

    if (!commentData.userId || !commentData.content || !commentData.postId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing params",
        },
        { status: 400 }
      );
    }

    await Comment.create({
      postId: commentData.postId,
      userId: commentData.userId,
      content: commentData.content,
    });

    return NextResponse.json({
      success: true,
      message: "Commented",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
