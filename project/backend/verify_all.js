import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000';
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, type = 'info') {
    const color = type === 'success' ? colors.green : type === 'error' ? colors.red : type === 'warn' ? colors.yellow : colors.blue;
    console.log(`${color}${message}${colors.reset}`);
}

function testResult(name, passed, details = '') {
    testsRun++;
    if (passed) {
        testsPassed++;
        log(`✅ ${name}`, 'success');
    } else {
        testsFailed++;
        log(`❌ ${name}`, 'error');
    }
    if (details) console.log(`   ${details}`);
}

async function runTests() {
    console.log('\n' + '='.repeat(60));
    log('🔍 COMPREHENSIVE API & DATABASE VERIFICATION', 'info');
    console.log('='.repeat(60) + '\n');

    // ===== 1. ENVIRONMENT VARIABLES =====
    log('\n📋 1. CHECKING ENVIRONMENT VARIABLES...', 'info');
    testResult('MONGODB_URI exists', !!process.env.MONGODB_URI);
    testResult('DATABASE_NAME exists', !!process.env.DATABASE_NAME);
    testResult('JWT_ACCESS_TOKEN_SECRET exists', !!process.env.JWT_ACCESS_TOKEN_SECRET);
    testResult('JWT_REFRESH_TOKEN_SECRET exists', !!process.env.JWT_REFRESH_TOKEN_SECRET);
    testResult('RAZORPAY_KEY_ID exists', !!process.env.RAZORPAY_KEY_ID);
    testResult('RAZORPAY_KEY_SECRET exists', !!process.env.RAZORPAY_KEY_SECRET);

    // ===== 2. DATABASE CONNECTION =====
    log('\n💾 2. CHECKING DATABASE CONNECTION...', 'info');
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        testResult('MongoDB connection successful', true, `Connected to: ${mongoose.connection.host}`);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        testResult('Database accessible', true, `Found ${collections.length} collections`);

        const collectionNames = collections.map(c => c.name);
        testResult('Users collection exists', collectionNames.includes('users'));
        testResult('Admin collection exists', collectionNames.includes('admin'));
        testResult('Agents collection exists', collectionNames.includes('brokers'));
        testResult('Builders collection exists', collectionNames.includes('builders'));

        // Check if users exist
        const usersCount = await db.collection('users').countDocuments();
        testResult('Users collection has data', usersCount > 0, `Found ${usersCount} users`);

    } catch (error) {
        testResult('MongoDB connection', false, error.message);
    }

    // ===== 3. BACKEND SERVER =====
    log('\n🖥️  3. CHECKING BACKEND SERVER...', 'info');
    try {
        const response = await fetch(API_BASE_URL);
        testResult('Backend server is running', response.status === 404 || response.status === 200, `Response status: ${response.status}`);
    } catch (error) {
        testResult('Backend server reachable', false, 'Server is not running on port 3000');
    }

    // ===== 4. API ENDPOINTS =====
    log('\n🔌 4. TESTING API ENDPOINTS...', 'info');

    // Test user routes
    try {
        const testMobile = '+917021062721';
        const testPassword = 'dsaenterprise@3333';

        // Test login endpoint
        const loginRes = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobileNumber: testMobile, password: testPassword })
        });

        const loginData = await loginRes.json();

        if (loginRes.status === 400) {
            testResult('Login API endpoint responds', true, 'Returns 400 for invalid credentials (expected)');
        } else if (loginRes.status === 200) {
            testResult('Login API endpoint works', true, 'User logged in successfully');

            // If login successful, test authenticated endpoints
            const token = loginData.token;

            // Test subscription status
            const subRes = await fetch(`${API_BASE_URL}/api/users/subscription-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            testResult('Subscription status API', subRes.ok, `Status: ${subRes.status}`);

        } else if (loginRes.status === 403) {
            testResult('Login API (subscription check)', true, 'Subscription inactive (expected for some users)');
        } else {
            testResult('Login API endpoint', false, `Unexpected status: ${loginRes.status}`);
        }

    } catch (error) {
        testResult('User API endpoints', false, error.message);
    }

    // Test housing routes (Agents)
    try {
        const housingRes = await fetch(`${API_BASE_URL}/api/housing/all-public`, {
            headers: { 'Authorization': 'Bearer fake-token' }
        });
        testResult('Housing API endpoint exists', housingRes.status === 401 || housingRes.status === 200, `Status: ${housingRes.status}`);
    } catch (error) {
        testResult('Housing API', false, error.message);
    }

    // Test commercial routes (Agents)
    try {
        const commercialRes = await fetch(`${API_BASE_URL}/api/comercial/all-public`, {
            headers: { 'Authorization': 'Bearer fake-token' }
        });
        testResult('Commercial API endpoint exists', commercialRes.status === 401 || commercialRes.status === 200, `Status: ${commercialRes.status}`);
    } catch (error) {
        testResult('Commercial API', false, error.message);
    }

    // Test analytics routes
    try {
        const analyticsRes = await fetch(`${API_BASE_URL}/api/analytics/get-analytics`);
        testResult('Analytics API endpoint exists', analyticsRes.status === 401 || analyticsRes.status === 200, `Status: ${analyticsRes.status}`);
    } catch (error) {
        testResult('Analytics API', false, error.message);
    }

    // ===== 5. FRONTEND CONFIGURATION =====
    log('\n🎨 5. CHECKING FRONTEND CONFIGURATION...', 'info');
    const fs = await import('fs');
    const path = await import('path');

    const frontendDir = path.join(process.cwd(), '..', 'frontend');

    try {
        const configPath = path.join(frontendDir, 'config.js');
        testResult('config.js exists', fs.existsSync(configPath));

        const firebaseConfigPath = path.join(frontendDir, 'firebaseConfig.js');
        testResult('firebaseConfig.js exists', fs.existsSync(firebaseConfigPath));

        const razorpayConfigPath = path.join(frontendDir, 'razorpayConfig.js');
        testResult('razorpayConfig.js exists', fs.existsSync(razorpayConfigPath));

        // Check for renamed files
        const housingLoginPath = path.join(frontendDir, 'housingLogin.html');
        testResult('housingLogin.html exists', fs.existsSync(housingLoginPath));

        const commercialLoginPath = path.join(frontendDir, 'commercialLogin.html');
        testResult('commercialLogin.html exists', fs.existsSync(commercialLoginPath));

        // Check old files don't exist
        const rentLoginPath = path.join(frontendDir, 'rentLogin.html');
        testResult('Old rentLogin.html removed', !fs.existsSync(rentLoginPath));

        const sellLoginPath = path.join(frontendDir, 'sellLogin.html');
        testResult('Old sellLogin.html removed', !fs.existsSync(sellLoginPath));

    } catch (error) {
        testResult('Frontend files check', false, error.message);
    }

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(60));
    log('📊 TEST SUMMARY', 'info');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testsRun}`);
    log(`Passed: ${testsPassed}`, 'success');
    if (testsFailed > 0) {
        log(`Failed: ${testsFailed}`, 'error');
    }
    const percentage = ((testsPassed / testsRun) * 100).toFixed(1);
    log(`Success Rate: ${percentage}%`, percentage >= 80 ? 'success' : 'warn');
    console.log('='.repeat(60) + '\n');

    // Close connections
    await mongoose.connection.close();
    process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
});
