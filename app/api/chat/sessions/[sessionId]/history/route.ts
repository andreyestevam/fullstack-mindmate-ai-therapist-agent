import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest, {params}: {params: {sessionId: string}}){
    try{
        const {sessionId} = params;
        console.log(`Getting chat history for session ${sessionId}`);

        const response = await fetch(`${BACKEND_API_URL}/api/chat/sessions/${sessionId}/history`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if(!response.ok){
            const error = await response.json();
            console.error("Failed to get chat history", error);
            return NextResponse.json({error: error.error || "Failed to get chat history"},
                {status: response.status}
            );
        }

        const data = await response.json();

        const formattedMessages = data.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
        }));

        return NextResponse.json(formattedMessages);
    } catch (error) {
        return NextResponse.json({error: "Failed to get chat history"}, {status: 500});
    }
}