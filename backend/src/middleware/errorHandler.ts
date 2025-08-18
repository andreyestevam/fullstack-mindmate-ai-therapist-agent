import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// This class will let us create custom errors for extra info
export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true; // Helps us differentiate from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

// This will handle errors we do not want to be public (for security reasons)
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if(err instanceof AppError) { // If it is not an AppError, it is most likely a programming or system issue.
        return res.status(err.statusCode).json({ status: err.status, message: err.message, });
    }

    // Else, we will log the error for debugging
    logger.error("Unexpected error:", err);

    // Send generic error for unexpected errors
    return res.status(500).json({ status: "error", message: "Something went wrong",});
};