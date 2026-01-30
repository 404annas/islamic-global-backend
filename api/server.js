import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';
import { createServer } from 'http';

// Initialize environment variables
dotenv.config();

// Connect to database once
let dbConnected = false;
if (!dbConnected) {
  connectDB().then(() => {
    dbConnected = true;
  }).catch(console.error);
}

// Create the Express server
const serverlessApp = express();

// Apply all your middleware and routes
serverlessApp.use('/api', app);

// Main handler for Vercel
export default async function handler(req, res) {
  // Wait a bit for DB connection if not ready
  if (!dbConnected) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Pass the request to the Express app
  serverlessApp(req, res);
}

export const config = {
  api: {
    externalResolver: true
  }
};