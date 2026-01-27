import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testAddBuilder() {
    console.log('🧪 Testing Add User (Builder) Endpoint\n');

    const testBuilder = {
        fullName: "Test Builder",
        mobileNumber: "+919999888877",
        password: "test123456"
    };

    console.log('Testing POST /api/builder/create');
    console.log('Data:', JSON.stringify(testBuilder, null, 2));
    console.log('');

    try {
        const response = await fetch(`${API_BASE}/api/builder/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBuilder)
        });

        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);

        const contentType = response.headers.get('content-type');
        console.log(`Content-Type: ${contentType}\n`);

        const text = await response.text();

        if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
            console.log('❌ ERROR: Receiving HTML instead of JSON!');
            console.log('Response preview:', text.substring(0, 300));
            console.log('\nThis means the route is not found or misconfigured.');
        } else {
            console.log('✅ Response (JSON):');
            try {
                const json = JSON.parse(text);
                console.log(JSON.stringify(json, null, 2));
            } catch (e) {
                console.log('Raw text:', text);
            }
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }

    process.exit(0);
}

testAddBuilder();
