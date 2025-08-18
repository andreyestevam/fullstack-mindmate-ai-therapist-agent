// Handles user registration, login, and logout.

import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import bcrypt from "bcrypt"; // Will be used for password encryption
import jwt from "jsonwebtoken";

// Register new user function (async since it performs database operations)
export const register = async(req: Request, res: Response) => {
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "Name, email, and password are required."}); // Bad request
        }

        const existingUser = await User.findOne({email}); // We do not want two users to have the same email.

        if(existingUser){
            return res.status(400).json({message: "Email already in use."});
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        // Create new user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Response to confirm the registration
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            message: "User registered successfully.",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// Login function (for registered users)
export const login = async(req: Request, res: Response) => {
    try{
        const {email, password} = req.body;
        if (!email || !password){
            return res.status(400).json({ message: "Email and password are required." }); // Bad request
        }

        // Email verification
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({ message: "Invalid email or password." }); // Unauthorized
        }
        
        // Password verification
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // JWT Token generation
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!, // Must be a string.
            { expiresIn: "24h" }
        );

        // Session creation
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const session = new Session({
            userId: user._id,
            token,
            expiresAt,
            deviceInfo: req.headers["user-agent"],
        });

        await session.save(); // New session document is created and saved (links to the user's info).

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
            message: "Login successful",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error});
    }
};

// Logout function
export const logout = async(req: Request, res: Response) => {
    try{
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if(token){
            await Session.deleteOne({ token }); // Deletes the given token so it can no longer be used for authentication.
        }
        res.json({ message: "Logged out successfully" });
    } catch (error){
        res.status(500).json({ message: "Server error", error });
    }
};