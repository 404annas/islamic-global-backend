
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
import contactRouter from "./routes/contact.routes.js";

const app = express();

// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: "Global rate limit exceeded."
});

app.use(globalLimiter);
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Enterprise Logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// API Versioning
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1", contactRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Islamic Global Backend API - Running"
    });
});


// Advanced Global Error Handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`\x1b[31m[API ERROR]\x1b[0m ${req.method} ${req.url} >> ${message}`);
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});

export default app;
