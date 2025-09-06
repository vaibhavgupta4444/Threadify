import { NextRequest, NextResponse } from "next/server";
import Comment, { CommentInterface } from "../../../../models/Comment";
import dbConnect from "../../../../lib/dbConnection";

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
