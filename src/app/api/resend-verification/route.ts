import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnection";
import User from "../../../../models/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { sendVerificationEmailHtml } from "@/helpers/sendVerificationEmailHtml";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required",
        },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is already verified",
        },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with new verification code
    await User.findByIdAndUpdate(user._id, {
      verificationCode,
      codeExpiration,
    });

    // Try sending verification email with React components first, fallback to HTML
    let emailResponse = await sendVerificationEmail(
      user.email,
      user.username,
      verificationCode
    );

    // If React email fails, try HTML version
    if (!emailResponse.success) {
      console.log("React email failed, trying HTML version...");
      emailResponse = await sendVerificationEmailHtml(
        user.email,
        user.username,
        verificationCode
      );
    }

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending verification code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
