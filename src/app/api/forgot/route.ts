import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnection";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { userId, password } = await request.json();
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized Access"
            }, { status: 401 });
        }

        if (!password || password.length < 6) {
            return NextResponse.json({
                success: false,
                message: "Password must be at least 6 characters long"
            }, { status: 400 });
        }

        await dbConnect();

        const newPassword = await bcrypt.hash(password, 10);
        
        await User.findByIdAndUpdate(userId, { password:newPassword });

        return NextResponse.json({
            success:true,
            message: 'Password get updated successfully'
        },{status: 200});

    } catch (error) {
        return NextResponse.json({success: false, message: error instanceof Error ? error.message : "Server error", }, { status: 500 })
    }
}