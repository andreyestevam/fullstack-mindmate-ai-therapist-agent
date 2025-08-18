// Encapsulates the database connection logic

import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

export const connectDB = async() => {
    try{
        await mongoose.connect(MONGODB_URI);
        logger.info("Connected to MongoDB Atlas");
    } catch (error){
        logger.error("MongoDB connection error", error);
        process.exit(1);
    }
};