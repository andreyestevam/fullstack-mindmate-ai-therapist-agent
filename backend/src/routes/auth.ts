// Defines the API route for the authentication logic.

import { Router } from "express";
import { register, login, logout } from "../controllers/authController";

// Middleware for checkpoints in the Express application's flow
import { auth } from "../middleware/auth";

// Express router
const router = Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// POST /auth/logout
router.post("/logout", auth, logout); // Before the logout function is executed, it first goes through the middleware's auth (confirms only authenticated users can logout)

// GET /auth/me
router.get("/me", auth, (req,res) => {
    res.json({ user: req.user });
}); // Returns the details of the logged user.

export default router;