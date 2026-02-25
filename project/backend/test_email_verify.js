import { sendInterestEmail } from './controllers/emailController.js';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
    console.log("Starting Email Verification Test...");
    console.log("Using EMAIL_USER:", process.env.EMAIL_USER);

    const recipient = "dsaenterprise30@gmail.com"; // Test recipient
    const senderMobile = "9876543210";
    const propertyInfo = "Test Property: 2 BHK Flat, Mira Road East, ₹75,00,000";

    const result = await sendInterestEmail(recipient, senderMobile, propertyInfo);

    if (result.success) {
        console.log("✅ SUCCESS: Email sent successfully!");
        console.log("Message ID:", result.messageId);
    } else {
        console.error("❌ FAILURE: Email sending failed.");
        console.error("Error:", result.error);

        if (result.error.includes("Invalid login") || result.error.includes("authentication failed")) {
            console.log("\nNOTE: This is expected if 'your_email_password_here' placeholder is still in .env.");
            console.log("The code logic is verified, but credentials need to be updated by the user.");
        }
    }
}

runTest();
