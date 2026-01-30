
import { Progress } from "../models/progress.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserDashboard = asyncHandler(async (req, res) => {
    const history = await Progress.find({ user: req.user._id }).sort({ date: -1 });

    // Trial Calculation
    let trialDaysRemaining = 0;
    if (req.user.registrationType === "form" && req.user.trialExpiresAt) {
        const diff = new Date(req.user.trialExpiresAt) - new Date();
        trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Attendance Stats
    const totalReports = history.length;
    const presentCount = history.filter(h => h.status === "present").length;
    const attendancePercentage = totalReports > 0 ? ((presentCount / totalReports) * 100).toFixed(2) : 0;

    const dashboardData = {
        profile: {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            course: req.user.course,
            registrationType: req.user.registrationType,
            isPaid: req.user.isPaid
        },
        stats: {
            trialDaysRemaining,
            attendancePercentage: `${attendancePercentage}%`,
            totalClasses: totalReports
        },
        progressHistory: history
    };

    return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard loaded."));
});
