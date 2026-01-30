
import { Router } from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import { getAdminAnalytics, listAllUsers, updatePaymentStatus, updateBlockStatus, createProgressReport } from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT, isAdmin);

router.get("/analytics", getAdminAnalytics);
router.get("/users", listAllUsers);
router.patch("/payment/:userId", updatePaymentStatus);
router.patch("/block/:userId", updateBlockStatus);
router.post("/report", createProgressReport);

export default router;
