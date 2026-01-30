import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

// IMPORTANT: Path must go up one level (../) to reach the src folder
import authRouter from '../src/routes/auth.routes.js';
import adminRouter from '../src/routes/admin.routes.js';
import userRouter from '../src/routes/user.routes.js';
import contactRouter from '../src/routes/contact.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1", contactRouter);

app.get("/api", (req, res) => {
  res.status(200).json({ success: true, message: "API is Running on Vercel" });
});

// Database connection helper
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const db = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = db;
  return db;
}

// Vercel Serverless Handler
export default async (req, res) => {
  try {
    await connectToDatabase();
    // This passes the request to Express
    return app(req, res);
  } catch (error) {
    console.error("Vercel Handler Error:", error);
    res.status(500).json({ error: "External Server Error", details: error.message });
  }
};