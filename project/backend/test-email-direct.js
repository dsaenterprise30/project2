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

const sendEmail = async () => {
    try {
        const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const trackingId = Math.random().toString(36).substring(2, 8).toUpperCase();

        const mailOptions = {
            from: `"DSA Enterprise" <${process.env.EMAIL_USER}>`,
            to: "secondcount18@gmail.com",
            subject: `Test Property Interest: Super Admin - [${trackingId}]`,
            text: `Hello Sahil,\n\nSuper Admin (Mobile: 917021062721) is interested in your property: 2 BHK in Malad West listed at 42000.\n\nPlease contact them soon.\n\nBest Regards,\nDSA Enterprise Team\n\nDate: ${dateStr}\nRef: ${trackingId}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Property Interest Notification</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="font-size: 16px; margin-top: 0;">Hello <strong>Sahil</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6;">Great news! A user has expressed interest in one of your listed properties. Here are their contact details:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-weight: 600;">Interested User:</td>
                                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">Super Admin</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Contact Number:</td>
                                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                                    <a href="tel:917021062721" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 16px;">917021062721</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; color: #64748b; font-weight: 600;">Property Info:</td>
                                <td style="padding: 15px; color: #0f172a; line-height: 1.5;">2 BHK in Malad West listed at 42000</td>
                            </tr>
                        </table>
                        
                        <p style="font-size: 16px; line-height: 1.6;">Please reach out to them as soon as possible to discuss the details and take this forward.</p>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Best Regards,</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e293b; font-size: 16px;">DSA Enterprise Team</p>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
                        <p style="margin: 0;">Ref: ${trackingId} | Date: ${dateStr}</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Direct Email Sent Successfully: %s", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

sendEmail();
