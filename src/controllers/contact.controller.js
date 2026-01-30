import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/mail.js";

export const submitContactMessage = asyncHandler(async (req, res) => {
    const { name, phone, email, message } = req.body;

    // Validation
    if (!name || !phone || !email || !message) {
        throw new ApiError(400, "All fields are required: name, phone, email, message");
    }

    // Basic validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Prepare professional email content with HTML template
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Karachi' // Pakistan timezone
    });

    const emailContent = `
        New Contact Message Received:

        Name: ${name}
        Phone: ${phone}
        Email: ${email}
        Message: ${message}

        Timestamp: ${formattedTime}
    `;

    const contactEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message - Islamic Global Institute</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 30px 20px; text-align: center; background-color: #1C8E5A; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Islamic Global Institute</h1>
                            <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Online Islamic Education Platform</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin-top: 0; font-size: 22px;">New Contact Message</h2>
                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                A new contact message has been received through the Islamic Global Institute website.
                            </p>

                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #1C8E5A; margin-top: 0;">Contact Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Name:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Phone:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${phone}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Email:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top; vertical-align: top;"><strong>Message:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${message}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f1; border-left: 4px solid #1C8E5A; border-radius: 4px;">
                                <strong>Received on:</strong> ${formattedTime}
                            </div>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                Please respond to this inquiry as soon as possible.
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

    try {
        // Send email to admin
        await sendEmail({
            email: process.env.CONTACT_EMAIL || "annasking601@gmail.com", // Updated to specified email
            subject: "New Contact Message - Islamic Global Institute",
            message: emailContent,
            html: contactEmailTemplate  // Using the professional HTML template
        });

        return res.status(200).json(
            new ApiResponse(200, { success: true }, "Contact message sent successfully")
        );
    } catch (error) {
        console.error("Error sending contact email:", error);
        throw new ApiError(500, "Failed to send contact message");
    }
});

export const submitTrialRequest = asyncHandler(async (req, res) => {
    const { name, email, phone, message, course, gender } = req.body;

    // Validation
    if (!name || !email || !phone || !course) {
        throw new ApiError(400, "Name, email, phone, and course are required for trial request");
    }

    // Basic validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Prepare professional email content with HTML template
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Karachi' // Pakistan timezone
    });

    const emailContent = `
        New Trial Request Received:

        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Course: ${course}
        Gender: ${gender || 'Not specified'}
        Message: ${message || 'No additional message'}

        Timestamp: ${formattedTime}
    `;

    const trialEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Trial Request - Islamic Global Institute</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 30px 20px; text-align: center; background-color: #1C8E5A; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Islamic Global Institute</h1>
                            <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Online Islamic Education Platform</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin-top: 0; font-size: 22px;">New Trial Request</h2>
                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                A new trial request has been received through the Islamic Global Institute website.
                            </p>

                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #1C8E5A; margin-top: 0;">Trial Request Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Name:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Email:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Phone:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${phone}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Course:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${course}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;"><strong>Gender:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${gender || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top; vertical-align: top;"><strong>Message:</strong></td>
                                        <td style="padding: 8px 0; vertical-align: top;">${message || 'No additional message'}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f1; border-left: 4px solid #1C8E5A; border-radius: 4px;">
                                <strong>Received on:</strong> ${formattedTime}
                            </div>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                                Please process this trial request as soon as possible.
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

    try {
        // Send email to admin
        await sendEmail({
            email: process.env.CONTACT_EMAIL || "annasking601@gmail.com", // Updated to specified email
            subject: "New Trial Request - Islamic Global Institute",
            message: emailContent,
            html: trialEmailTemplate  // Using the professional HTML template
        });

        return res.status(200).json(
            new ApiResponse(200, { success: true }, "Trial request submitted successfully")
        );
    } catch (error) {
        console.error("Error sending trial request email:", error);
        throw new ApiError(500, "Failed to submit trial request");
    }
});