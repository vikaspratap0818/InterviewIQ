import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prevent crashes by handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION] 💥", err.name, err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[UNHANDLED REJECTION] 💥", reason);
});

import { initDb } from "./db/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { verifyToken } from "./middleware/auth.js";

import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes, { processAnswer } from "./routes/interview.js";
import codeRoutes from "./routes/code.js";

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Express App ──────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ── Initialize Database & Start Server ─────────────────────
async function startServer() {
  await initDb();

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║   AI Interview Platform — Backend Server     ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  🚀 Server:  ${PORT}           ║`);
    console.log(`║  🌐 Frontend: ${FRONTEND_URL}          ║`);
    console.log(
      `║  🤖 Gemini:  ${process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ NOT SET"}                   ║`,
    );
    console.log("║                                              ║");
    console.log("╚══════════════════════════════════════════════╝");
    console.log("");
  });
}

startServer();

app.use((req, res, next) => {
  console.log("🔥 Incoming:", req.method, req.url);
  next();
});

const allowedOrigins = [FRONTEND_URL];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://localhost:5174");
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    if (req.path !== "/health") {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
    }
  });
  next();
});

// ── API Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/compiler", codeRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ── Socket.io ────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));

  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`[WS] User ${socket.userId} connected`);

  socket.join(`user:${socket.userId}`);

  socket.on("join-interview", (sessionId) => {
    socket.join(`interview:${sessionId}`);
    console.log(`[WS] User ${socket.userId} joined interview ${sessionId}`);
  });

  // Real-time transcription relay & Processing
  socket.on("transcription", async (data) => {
    const { sessionId, transcript, isFinal } = data;

    // Broadcast interim/final transcript back to the same user's other tabs
    socket.to(`user:${socket.userId}`).emit("transcription-update", data);

    // If it's a final transcript, process it as an answer
    if (isFinal && transcript && transcript.trim().length > 2) {
      try {
        console.log(`[WS] Processing voice answer for session ${sessionId}`);
        const result = await processAnswer({
          sessionId,
          userId: socket.userId,
          answer: transcript.trim(),
        });

        // Emit the AI's response back to the user
        io.to(`interview:${sessionId}`).emit("ai-question", result);
      } catch (err) {
        console.error("[WS] Error processing voice answer:", err.message);
        socket.emit("error", { message: "Failed to process voice answer" });
      }
    }
  });

  // Interview progress updates
  socket.on("interview-progress", (data) => {
    io.to(`interview:${data.sessionId}`).emit("progress-update", data);
  });

  socket.on("disconnect", () => {
    console.log(`[WS] User ${socket.userId} disconnected`);
  });
});

// Make io available to routes via app
app.set("io", io);

// ── Production Static Serving ─────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    // Only serve index.html if the request isn't for an API route
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

// ── Error Handler (must be last) ─────────────────────────
app.use(errorHandler);
