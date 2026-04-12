import mongoose from "mongoose";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, InterviewSession } from "../db/database.js";
import { generateToken, authMiddleware } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = Router();

// ── POST /auth/register ──────────────────────────────────
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError("Email, password, and name are required");
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new AppError("Invalid email format");
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      name,
      password_hash: passwordHash,
      auth_provider: "email",
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarUrl: null,
      },
    });
  }),
);

// ── POST /auth/login ─────────────────────────────────────
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.password_hash) {
      throw new AppError(
        "This account uses Google login. Please sign in with Google.",
        401,
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
  }),
);

// ── POST /auth/google ────────────────────────────────────
router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
      throw new AppError("Google credential (ID Token) is required");
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture: avatarUrl } = payload;

      let user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Create new user from Google auth
        user = await User.create({
          email: email.toLowerCase(),
          name,
          avatar_url: avatarUrl || null,
          auth_provider: "google",
        });
      } else {
        // Update existing user with avatar if missing and names
        if (!user.avatar_url && avatarUrl) {
          user.avatar_url = avatarUrl;
          await user.save();
        }
      }

      const token = generateToken(user._id.toString());

      res.json({
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
        },
      });
    } catch (err) {
      console.error("Google verification failed:", err);
      throw new AppError(
        "Google authentication failed. Please try again.",
        401,
      );
    }
  }),
);

// ── GET /auth/me ─────────────────────────────────────────
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Get stats
    const statsAggr = await InterviewSession.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(req.userId),
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgScore: { $avg: "$overall_score" },
        },
      },
    ]);

    const stats = statsAggr[0] || { totalInterviews: 0, avgScore: 0 };

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        authProvider: user.auth_provider,
        targetRole: user.target_role,
        targetScore: user.target_score,
        createdAt: user.createdAt,
      },
      stats: {
        totalInterviews: stats.totalInterviews,
        avgScore: Math.round(stats.avgScore),
      },
    });
  }),
);

// ── PUT /auth/profile ────────────────────────────────────
router.put(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { name, avatarUrl, targetRole, targetScore } = req.body;

    if (!name || name.trim().length < 2) {
      throw new AppError("Name must be at least 2 characters");
    }

    const updates = {
      name: name.trim(),
      avatar_url: avatarUrl || null,
    };

    if (targetRole) updates.target_role = targetRole;
    if (targetScore !== undefined) updates.target_score = Number(targetScore);

    await User.findByIdAndUpdate(req.userId, updates);

    res.json({ message: "Profile updated" });
  }),
);

export default router;
