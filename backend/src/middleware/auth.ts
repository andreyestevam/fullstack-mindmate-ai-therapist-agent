import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

// Extends Express Request type to include user
declare global{
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Auth middleware function
export const auth = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.header("Authorization")?.replace(/^Bearer\s+/, "");

        if(!token){
            return res.status(401).json({ message: "Authentication required" }); // Unauthorized
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as any;
        const user = await User.findById(decoded.userId);

        if(!user){
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid authentication token" });
    }
};