import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Import routes separately to avoid immediate execution of database connection
import authRouter from './src/routes/auth.routes.js';
import adminRouter from './src/routes/admin.routes.js';
import userRouter from './src/routes/user.routes.js';
import contactRouter from './src/routes/contact.routes.js';

// Create a new Express app for serverless
const server = express();

server.use(express.json({ limit: "16kb" }));
server.use(express.urlencoded({ extended: true, limit: "16kb" }));

// API Versioning
server.use("/api/v1/auth", authRouter);
server.use("/api/v1/admin", adminRouter);
server.use("/api/v1/user", userRouter);
server.use("/api/v1", contactRouter);

server.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Islamic Global Backend API - Running"
    });
});

// Advanced Global Error Handling
server.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[API ERROR] ${req.method} ${req.url} >> ${message}`);
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});

// For Vercel, we need to export a handler function
let dbConnected = false;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Connect to database if not already connected
  if (!dbConnected) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      dbConnected = true;
      console.log('MongoDB Connected');
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  // Pass the request to the Express app
  server(req, res);
}

export const config = {
  api: {
    externalResolver: true
  }
};