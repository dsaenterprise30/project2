import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const smtpConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: (process.env.EMAIL_PORT == '465'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
    },
    tls: {
        rejectUnauthorized: false
    }
};

console.log("Testing SMTP with config:", {
    host: smtpConfig.host,
    port: smtpConfig.port,
    user: smtpConfig.auth.user,
    pass: smtpConfig.auth.pass ? "****" : "MISSING"
});

const transporter = nodemailer.createTransport(smtpConfig);

const testEmail = async () => {
    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("✅ Connection verified!");

        const mailOptions = {
            from: `"DSA BUILDER TEST" <${process.env.EMAIL_USER}>`,
            to: "dsaunderconstruction@gmail.com",
            subject: "Live Link Email Verification Test",
            text: "This is a test email to verify if the live link email service is working correctly.\n\nSent at: " + new Date().toLocaleString(),
            html: "<b>This is a test email to verify if the live link email service is working correctly.</b><br><br>Sent at: " + new Date().toLocaleString()
        };

        console.log("Sending test email to dsaunderconstruction@gmail.com...");
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Email Test Failed:");
        console.error(error);
    }
};

testEmail();
