import dotenv from "dotenv";
// Load env vars
dotenv.config();

import express, { Request, Response } from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/index"
import { functions as inngestFunctions } from "./inngest/functions";
import { logger } from "./utils/logger";
import { connectDB } from "./utils/db";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth"
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Allows requests only from the specific front-end domain.
app.use(helmet()); // Security middleware that fortifies the express apps by setting various HTTP headers.
app.use(morgan("dev")); // Activates an HTTP request logger middleware. Records details about HTTP requests

const PORT = 3001;

// Parse JSON body
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use('/api/mood', moodRouter);
app.use('/api/activity', activityRouter);

// Error handling
app.use(errorHandler);

const startServer = async() => {
    try{
        // Connect to database

        await connectDB();

        const PORT = process.env.PORT || 3001;

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Inngest endpoint available at http://localhost:${PORT}/api/inngest`);
        });
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();