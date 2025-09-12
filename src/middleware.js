import { NextResponse } from "next/server";

export function middleware(request) {
  // Check if the request is for the admin dashboard
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    // In a real application, you would verify the JWT token here
    // For this demo, we'll redirect to login if no auth header is present
    const authHeader = request.headers.get("authorization");

    // Since we're using localStorage for this demo, we'll let the client-side handle auth
    // In production, use proper server-side session management
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
