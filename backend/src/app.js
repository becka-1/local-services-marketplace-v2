import express from "express";
import cors from "cors";
import "dotenv/config";

import db from "./db/db.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});