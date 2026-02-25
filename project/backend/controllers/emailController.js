import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an interest email to the property owner/builder.
 * @param {string} to - Recipient email (Builder's email).
 * @param {string} senderMobile - Mobile number of the interested user.
 * @param {object} propertyInfo - Formatted string or object with property details.
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
export const sendInterestEmail = async (to, senderMobile, propertyInfo) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("❌ Email Credentials missing in .env");
            return { success: false, error: "Missing Credentials in .env" };
        }

        const info = await transporter.sendMail({
            from: `"DSA Enterprise" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: "Interested Client for Your Property - DSA Enterprise",
            text: `Hello,\n\nA user with mobile number ${senderMobile} is interested in your property: ${propertyInfo}.\n\nPlease contact them soon.\n\nBest Regards,\nDSA Enterprise Team`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #0f172a;">Property Interest Notification</h2>
                    <p>Hello,</p>
                    <p>A user with mobile number <strong>${senderMobile}</strong> has expressed interest in your property:</p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #cbd5e1;">
                        ${propertyInfo}
                    </div>
                    <p>Please contact them as soon as possible to discuss the details.</p>
                    <br>
                    <p>Best Regards,<br><strong>DSA Enterprise Team</strong></p>
                </div>
            `,
        });

        console.log("✅ Email Sent Successfully: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error: error.message };
    }
};
