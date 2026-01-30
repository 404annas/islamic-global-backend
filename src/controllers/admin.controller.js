
import { User } from "../models/user.model.js";
import { Progress } from "../models/progress.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAdminAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: "user" });
    const paidUsers = await User.countDocuments({ role: "user", isPaid: true });
    const blockedUsers = await User.countDocuments({ role: "user", isBlocked: true });
    const activeTrials = await User.countDocuments({ registrationType: "form", trialExpiresAt: { $gt: new Date() } });

    const recentProgress = await Progress.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email");

    const analytics = {
        summary: { totalUsers, paidUsers, blockedUsers, activeTrials },
        recentActivity: recentProgress
    };

    return res.status(200).json(new ApiResponse(200, analytics, "Admin analytics fetched."));
});

export const listAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: "user" }).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, users));
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isPaid } = req.body;
    const user = await User.findByIdAndUpdate(userId, { isPaid, trialExpiresAt: isPaid ? null : undefined }, { new: true });
    return res.status(200).json(new ApiResponse(200, user, "Payment status updated."));
});

export const updateBlockStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) throw new ApiError(404, "User not found.");
    user.isBlocked = !user.isBlocked;
    await user.save();
    return res.status(200).json(new ApiResponse(200, user, "User block status updated."));
});

export const createProgressReport = asyncHandler(async (req, res) => {
    const { userId, status, timing, lesson, performance, remarks } = req.body;
    const progress = await Progress.create({
        user: userId, status, timing, lesson, performance, remarks, addedBy: req.user._id
    });
    return res.status(201).json(new ApiResponse(201, progress, "Progress report submitted."));
});
