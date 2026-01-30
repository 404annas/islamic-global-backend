import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import app from '../src/app.js'; 

dotenv.config();

export default async (req, res) => {
  try {
    // 1. Ensure Database is connected
    await connectDB();

    // 2. Handle the request using the main app logic from src/app.js
    return app(req, res);
  } catch (error) {
    console.error("CRITICAL_FUNCTION_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Serverless Function Crashed",
      error: error.message
    });
  }
};