import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest, {params}: {params: {sessionId: string}}){
    try{
        const {sessionId} = params;
        
        // Forward authorization header from the frontend request
        const authHeader = req.headers.get("Authorization");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }
        
        const response = await fetch(`${BACKEND_API_URL}/api/chat/sessions/${sessionId}/history`, {
            headers,
        });
        
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in chat history API:", error);
        return NextResponse.json(
            {error: "Failed to fetch chat history"},
            {status: 500}
        );
    }
}

// Post request to add a new message
export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
    try {
        const { sessionId } = params;
        const { message } = await req.json();

        if (!message) {
        return NextResponse.json(
            { error: "Message is required" },
            { status: 400 }
        );
        }

        // Forward authorization header from the frontend request
        const authHeader = req.headers.get("Authorization");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        const response = await fetch(
        `${BACKEND_API_URL}/api/chat/sessions/${sessionId}/messages`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({ message }),
        }
        );

        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
        { error: "Failed to process chat message" },
        { status: 500 }
        );
    }
}