import { NextRequest, NextResponse } from "next/server";
import User, { UserInterface } from "../../../../models/User";
import dbConnect from "../../../../lib/dbConnection";

export async function PUT(request: NextRequest) {
    try {
        const { userId, profilePic, firstName, lastName } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized Access" },
                { status: 401 }
            );
        }

        await dbConnect();

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "User doesn't exist" },
                { status: 404 }
            );
        }


        const updates: Partial<UserInterface> = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (profilePic) updates.image = profilePic;


        const updatedUser = await User.findByIdAndUpdate(
            existingUser._id,
            { $set: updates },
            { new: true }
        );


        return NextResponse.json(
            {
                success: true,
                message: "User updated successfully",
                user: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}