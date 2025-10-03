import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnection";
import Post, { postInterface } from "../../../../models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import User from "../../../../models/User";
import Like from "../../../../models/Like";

export async function GET() {
    const session = await getServerSession(authOptions);
    try {
        await dbConnect();

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: 'userId',
                select: 'username image',
                model: User
            })
           
            .lean();

        if (!posts || posts.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const postIds = posts.map(post => post._id);

        // Check likes ONLY for these specific posts (not all posts user has liked)
        let userLikesMap: Record<string, boolean> = {};
        if (session?.user?.id) {
            const likes = await Like.find({ 
                userId: session.user.id,
                postId: { $in: postIds } 
            }).lean();
            
           
            userLikesMap = likes.reduce((acc, like) => {
                acc[like.postId.toString()] = true;
                return acc;
            }, {} as Record<string, boolean>);
        }

        const postsWithUsername = posts.map(post => {
            const postId = post._id?.toString();
            return {
                ...post,
                username: post.userId?.username || 'Unknown User',
                userProfilePic: post.userId?.image || "/file.png",
                isLikedByCurrentUser: postId ? userLikesMap[postId] : false
            };
        });

        return NextResponse.json({
            success: true,
            posts: postsWithUsername
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized Access"
            }, { status: 401 })
        }

        await dbConnect();

        const body: postInterface = await request.json();
        if (!body.userId ||
            !body.title ||
            !body.description ||
            !body.mediaUrl
        ) {
            return NextResponse.json({
                success: false,
                message: "Missing parameters"
            }, { status: 400 })
        }

        const postData: postInterface = {
            ...body,
            controls: body.controls ?? true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: body.transformation?.quality ?? 100
            }
        }

        await Post.create(postData);

        return NextResponse.json({
            success: true,
            message: "You just uploaded a post",
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        }, { status: 500 });
    }
}