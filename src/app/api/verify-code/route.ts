import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnection";
import User from "../../../../models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, verificationCode } = await request.json();

    if (!username || !verificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and verification code are required",
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

    // Check if verification code matches
    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 }
      );
    }

    // Check if verification code has expired
    if (user.codeExpiration && new Date() > user.codeExpiration) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Update user as verified and clear verification data
    await User.findByIdAndUpdate(user._id, {
      verified: true,
      verificationCode: undefined,
      codeExpiration: undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
