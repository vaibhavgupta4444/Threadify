import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User";
import dbConnect from "../../../../../lib/dbConnection";

export async function POST(request: NextRequest) {
    try {
        
        const { email, password } = await request.json();
 
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email or Password is missing"
            }, { status: 400 })
        }

        await dbConnect();

        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return NextResponse.json({
                success: false,
                message: "User already exist"
            }, { status: 400 })
        }

        const newUser = new User({
            email,
            password
        })

        await newUser.save();

        return NextResponse.json({
            success: true,
            message: "Registered user successfully"
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error",
        }, { status: 500 })
    }
}