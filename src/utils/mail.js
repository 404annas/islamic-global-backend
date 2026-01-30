
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use App Password, not regular password
        },
    });

    const mailOptions = {
        from: `"Islamic Global Institute" <${process.env.EMAIL_USER}>`,
        to: options.email, // This is the user's email address
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // If HTML email contains logo CID reference, we need to attach the logo
    if (options.html && options.html.includes('src="cid:logo"')) {
        // For now, we'll skip the logo attachment to avoid complications
        // In production, you would need to attach the actual logo image
    }

    // Log the email attempt for debugging
    console.log(`Attempting to send email to: ${options.email}`);
    console.log(`From: ${process.env.EMAIL_USER}`);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

export { sendEmail };
