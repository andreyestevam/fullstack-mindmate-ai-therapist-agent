export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    metadata?: {
        technique: string;
        goal: string;
        progress: any[];
        analysis?: {
        emotionalState: string;
        themes: string[];
        riskLevel: number;
        recommendedApproach: string;
        progressIndicators: string[];
        };
    };
}

export interface ChatSession {
    sessionId: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse {
    message: string;
    response?: string;
    analysis?: {
        emotionalState: string;
        themes: string[];
        riskLevel: number;
        recommendedApproach: string;
        progressIndicators: string[];
    };
    metadata?: {
        technique: string;
        goal: string;
        progress: any[];
    };
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

export const createChatSession = async (): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE}/api/chat/sessions`, {
        method: "POST",
        headers: getAuthHeaders(),
        });

        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
                const error = JSON.parse(errorText);
                throw new Error(error.error || error.message || `HTTP ${response.status}: Failed to create chat session`);
            } catch (parseError) {
                throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to create chat session'}`);
            }
        }

        const data = await response.json();
        return data.sessionId;
    } catch (error) {
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error("Unable to connect to the server. Please check if the backend is running.");
        }
        throw error;
    }
};

export const sendChatMessage = async (sessionId: string, message: string): Promise<ApiResponse> => {
    try {
        const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
        }
        );

        if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(error.error || `HTTP ${response.status}: Failed to send message`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
    try {
        const response = await fetch(
        `${API_BASE}/api/chat/sessions/${sessionId}/history`,
        {
            headers: getAuthHeaders(),
        }
        );

        if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(error.error || `HTTP ${response.status}: Failed to fetch chat history`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
        throw new Error("Invalid chat history format");
        }

        // Ensure each message has the correct format
        return data.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        metadata: msg.metadata,
        }));
    } catch (error) {
        throw error;
    }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
    try {
        const response = await fetch(`${API_BASE}/api/chat/sessions`, {
        headers: getAuthHeaders(),
        });

        if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(error.error || `HTTP ${response.status}: Failed to fetch chat sessions`);
        }

        const data = await response.json();

        return data.map((session: any) => {
        // Ensure dates are valid
        const createdAt = new Date(session.createdAt || Date.now());
        const updatedAt = new Date(session.updatedAt || Date.now());

        return {
            ...session,
            createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
            messages: (session.messages || []).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp || Date.now()),
            })),
        };
        });
    } catch (error) {
        throw error;
    }
};