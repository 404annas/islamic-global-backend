
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserDashboard } from "../controllers/user.controller.js";

const router = Router();

router.get("/dashboard", verifyJWT, getUserDashboard);

export default router;
