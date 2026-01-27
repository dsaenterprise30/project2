// Test script to register a builder and add a property
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testPropertyCreation() {
    console.log('=== Testing Property Creation ===\n');

    // Step 1: Register builder (if not exists)
    console.log('1. Registering builder with contact 7499455975...');
    try {
        const registerResponse = await fetch(`${BASE_URL}/builder/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Sahil',
                mobileNumber: '7499455975',
                password: 'test123'
            })
        });

        const registerData = await registerResponse.json();
        console.log('Registration response:', JSON.stringify(registerData, null, 2));

        if (registerResponse.ok) {
            console.log('✅ Builder registered successfully!\n');
        } else {
            console.log('⚠️ Registration response (may already exist):', registerData.message, '\n');
        }
    } catch (error) {
        console.error('❌ Error registering builder:', error.message, '\n');
    }

    // Step 2: Get admin token
    console.log('2. Logging in as admin...');
    let adminToken = null;
    try {
        const loginResponse = await fetch(`${BASE_URL}/users/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobileNumber: '917021062721', // Admin number from .env
                password: '159357' // Admin password from .env
            })
        });

        const loginData = await loginResponse.json();
        if (loginResponse.ok && loginData.token) {
            adminToken = loginData.token;
            console.log('✅ Admin logged in successfully!\n');
        } else {
            console.log('⚠️ Could not log in as admin. Error:', loginData.message);
            console.log('Please manually set admin credentials or use existing token.\n');
        }
    } catch (error) {
        console.error('❌ Error logging in:', error.message, '\n');
    }

    // Step 3: Add a commercial property
    if (adminToken) {
        console.log('3. Adding commercial property...');
        try {
            const propertyResponse = await fetch(`${BASE_URL}/comercial/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    location: 'Mira Road East',
                    area: 'Test Area',
                    propertyType: '2 BHK',
                    price: '5000000',
                    carpetArea: '1200',
                    name: 'Sahil',
                    contact: '7499455975',
                    date: new Date().toISOString(),
                    ownershipType: 'Owner',
                    projectName: 'Test Project'
                })
            });

            const propertyData = await propertyResponse.json();
            console.log('Property creation response:', JSON.stringify(propertyData, null, 2));

            if (propertyResponse.ok) {
                console.log('\n✅ Property added successfully!');
            } else {
                console.log('\n❌ Failed to add property:', propertyData.message);
            }
        } catch (error) {
            console.error('❌ Error adding property:', error.message);
        }
    } else {
        console.log('\n⚠️ Skipping property creation (no admin token)');
        console.log('Manual test: Use the frontend with admin login to add property.');
    }
}

// Run the test
testPropertyCreation().catch(console.error);
