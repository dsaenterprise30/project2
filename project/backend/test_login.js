import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('Testing login with credentials:');
    console.log('Mobile: +917021062721');
    console.log('Password: admin@123\n');

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobileNumber: '+917021062721',
                password: 'admin@123'
            })
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('User data:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ LOGIN FAILED');
            console.log('Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }

    process.exit(0);
}

testLogin();
