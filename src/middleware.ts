import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PROTECTED_MATCHERS = [
  "/update-profile",
  "/chat",
  "/profile", // will match /profile and /profile/:username
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only check protected routes
  const requiresAuth = PROTECTED_MATCHERS.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  )
  if (!requiresAuth) return NextResponse.next()

  // getToken reads the NextAuth JWT from cookies
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    // Redirect to NextAuth sign-in page with callback to current URL
    const signInUrl = new URL("/api/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Allow the request
  return NextResponse.next()
}

export const config = {
  // apply middleware only to these path patterns
  matcher: [
    "/update-profile/:path*",
    "/chat/:path*",
    "/profile/:path*",
  ],
}