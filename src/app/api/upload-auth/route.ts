// File: app/api/upload-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server"
import { NextResponse } from "next/server"

export async function GET() {

    const { token, expire, signature } = getUploadAuthParams({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string, // Never expose this on client side
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      
    })

    try {

        const authenticationParams = { token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY };

        return Response.json(authenticationParams)
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        }, { status: 500 })
    }
}