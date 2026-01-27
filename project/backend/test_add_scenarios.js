import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testAddBuilderWithDetails() {
    console.log('🧪 Testing Add Builder with Different Scenarios\n');

    // Test 1: Without +91 prefix (like the form does)
    console.log('Test 1: Mobile without +91 prefix');
    const test1 = {
        fullName: "John Doe",
        mobileNumber: "9876543210",
        password: "test123456"
    };

    try {
        const response = await fetch(`${API_BASE}/api/builder/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test1)
        });

        console.log(`Status: ${response.status}`);
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
        console.log('');
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Test 2: With +91 prefix (like admin dashboard adds)
    console.log('Test 2: Mobile with +91 prefix');
    const test2 = {
        fullName: "Jane Smith",
        mobileNumber: "+919876543211",
        password: "test123456"
    };

    try {
        const response = await fetch(`${API_BASE}/api/builder/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test2)
        });

        console.log(`Status: ${response.status}`);
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }

    process.exit(0);
}

testAddBuilderWithDetails();
