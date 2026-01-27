import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testAdminEndpoints() {
    console.log('🧪 Testing Admin Dashboard API Endpoints\n');

    // Get admin token (you'll need valid admin credentials)
    console.log('Testing with mock admin token...\n');

    // Test 1: Builder /all endpoint
    console.log('1️⃣ Testing GET /api/builder/all');
    try {
        const response = await fetch(`${API_BASE}/api/builder/all`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer mock-token-for-testing`
            }
        });

        console.log(`   Status: ${response.status}`);
        const text = await response.text();
        console.log(`   Response (first 200 chars): ${text.substring(0, 200)}\n`);

        if (text.startsWith('<!DOCTYPE')) {
            console.log('   ❌ ERROR: Endpoint returning HTML instead of JSON');
            console.log('   This usually means:');
            console.log('   - Route not found (404)');
            console.log('   - Authentication middleware redirecting to login page\n');
        }
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
    }

    // Test 2: Users /all endpoint
    console.log('2️⃣ Testing GET /api/users/all');
    try {
        const response = await fetch(`${API_BASE}/api/users/all`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer mock-token-for-testing`
            }
        });

        console.log(`   Status: ${response.status}`);
        const text = await response.text();
        console.log(`   Response (first 200 chars): ${text.substring(0, 200)}\n`);

        if (text.startsWith('<!DOCTYPE')) {
            console.log('   ❌ ERROR: Endpoint returning HTML instead of JSON\n');
        }
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
    }

    // Test 3: Check if routes are mounted
    console.log('3️⃣ Testing base routes');
    console.log('   GET /api/builder - should return 404 or method not allowed');
    try {
        const response = await fetch(`${API_BASE}/api/builder`);
        console.log(`   Status: ${response.status}\n`);
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
    }

    process.exit(0);
}

testAdminEndpoints();
