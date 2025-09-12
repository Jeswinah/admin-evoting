import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // In a real application, you would:
    // 1. Hash and compare passwords
    // 2. Query your database
    // 3. Generate JWT tokens
    // 4. Set secure HTTP-only cookies

    // For demo purposes, we'll use hardcoded credentials
    if (email === "admin@voting.com" && password === "admin123") {
      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          user: { email, role: "admin" },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
