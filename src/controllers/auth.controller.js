
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/mail.js";
import crypto from "crypto";

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, gender, course, registrationType, message } = req.body;

    const existed = await User.findOne({ email });
    if (existed) throw new ApiError(409, "User with this email already exists.");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    let trialExpiresAt = null;
    let isPaid = false;

    if (registrationType === "form") {
        trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 3);
    } else if (registrationType === "register") {
        // For users who register via the Register tab (just informational)
        // They don't get trial access, just registered status
        // We'll contact them later to understand their purpose
    } else {
        // For all other registration types (including 'plan'), mark as paid
        isPaid = true;
    }

    const user = await User.create({
        name, email, password, phone, gender, course, registrationType, message,
        trialExpiresAt, isPaid, otp, otpExpiry
    });

    try {
        // Professional OTP email template
        const otpEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - Islamic Global Institute</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 30px 20px; text-align: center; background-color: #1C8E5A; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <img src="cid:logo" alt="Islamic Global Institute" style="height: 60px; margin-bottom: 10px;" />
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Islamic Global Institute</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin-top: 0; font-size: 22px;">Verify Your Account</h2>
                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                Dear <strong>${name}</strong>,
                            </p>
                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                Thank you for registering with Islamic Global Institute. To complete your registration, please use the following One-Time Password (OTP):
                            </p>

                            <div style="text-align: center; margin: 30px 0;">
                                <div style="display: inline-block; background-color: #1C8E5A; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 8px;">
                                    ${otp}
                                </div>
                            </div>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                This OTP is valid for <strong>15 minutes</strong>. If you didn't request this verification, please ignore this email.
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                Once verified, you'll gain access to our comprehensive Islamic education platform where you can begin your spiritual journey.
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                Best regards,<br>
                                <strong>The Islamic Global Institute Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <p style="color: #888888; font-size: 12px; margin: 0;">
                                Islamic Global Institute<br>
                                H no R-107 Gulistan e Malir, Shah Faisal, Karachi, Pakistan<br>
                                Contact: +92 3132661982 | theislamicglobalinstitute456@gmail.com
                            </p>
                            <p style="color: #888888; font-size: 12px; margin: 10px 0 0;">
                                This is an automated message, please do not reply directly to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        await sendEmail({
            email: user.email,
            subject: "Verify Your Account - Islamic Global Institute",
            message: `Your OTP is: ${otp}. It expires in 15 minutes.`,
            html: otpEmailTemplate  // Using the professional HTML template
        });
    } catch (error) { console.error("Mail Error: ", error.message); }

    const options = { httpOnly: true, secure: true };
    res.cookie("preferred_course", course, options);

    return res.status(201).json(new ApiResponse(201, { userId: user._id }, "OTP sent to email."));
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });
    if (!user) throw new ApiError(400, "Invalid or expired OTP.");

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Account verified successfully."));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found.");

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiError(401, "Invalid credentials.");

    if (!user.isVerified) throw new ApiError(401, "Verify your email before logging in.");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = { httpOnly: true, secure: true };
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user, accessToken }, "Logged in successfully."));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing.");

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (!user || user.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Invalid refresh token.");

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
            .json(new ApiResponse(200, { accessToken }, "Token refreshed."));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token.");
    }
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "Email not registered.");

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.forgotPasswordToken = resetToken;
    user.forgotPasswordExpiry = Date.now() + 3600000;
    await user.save();

    await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: `Your reset token is: ${resetToken}`
    });

    return res.status(200).json(new ApiResponse(200, {}, "Reset token sent."));
});
