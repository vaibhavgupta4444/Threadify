import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User";
import dbConnect from "../../../../../lib/dbConnection";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { sendVerificationEmailHtml } from "@/helpers/sendVerificationEmailHtml";

export async function POST(request: NextRequest) {
    try {

        const { username, email, contactNo, password } = await request.json();

        if (!email || !password || !username || !contactNo) {
            return NextResponse.json({
                success: false,
                message: "Required data is missing"
            }, { status: 400 })
        }

        await dbConnect();

        const usernameExists = await User.findOne({ username, verified: true });
        if (usernameExists) {
            return NextResponse.json({
                success: false,
                message: "Username already taken"
            }, { status: 400 })
        }

        

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiration = new Date(Date.now() + 10 * 60 * 1000);

        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            if (isExistingUser.verified) {
                return NextResponse.json({
                    success: false,
                    message: "User already exists"
                }, { status: 400 })
            } else {
                isExistingUser.username = username;
                isExistingUser.contactNo = contactNo;
                isExistingUser.password = password;
                isExistingUser.verificationCode = verificationCode;
                isExistingUser.codeExpiration = codeExpiration; 

                await isExistingUser.save();
            }

        } else {
            const newUser = new User({
                username,
                email,
                contactNo,
                password,
                verificationCode,
                codeExpiration
            })

            await newUser.save();
        }

        // Try sending verification email with React components first, fallback to HTML
        let emailResponse = await sendVerificationEmail(email, username, verificationCode);
        
        // If React email fails, try HTML version
        if (!emailResponse.success) {
            console.log("React email failed, trying HTML version...");
            emailResponse = await sendVerificationEmailHtml(email, username, verificationCode);
        }

        if (!emailResponse.success) {
            return NextResponse.json(
                { success: false, message: emailResponse.message },
                { status: 500 }
            )
        }
        
        return NextResponse.json(
            { success: true, message: "User registered successfully, please verify your email" },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error",
        }, { status: 500 })
    }
}