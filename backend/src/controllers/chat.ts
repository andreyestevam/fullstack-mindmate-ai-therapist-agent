import { Request, Response } from "express";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { inngest } from "../inngest/client";
import { User } from "../models/User";
import { InngestSessionResponse, InngestEvent } from "../types/inngest";
import { Types } from "mongoose";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
    try{
        if (!req.user || !req.user.id) {
            return res.status(401).json({message: "Unauthorized",});
        }

        const userId = new Types.ObjectId(req.user.id);
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        // Generate an unique session ID
        const sessionId = uuidv4();
        const session = new ChatSession({
            sessionId,
            userId,
            startTime: new Date(),
            status: "active",
            messages: [],
        });

        await session.save();

        res.status(201).json({message: "Chat session created successfully", sessionId: session.sessionId,});
    } catch (error) {
        logger.error("Error creating chat session:", error);
        res.status(500).json({
            message: "Error creating chat session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Send a message to the chat session
export const sendMessage = async (req: Request, res: Response) => {
    try{
        const { sessionId } = req.params;
        const { message } = req.body;
        const userId = new Types.ObjectId(req.user.id);

        logger.info("Processing message:", {sessionId, message});

        const session = await ChatSession.findOne({sessionId, userId});

        if(!session){
            logger.warn("Session not found:", {sessionId});
            return res.status(404).json({message: "Session not found"});
        }

        if(session.userId.toString() !== userId.toString()) {
            logger.warn("Unauthorized access attempt:", {sessionId, userId});
            return res.status(403).json({message: "Unauthorized"});
        }

        // Create inngest event for message processing
        const event: InngestEvent = {
            name: 'therapy/session.message',
            data: {
                message,
                history: session.messages,
                memory: {
                userProfile: {
                    emotionalState: [],
                    riskLevel: 0,
                    preferences: {},
                },
                sessionContext: {
                    conversationThemes: [],
                    currentTechnique: null,
                },
                },
                goals: [],
                systemPrompt: `You are an AI therapist assistant. Your role is to:
                1. Provide empathetic and supportive responses
                2. Use evidence-based therapeutic techniques
                3. Maintain professional boundaries
                4. Monitor for risk factors
                5. Guide users toward their therapeutic goals`,
            },
        };

        logger.info("Sending message to Inngest:", {event});

        await inngest.send(event);

        // Generate therapeutic response using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const therapeuticPrompt = `You are an AI therapist assistant. Your role is to:
        1. Provide empathetic and supportive responses
        2. Use evidence-based therapeutic techniques when appropriate
        3. Maintain professional boundaries
        4. Monitor for risk factors and respond appropriately
        5. Guide users toward their therapeutic goals
        6. Keep responses concise but meaningful (2-3 sentences max)

        User message: ${message}
        
        Previous conversation context: ${JSON.stringify(session.messages.slice(-3))}
        
        Provide a warm, professional therapeutic response that acknowledges their feelings and offers gentle guidance or asks a thoughtful follow-up question.`;

        const result = await model.generateContent(therapeuticPrompt);
        const therapeuticResponse = result.response.text();

        const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
        Message: ${message}
        Context: ${JSON.stringify({
            memory: event.data.memory,
            goals: event.data.goals,
        })}
        
        Required JSON structure:
        {
            "emotionalState": "string",
            "themes": ["string"],
            "riskLevel": number,
            "recommendedApproach": "string",
            "progressIndicators": ["string"]
        }`;

        const analysisResult = await model.generateContent(analysisPrompt);
        let analysis;
        try {
            analysis = JSON.parse(analysisResult.response.text());
        } catch (parseError) {
            logger.warn("Failed to parse analysis JSON, using default:", parseError);
            analysis = {
                emotionalState: "neutral",
                themes: ["general"],
                riskLevel: 0,
                recommendedApproach: "supportive",
                progressIndicators: ["engagement"]
            };
        }

        logger.info("Generated response:", therapeuticResponse);

        // Add message to session history
        session.messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });

        session.messages.push({
            role: "assistant",
            content: therapeuticResponse || "No response generated",
            timestamp: new Date(),
            metadata: {
                analysis,
                progress: {
                    emotionalState: analysis.emotionalState,
                    riskLevel: analysis.riskLevel,
                },
            },
        });

        // Save updated session
        await session.save();
        logger.info("Session updated successfully:", {sessionId});

        res.json({
            response: therapeuticResponse, 
            message: therapeuticResponse, 
            analysis, 
            metadata:{
                progress:{
                    emotionalState: analysis.emotionalState,
                    riskLevel: analysis.riskLevel,
                },
            },
        });
    } catch (error) {
        logger.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Error processing message",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Get chat session history
export const getSessionHistory = async (req: Request, res: Response) => {
    try{
        const {sessionId} = req.params;
        const userId = new Types.ObjectId(req.user.id);

        const session = (await ChatSession.findOne({sessionId, userId,}).exec()) as IChatSession | null;

        if(!session){
            return res.status(404).json({ message: "Session not found"});
        }

        if(session.userId.toString() !== userId.toString()){
            return res.status(403).json({message: "Unauthorized"});
        }

        res.json({
            messages: session.messages,
            startTime: session.startTime,
            stats: session.status
        });
    } catch (error) {
        logger.error("Error fetching session history:", error);
        res.status(500).json({message: "Error fetching session history"});
    }
}

export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    logger.info(`Getting chat session: ${sessionId}`);
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      logger.warn(`Chat session not found: ${sessionId}`);
      return res.status(404).json({ error: "Chat session not found" });
    }
    logger.info(`Found chat session: ${sessionId}`);
    res.json(chatSession);
  } catch (error) {
    logger.error("Failed to get chat session:", error);
    res.status(500).json({ error: "Failed to get chat session" });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = new Types.ObjectId(req.user.id);

    // Find session by sessionId instead of _id
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(session.messages);
  } catch (error) {
    logger.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

// Get all chat sessions for a user
export const getAllChatSessions = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = new Types.ObjectId(req.user.id);
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Format the sessions for the frontend
    const formattedSessions = sessions.map((session: any) => ({
      sessionId: session.sessionId,
      messages: session.messages || [],
      createdAt: session.startTime,
      updatedAt: session.updatedAt || session.startTime,
    }));

    res.json(formattedSessions);
  } catch (error) {
    logger.error("Error fetching chat sessions:", error);
    res.status(500).json({ message: "Error fetching chat sessions" });
  }
};