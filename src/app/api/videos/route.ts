import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnection";
import Video, { videoInterface } from "../../../../models/video";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import User from "../../../../models/User";

export async function GET() {
    try {
        await dbConnect();
      
        const videos = await Video.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: 'userId',
                select: 'username',
                model: User
            })
            .lean();

        if (!videos || videos.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const videosWithUsername = videos.map(video => ({
            ...video,
            likeCount: video.likes?.length || 0,
            username: video.userId?.username || 'Unknown User'
        }));

        return NextResponse.json({
            success: true,
            message: "Video data fetched successfully",
            videos: videosWithUsername
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error 
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

        const body: videoInterface = await request.json();
        if (!body.userId ||
            !body.title ||
            !body.description ||
            !body.videoUrl
        ) {
            return NextResponse.json({
                success: false,
                message: "Missing parameters"
            }, { status: 400 })
        }

        const videoData: videoInterface = {
            ...body,
            controls: body.controls ?? true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: body.transformation?.quality ?? 100
            }
        }

        await Video.create(videoData);

        return NextResponse.json({
            success: true,
            message: "You just uploaded a reel",
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}