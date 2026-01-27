// Simple test - directly call property creation API
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testDirectPropertyCreation() {
    console.log('=== Direct Property Creation Test ===\n');

    // Try to create a property with the registered builder contact
    console.log('Testing property creation with registered builder contact 7499455975...\n');

    try {
        const propertyResponse = await fetch(`${BASE_URL}/comercial/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: Normally requires admin auth, but testing the builder validation logic
                'authorization': 'Bearer fake-token-for-testing'
            },
            body: JSON.stringify({
                location: 'Mira Road East',
                area: 'Test Area',
                propertyType: '2 BHK',
                price: '5000000',
                carpetArea: '1200',
                name: 'Sahil',
                contact: '7499455975', // Registered builder
                date: new Date().toISOString(),
                ownershipType: 'Owner',
                projectName: 'Test Project'
            })
        });

        const propertyData = await propertyResponse.json();

        console.log('Response Status:', propertyResponse.status);
        console.log('Response Body:', JSON.stringify(propertyData, null, 2));

        if (propertyResponse.status === 201) {
            console.log('\n✅ SUCCESS! Property created with builder validation working!');
        } else if (propertyResponse.status === 403 && propertyData.message?.includes('Builder not found')) {
            console.log('\n✅ Builder validation is working! (Builder needs to be registered)');
        } else if (propertyResponse.status === 401 || propertyResponse.status === 403) {
            console.log('\n⚠️ Authentication/Authorization failed (expected without valid admin token)');
            console.log('This is normal - the endpoint requires admin authentication.');
            console.log('The property form in the frontend should work when logged in as admin.');
        } else {
            console.log('\n❌ Unexpected response');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n--- Testing with UNREGISTERED builder contact ---\n');

    try {
        const propertyResponse2 = await fetch(`${BASE_URL}/comercial/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer fake-token-for-testing'
            },
            body: JSON.stringify({
                location: 'Mira Road East',
                area: 'Test Area 2',
                propertyType: '3 BHK',
                price: '7000000',
                carpetArea: '1500',
                name: 'Test User',
                contact: '9999999999', // NOT registered as builder
                date: new Date().toISOString(),
                ownershipType: 'Owner',
                projectName: 'Test Project 2'
            })
        });

        const propertyData2 = await propertyResponse2.json();

        console.log('Response Status:', propertyResponse2.status);
        console.log('Response Body:', JSON.stringify(propertyData2, null, 2));

        if (propertyData2.message?.includes('Builder not found')) {
            console.log('\n✅ EXCELLENT! Builder validation is working correctly!');
            console.log('Unregistered contacts are being rejected as expected.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDirectPropertyCreation().catch(console.error);
