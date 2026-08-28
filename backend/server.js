import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB, { getDbStatus } from "./config/db.js";
import { initCronJobs } from "./jobs/dailySync.js";
import { seedDatabase } from "./utils/seedData.js";
import { apiGlobalLimiter } from "./middleware/rateLimiter.js";
import { sanitizeRequest } from "./middleware/sanitizer.js";

// Routes
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import sportsRoutes from "./routes/sports.js";
import playersRoutes from "./routes/players.js";
import venuesRoutes from "./routes/venues.js";
import bookingsRoutes from "./routes/bookings.js";
import teamsRoutes from "./routes/teams.js";
import tournamentsRoutes from "./routes/tournaments.js";
import matchesRoutes from "./routes/matches.js";
import rulesRoutes from "./routes/rules.js";
import chatbotRoutes from "./routes/chatbot.js";
import officialBodiesRoutes from "./routes/officialBodies.js";
import clubsRoutes from "./routes/clubs.js";
import notificationsRoutes from "./routes/notifications.js";
import invitesRoutes from "./routes/invites.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Security Headers via Helmet (MIME sniffing, Clickjacking, CSP)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    noSniff: true,
    hidePoweredBy: true,
    contentSecurityPolicy: false, // Set false for local Vite dev script flexibility
  })
);

// Allowed Origins for Strict & Dynamic Production CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://playsphere-eight.vercel.app",
  "https://playsphere.vercel.app",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) return true;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) return true;
  return false;
};

// Configure Socket.io with credentials support
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Admin-Password"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb", strict: false }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Recursive input sanitization against XSS
app.use(sanitizeRequest);

// Global API rate limiting
app.use("/api/", apiGlobalLimiter);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("io", io);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/sports", sportsRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/venues", venuesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/official-bodies", officialBodiesRoutes);
app.use("/api/clubs", clubsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/invites", invitesRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: "ok",
    platform: "PlaySphere",
    version: "1.0.0",
    database: dbStatus.isMemory ? "In-Memory Storage Active" : "MongoDB",
    dbDetails: {
      connected: dbStatus.isConnected,
      isMemoryFallback: dbStatus.isMemory,
      host: dbStatus.host,
      name: dbStatus.name,
      error: dbStatus.error,
    },
    security: {
      rateLimiting: "Active",
      sanitization: "Active",
      helmetProtection: "Active",
      jwtExpiry: "7d",
    },
    timestamp: new Date().toISOString(),
  });
});

// Socket.io Real-time Match Rooms
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Client joins a specific match room (e.g., match_64a9f...)
  socket.on("join_match", (matchId) => {
    if (matchId) {
      const room = `match_${matchId}`;
      socket.join(room);
      console.log(`[Socket] Client ${socket.id} joined room ${room}`);
    }
  });

  // Client leaves match room
  socket.on("leave_match", (matchId) => {
    if (matchId) {
      const room = `match_${matchId}`;
      socket.leave(room);
      console.log(`[Socket] Client ${socket.id} left room ${room}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Production Unified Static Serving
const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API endpoint not found." });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      res.send("PlaySphere API is running. Frontend build in progress.");
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[ServerError]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Start Server and Database Connection
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    initCronJobs();

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🏆 PlaySphere Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server initialized`);
      console.log(`🛡️ Security safeguards active (Helmet, Rate Limiting, XSS Sanitizer)`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error("Failed to start PlaySphere server:", error);
    process.exit(1);
  }
};

startServer();
