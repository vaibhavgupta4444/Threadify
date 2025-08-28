import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/dbConnection";
import Video, { videoInterface } from "../../../../models/video";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function GET() {
    try {
        await dbConnect();
        const videos = await Video.find({}).sort({ createdAt: -1 }).lean();
        if (!videos || videos.length === 0) {
            return NextResponse.json([], { status: 200 })
        }

        return NextResponse.json(videos, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 })
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
        if (!body.title ||
            !body.description ||
            !body.videoUrl ||
            !body.thumbnailUrl
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

        const response = await Video.create(videoData);

        return NextResponse.json({
            success: true,
            data: response
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}