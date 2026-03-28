import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

/**
 * Diagnostics script for SMTP connectivity.
 * Usage: node scripts/test-smtp.js
 */
async function testSMTP() {
    console.log("--- SMTP Diagnostics Start ---");
    console.log("Time:", new Date().toISOString());
    console.log("Node version:", process.version);
    
    // Check for credentials
    const user = process.env.EMAIL_USER;
    const rawPass = process.env.EMAIL_PASS;
    const pass = rawPass ? rawPass.replace(/\s+/g, '') : ''; // Strip spaces
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = process.env.EMAIL_PORT || 587;
    
    if (!user || !pass) {
        console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not found in environment.");
        process.exit(1);
    }
    
    console.log(`Config: HOST=${host}, PORT=${port}, USER=${user}`);
    console.log(`Pass check: ${rawPass ? 'FOUND' : 'MISSING'} (Raw Length: ${rawPass ? rawPass.length : 0}, Stripped Length: ${pass.length})`);
    
    const configs = [
        { name: "Explicit Port 587 (STARTTLS)", host, port: 587, secure: false },
        { name: "Explicit Port 465 (SSL/TLS)", host, port: 465, secure: true },
        { name: "Nodemailer 'gmail' service", service: 'gmail' }
    ];

    for (const config of configs) {
        console.log(`\n--- Testing Configuration: ${config.name} ---`);
        const transporter = nodemailer.createTransport({
            ...config,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });

        console.log("Step 1: Verifying connection...");
        try {
            await transporter.verify();
            console.log("✅ SUCCESS: Connection verified");
            
            console.log("Step 2: Sending test email...");
            const mailOptions = {
                from: `"SMTP Diagnostics" <${user}>`,
                to: user,
                subject: `SMTP Test (${config.name}): ${new Date().toISOString()}`,
                text: `This is a diagnostic email using ${config.name}.`
            };
            
            const info = await transporter.sendMail(mailOptions);
            console.log("✅ SUCCESS: Test email sent!");
            console.log("Message ID:", info.messageId);
        } catch (error) {
            console.error("❌ FAILED");
            console.error("Error Code:", error.code);
            console.error("Error Message:", error.message);
        }
    }
    
    console.log("\n--- SMTP Diagnostics End ---");
}

testSMTP();
