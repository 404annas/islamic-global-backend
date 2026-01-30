
import { Router } from "express";
import { register, verifyOtp, login, refreshAccessToken, forgotPassword } from "../controllers/auth.controller.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many attempts, please try again after 15 minutes."
});

router.post("/register", authLimiter, register);
router.post("/verify-otp", verifyOtp);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);

export default router;
