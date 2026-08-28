import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import db from "./db/db.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

import { initEmailService } from "./services/emailService.js";
import { initializeSocket } from "./socket/socketHandler.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS config — shared between Express and Socket.IO
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions,
});
app.set('io', io); // Make io available to REST controllers
initializeSocket(io);

app.get("/api/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      message: "API and database are working",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/conversations", conversationRoutes);

// Initialize email service
initEmailService();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});