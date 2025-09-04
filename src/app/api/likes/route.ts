import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnection";
import Like from "../../../../models/Like";
import Post from "../../../../models/Post";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, postId } = await req.json();

    if (!userId || !postId) {
      return NextResponse.json({ success: false, message: "Missing userId or postId" }, { status: 400 });
    }

  
    const existingLike = await Like.findOne({ userId, postId });

    if (existingLike) {
      
      await Like.deleteOne({ _id: existingLike._id });

      await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

      return NextResponse.json({ success: true, message: "Post unliked" }, { status: 200 });
    }


    const newLike = await Like.create({ userId, postId });

 
    await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

    return NextResponse.json({ success: true, message: "Post liked", like: newLike }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
