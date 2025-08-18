import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

        console.log("Frontend API: Attempting to register user with backend URL:", BACKEND_API_URL);
        console.log("Frontend API: Request body:", { name: body.name, email: body.email });

        const res = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log("Frontend API: Backend response status:", res.status);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Frontend API: Backend error response:", errorData);
            return NextResponse.json(errorData, { status: res.status });
        }

        const data = await res.json();
        console.log("Frontend API: Backend success response:", data);
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Frontend API: Error occurred:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}