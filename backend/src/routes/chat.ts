import express from "express";
import { sendMessage, getChatSession, getChatHistory, createChatSession, getAllChatSessions } from "../controllers/chat";
import { auth } from "../middleware/auth";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all chat sessions for the user
router.get("/sessions", getAllChatSessions);

// Create a new chat session
router.post("/sessions", createChatSession);

// Get a specific chat session
router.post("/sessions/:sessionId", getChatSession);

// Send a message in a chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat history for a session
router.get("/sessions/:sessionId/history", getChatHistory);

export default router;