
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
    const { page = 1, limit = 10, search = '', status = '', paymentStatus = '', registrationType = '', expiration = '' } = req.query;

    // Build filter object
    const filter = { role: "user" };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    if (status) {
        switch(status) {
            case 'active':
                filter.isBlocked = false;
                break;
            case 'inactive': // assuming inactive means not paid
                filter.isPaid = false;
                break;
            case 'blocked':
                filter.isBlocked = true;
                break;
        }
    }

    if (paymentStatus) {
        switch(paymentStatus) {
            case 'paid':
                filter.isPaid = true;
                break;
            case 'unpaid':
                filter.isPaid = false;
                break;
        }
    }

    // Handle expiration filter
    if (expiration) {
        const now = new Date();
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

        switch(expiration) {
            case 'active':
                // Users with active trials (registrationType is 'form' and trial has not expired)
                if (registrationType && registrationType !== 'form') {
                    // If user selects expiration filter and a registrationType that's not 'form',
                    // there should be no results since only 'form' type has trials
                    filter._id = null; // This will result in no documents being returned
                } else {
                    filter.registrationType = 'form';
                    filter.trialExpiresAt = { $gte: now };
                }
                break;
            case 'expired':
                // Users with expired trials (registrationType is 'form' and trial has expired)
                if (registrationType && registrationType !== 'form') {
                    // If user selects expiration filter and a registrationType that's not 'form',
                    // there should be no results since only 'form' type has trials
                    filter._id = null; // This will result in no documents being returned
                } else {
                    filter.registrationType = 'form';
                    filter.trialExpiresAt = { $lt: now };
                }
                break;
            case 'expiring_soon':
                // Users with trials expiring in the next 3 days (registrationType is 'form')
                if (registrationType && registrationType !== 'form') {
                    // If user selects expiration filter and a registrationType that's not 'form',
                    // there should be no results since only 'form' type has trials
                    filter._id = null; // This will result in no documents being returned
                } else {
                    filter.registrationType = 'form';
                    filter.trialExpiresAt = { $gte: now, $lte: threeDaysFromNow };
                }
                break;
        }
    }
    if (registrationType && !expiration) {
        // Only apply registrationType filter if expiration filter is not applied
        filter.registrationType = registrationType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    return res.status(200).json(new ApiResponse(200, {
        users,
        total,
        page: parseInt(page),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
    }));
});


export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { paymentStatus } = req.body;

    // Convert paymentStatus string to boolean
    const isPaid = paymentStatus === 'paid';

    const user = await User.findByIdAndUpdate(
        userId,
        {
            isPaid,
            trialExpiresAt: isPaid ? null : undefined // Clear trial if paid, keep if unpaid
        },
        { new: true }
    );

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
    console.log("Received request body:", req.body); // Debug log

    // The route is /admin/users/:userId/progress, so userId comes from the URL parameter
    const userId = req.params.userId;
    console.log("Extracted userId from params:", userId); // Debug log

    // The progress data comes from the request body
    const { progressData } = req.body;
    console.log("Extracted progressData from body:", progressData); // Debug log

    // Extract fields from progressData if it exists, otherwise from req.body directly
    const { status, timing, lesson, performance, remarks, teacherName } = progressData || req.body;

    console.log("Extracted fields:", { status, timing, lesson, performance, remarks }); // Debug log

    // Validate that required fields are provided
    if (!userId) {
        throw new ApiError(400, "User ID is required to create progress report");
    }
    if (!status) {
        status = "active"; // Provide a default if not specified
    }

    const progress = await Progress.create({
        user: userId,  // This should be the user ObjectId
        status,
        timing,
        lesson,
        performance,
        remarks,
        addedBy: req.user._id
    });
    console.log("Created progress:", progress); // Debug log
    return res.status(201).json(new ApiResponse(201, progress, "Progress report submitted."));
});

export const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).select("-password -refreshToken");
    if (!user) throw new ApiError(404, "User not found.");
    return res.status(200).json(new ApiResponse(200, user, "User details fetched."));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found.");

    // Assuming status refers to account status (active/inactive)
    user.status = status;
    await user.save();

    return res.status(200).json(new ApiResponse(200, user, "User status updated."));
});

export const getUserProgress = asyncHandler(async (req, res) => {
    const progress = await Progress.find({ user: req.params.userId })
        .sort({ createdAt: -1 })
        .populate("user", "name email");

    return res.status(200).json(new ApiResponse(200, progress, "User progress fetched."));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", isBlocked: false });
    const paidUsers = await User.countDocuments({ role: "user", isPaid: true });
    const blockedUsers = await User.countDocuments({ role: "user", isBlocked: true });

    const stats = {
        totalUsers,
        activeUsers,
        paidUsers,
        blockedUsers
    };

    return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched."));
});

export const logoutAdmin = asyncHandler(async (req, res) => {
    // Clear cookies if they exist
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, {}, "Admin logged out successfully."));
});

// Get admin profile
export const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await User.findById(req.user._id).select("-password -refreshToken");
    if (!admin) throw new ApiError(404, "Admin not found.");

    return res.status(200).json(new ApiResponse(200, admin, "Admin profile fetched."));
});

// Update admin profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;

    const admin = await User.findById(req.user._id);
    if (!admin) throw new ApiError(404, "Admin not found.");

    // Check if email is already taken by another user
    if (email && email !== admin.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: admin._id } });
        if (existingUser) {
            throw new ApiError(409, "Email already taken by another user.");
        }
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;

    await admin.save();

    return res.status(200).json(new ApiResponse(200, admin, "Admin profile updated."));
});

// Change admin password
export const changeAdminPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const admin = await User.findById(req.user._id);
    if (!admin) throw new ApiError(404, "Admin not found.");

    const isPasswordCorrect = await admin.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) throw new ApiError(400, "Current password is incorrect.");

    if (newPassword !== confirmPassword) throw new ApiError(400, "New passwords do not match.");

    if (currentPassword === newPassword) throw new ApiError(400, "New password must be different from current password.");

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully."));
});

// Delete admin account
export const deleteAdminAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    const admin = await User.findById(req.user._id);
    if (!admin) throw new ApiError(404, "Admin not found.");

    const isPasswordCorrect = await admin.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiError(400, "Password is incorrect.");

    // Delete the admin account
    await User.findByIdAndDelete(req.user._id);

    // Clear cookies if they exist
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, {}, "Admin account deleted successfully."));
});
