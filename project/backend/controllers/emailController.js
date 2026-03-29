import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log(`Email Service: Initializing with Resend API`);

/**
 * Sends an interest email to the property owner/builder.
 * @param {string} to - Recipient email (Builder's email).
 * @param {string} senderMobile - Mobile number of the interested user.
 * @param {object} propertyInfo - Formatted string or object with property details.
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
export const sendInterestEmail = async (to, senderMobile, propertyInfo, senderEmail = null, senderName = "A user", builderName = "Builder") => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error("❌ Resend API Key missing in .env");
            return { success: false, error: "Missing API Key in .env" };
        }

        // Remove Indian country code (91) from the start of the mobile number if it exists
        const displayMobile = senderMobile.toString().startsWith('91')
            ? senderMobile.toString().substring(2)
            : senderMobile.toString();

        const dateStr = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
        const trackingId = Math.random().toString(36).substring(2, 8).toUpperCase();

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const replyToEmail = process.env.RESEND_REPLY_TO || 'dsaenterprise30@gmail.com';
        const subject = `New Property Interest: ${senderName} - [${trackingId}]`;
        
        const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Property Interest Notification</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p style="font-size: 16px; margin-top: 0;">Hello <strong>${builderName}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Great news! A user has expressed interest in one of your listed properties. Here are their contact details:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-weight: 600;">Interested User:</td>
                            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${senderName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Contact Number:</td>
                            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                                <a href="tel:+${senderMobile}" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 16px;">${displayMobile}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; color: #64748b; font-weight: 600;">Property Info:</td>
                            <td style="padding: 15px; color: #0f172a; line-height: 1.5;">${propertyInfo}</td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 16px; line-height: 1.6;">Please reach out to them as soon as possible to discuss the details and take this forward.</p>
                    ${senderEmail ? `<p style="font-size: 16px; line-height: 1.6;">You can also reply directly to this email to reach them at <a href="mailto:${senderEmail}" style="color: #2563eb;">${senderEmail}</a>.</p>` : ''}
                    
                    <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Best Regards,</p>
                        <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e293b; font-size: 16px;">DSA BUILDER Team</p>
                    </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p style="margin: 0;">Ref: ${trackingId} | Date: ${dateStr}</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: `DSA BUILDER <${fromEmail}>`,
            to: [to],
            replyTo: [senderEmail, replyToEmail].filter(Boolean),
            subject: subject,
            html: htmlContent,
            text: `Hello ${builderName},\n\n${senderName} (Mobile: ${displayMobile}) is interested in your property: ${propertyInfo}.\n\nPlease contact them soon.\n\nBest Regards,\nDSA BUILDER Team\n\nDate: ${dateStr}\nRef: ${trackingId}`
        });

        if (error) {
            console.error(`❌ Resend Email Notification Failed to ${to}:`, error.message);
            return { success: false, error: error.message, details: error };
        }

        console.log("✅ Email Sent via Resend: %s", data.id);
        return { success: true, messageId: data.id };
    } catch (err) {
        console.error("❌ Resend Dispatch Error:", err.message);
        return { success: false, error: err.message };
    }
};
