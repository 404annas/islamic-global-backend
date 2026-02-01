
import { Router } from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import {
    getAdminAnalytics,
    listAllUsers,
    updatePaymentStatus,
    updateBlockStatus,
    createProgressReport,
    getUserDetails,
    updateUserStatus,
    getUserProgress,
    getDashboardStats,
    logoutAdmin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
    deleteAdminAccount
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT, isAdmin);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);

// Analytics routes
router.get("/analytics", getAdminAnalytics);

// Admin profile routes
router.get("/profile", getAdminProfile);
router.patch("/profile", updateAdminProfile);
router.patch("/change-password", changeAdminPassword);
router.delete("/delete-account", deleteAdminAccount);

// User management routes
router.get("/users", listAllUsers);
router.get("/users/:userId", getUserDetails);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/users/:userId/block", updateBlockStatus);
router.patch("/payment/:userId", updatePaymentStatus);

// Progress management routes
router.get("/users/:userId/progress", getUserProgress);
router.post("/users/:userId/progress", createProgressReport);

// Auth routes
router.post("/logout", logoutAdmin);

export default router;
